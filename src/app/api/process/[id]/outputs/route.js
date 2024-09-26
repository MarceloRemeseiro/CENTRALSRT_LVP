import { NextResponse } from "next/server";
import { authenticatedRequest } from "../../../../../services/restreamer";
import { uuid } from "uuidv4";

export async function GET() {
  try {
    const data = await restreamerAPIConnection();
    
    
    return NextResponse.json(data); // Devuelve los datos obtenidos de la API de Restreamer
  } catch (error) {
    return NextResponse.json({ message: "Error al obtener los datos" }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  const { id } = params;
  const { name, address, streamKey } = await request.json();

  try {
    // Eliminar 'restreamer-ui:ingest:' del id si está presente
    const referenceId = id.replace("restreamer-ui:ingest:", "");
    const idAleatorio = uuid();
    const outputId = `restreamer-ui:egress:rtmp:${idAleatorio}`;

    // Crear el nuevo proceso con los parámetros requeridos
    const newOutput = {
      id: outputId,
      type: "ffmpeg",
      reference: referenceId,
      input: [
        {
          id: "input_0",
          address: `{memfs}/${referenceId}.m3u8`,
          options: ["-re"],
        },
      ],
      output: [
        {
          id: "output_0",
          address: address,
          options: [
            "-map",
            "0:0",
            "-codec:v",
            "copy",
            "-map",
            "0:1",
            "-codec:a",
            "copy",
            "-f",
            "flv",
            "-rtmp_enhanced_codecs",
            "hvc1,av01,vp09",
            "-rtmp_playpath",
            streamKey,
            "-rtmp_flashver",
            "FMLE/3.0",
          ],
        },
      ],
      options: ["-loglevel", "level+info", "-err_detect", "ignore_err"],
      reconnect: true,
      reconnect_delay_seconds: 15,
      autostart: false,
      stale_timeout_seconds: 30,
    };

    console.log(
      "Creando proceso en Restreamer API:",
      JSON.stringify(newOutput, null, 2)
    );

    // Crear el proceso
    const createdEgressProcess = await authenticatedRequest(
      "POST",
      "/api/v3/process",
      newOutput
    );

    // Extraer el ID del proceso creado
    const processId = createdEgressProcess.id;

    // Metadata que queremos añadir después de crear el proceso
    const metadata = {
      name: name || "default-name",
      outputs: [
        {
          address: address || "rtmp://default-url",
          options: [
            "-f",
            "flv",
            "-rtmp_enhanced_codecs",
            "hvc1,av01,vp09",
            "-rtmp_playpath",
            streamKey || "default-stream-key",
            "-rtmp_flashver",
            "FMLE/3.0",
          ],
        },
      ],
      settings: {
        address: new URL(address).hostname,
        protocol: "rtmp://",
        options: {
          rtmp_playpath: streamKey || "default-stream-key",
          rtmp_flashver: "FMLE/3.0",
        },
      },
    };

    console.log("Añadiendo metadata:", JSON.stringify(metadata, null, 2));

    // Añadir la metadata usando el endpoint PUT
    await authenticatedRequest(
      "PUT",
      `/api/v3/process/${processId}/metadata/restreamer-ui`,
      metadata
    );

    // Formatear el output final
    const formattedOutput = {
      id: `restreamer-ui:egress:rtmp:${processId}`,
      name: name,
      address: address,
      state: createdEgressProcess.state?.exec || "unknown",
      key: streamKey,
    };

    return NextResponse.json(formattedOutput);
  } catch (error) {
    console.error("Detalles del error:", error.response?.data.details);
    return NextResponse.json(
      {
        error: "Error al agregar el output o la metadata",
        details: error.response?.data || error.message,
      },
      { status: 500 }
    );
  }
}
// Eliminar un output por ID
export async function DELETE(request, { params }) {
  const { id } = params;

  try {
    // Eliminar el prefijo no deseado si está presente en el ID
    console.log(`Eliminando output con ID: ${params}`);

    // Realiza la solicitud DELETE al servidor Restreamer
    const response = await authenticatedRequest(
      "DELETE",
      `/api/v3/process/${id}`
    );

    // Si la eliminación es exitosa
    return NextResponse.json({ message: "Output eliminado con éxito" });
  } catch (error) {
    console.error("Error al eliminar el output:", error);
    return NextResponse.json(
      {
        error: "Error al eliminar el output",
        details: error.response?.data || error.message,
      },
      { status: 500 }
    );
  }
}
