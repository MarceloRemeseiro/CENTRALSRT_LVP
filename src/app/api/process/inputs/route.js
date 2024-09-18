import { NextResponse } from "next/server";
import { restreamerAPIConnection } from "../../../../services/restreamer";

export async function GET() {
  try {
    const data = await restreamerAPIConnection();

    return NextResponse.json(data); // Devuelve los datos obtenidos de la API de Restreamer
  } catch (error) {
    return NextResponse.json(
      { message: "Error al obtener los datos" },
      { status: 500 }
    );
  }
}
