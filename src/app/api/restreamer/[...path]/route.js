import { NextResponse } from "next/server";
import { authenticatedRequest } from "../../../../services/restreamer";

export async function GET(request, { params }) {
  const path = params.path.join("/");

  try {
    const data = await authenticatedRequest("GET", `/api/${path}`);
    console.log(`Datos del endpoint /${path}:`, JSON.stringify(data, null, 2));
    return NextResponse.json(data);
  } catch (error) {
    console.error(
      `Error al obtener datos del endpoint /${path}:`,
      error.message
    );
    return NextResponse.json(
      { error: "Error al obtener datos de Restreamer" },
      { status: 500 }
    );
  }
}
