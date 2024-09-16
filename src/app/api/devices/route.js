import { NextResponse } from "next/server";
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request) {
  try {
    const text = await request.text();
    console.log("Received request body:", text);

    let data;
    try {
      data = JSON.parse(text);
    } catch (error) {
      console.error("Error parsing JSON:", error);
      return NextResponse.json({ message: "Invalid JSON format" }, { status: 400 });
    }

    const { device_id, ip_address } = data;
    
    // Validar que los campos requeridos estén presentes
    if (!device_id || !ip_address) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    const device = await prisma.device.upsert({
      where: { device_id: device_id },
      update: { 
        ip_address: ip_address,
        status: 'ONLINE'
      },
      create: { 
        device_id: device_id, 
        ip_address: ip_address,
        status: 'ONLINE'
      },
    })

    return NextResponse.json(device, { status: 200 })
  } catch (error) {
    console.error("Error registering device:", error)
    return NextResponse.json({ message: "Error registering device", error: error.message }, { status: 500 })
  }
}

export async function GET() {
  try {
    const devices = await prisma.device.findMany()
    return NextResponse.json(devices, { status: 200 })
  } catch (error) {
    console.error("Error fetching devices:", error)
    return NextResponse.json({ message: "Error fetching devices", error: error.message }, { status: 500 })
  }
}