import { NextResponse } from "next/server";
import { authenticatedRequest } from "../../../../../services/restreamer";
import { v4 as uuidv4 } from "uuid";

export async function PUT(request) {
  try {
    const { tipo, nombre, descripcion } = await request.json();

    const referenceId = uuidv4();
    const idAleatorio = `restreamer-ui:ingest:${referenceId}`;
    
    // Estructura básica para un proceso de SRT o RTMP
    const nuevoProceso = {
      id: idAleatorio,
      type: "ffmpeg",
      reference: referenceId,
      input: [
        {
          id: "input_0",
          address: tipo === "SRT" 
            ? `{srt,name=${referenceId}.stream,mode=request}` 
            : `{rtmp,name=${referenceId}.stream}`,
          options: [
            "-fflags", "+genpts", 
            "-thread_queue_size", "512", 
            "-probesize", "5000000", 
            "-analyzeduration", tipo === "SRT" ? "5000000" : "3000000",
            ...(tipo === "RTMP" ? ["-rtmp_enhanced_codecs", "hvc1,av01,vp09"] : [])
          ],
        },
      ],
      output: [
        {
          id: "output_0",
          address: `{memfs}/${referenceId}_{outputid}.m3u8`,
          options: [
            "-dn", "-sn", 
            "-map", "0:0", "-codec:v", "copy",
            "-map", "0:1", "-codec:a", "copy", 
            "-metadata", `title=https://lvp.streamingpro.es/${referenceId}/oembed.json`,
            "-metadata", "service_provider=datarhei-Restreamer", 
            "-f", "hls", 
            "-start_number", "0", 
            "-hls_time", "2", 
            "-hls_list_size", "6",
            "-hls_flags", "append_list+delete_segments+program_date_time+temp_file",
            "-hls_delete_threshold", "4", 
            "-hls_segment_filename", `{memfs}/${referenceId}_{outputid}_%04d.ts`, 
            "-master_pl_name", `${referenceId}.m3u8`, 
            "-master_pl_publish_rate", "2",
            "-method", "PUT"
          ],
        },
      ],
      options: ["-loglevel", "level+info", "-err_detect", "ignore_err", "-y"],
      reconnect: true,
      reconnect_delay_seconds: 15,
      autostart: true,
      stale_timeout_seconds: 30,
      limits: {
        cpu_usage: 0,
        memory_mbytes: 0,
        waitfor_seconds: 5,
      },
    };

    // Hacemos la solicitud autenticada para crear el proceso
    const createdProcess = await authenticatedRequest(
      "POST",
      "/api/v3/process",
      nuevoProceso
    );

    // Después de crear el proceso, ahora enviamos la metadata
    const metadata = {
      "restreamer-ui": {
        meta: {
          name: nombre,
          description: descripcion,
        },
      },
    };

    await authenticatedRequest(
      "POST",
      `/api/v3/process/${createdProcess.id}/metadata`,
      metadata
    );

    // Retornamos la respuesta con la metadata
    return NextResponse.json({
      success: true,
      process: createdProcess,
      metadata,
    });

  } catch (error) {
    console.error("Error creando el proceso:", error);
    return NextResponse.json(
      {
        error: "Error creando el proceso y agregando metadata",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
