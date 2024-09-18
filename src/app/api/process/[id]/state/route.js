import { NextResponse } from "next/server";
import { authenticatedRequest } from "../../../../../services/restreamer"; // Asegúrate de tener este servicio configurado

export async function PUT(request, { params }) {
  const { id } = params; // El ID del output viene como parámetro
  const { order } = await request.json(); // Obtenemos el exec y order desde el body de la solicitud
  console.log(order); // Para depuración

  try {
    // Realizamos la solicitud PUT para cambiar el estado en el proceso de la API
    const response = await authenticatedRequest(
      "PUT",
      `/api/v3/process/${id}/command`, // Endpoint de la API de Restreamer
      {
        command: order,
      }
    );

    // Devolvemos la respuesta exitosa si la operación fue bien
    return NextResponse.json({
      message: "Estado del proceso actualizado correctamente",
      response,
    });
  } catch (error) {
    console.error("Error al actualizar el estado del proceso:", error.message);
    return NextResponse.json(
      { message: "Error al actualizar el estado del proceso" },
      { status: 500 }
    );
  }
}
