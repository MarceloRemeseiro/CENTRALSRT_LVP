"use client"
import { useEffect, useState } from 'react';

export default function DevicesPage() {
  const [devices, setDevices] = useState([]);

  useEffect(() => {
    fetch('/api/devices')
      .then(response => response.json())
      .then(data => setDevices(data));
  }, []);

  return (
    <div>
      <h1>Dispositivos</h1>
      <table className="table-auto border-collapse border border-gray-400 w-full">
        <thead>
          <tr className="bg-gray-200 text-black">
            <th className="border border-gray-400 px-4 py-2">Device ID</th>
            <th className="border border-gray-400 px-4 py-2">IP Address</th>
            <th className="border border-gray-400 px-4 py-2">SRT Asignado</th>
            <th className="border border-gray-400 px-4 py-2">Estado</th>
          </tr>
        </thead>
        <tbody>
          {devices.map((device) => (
            <tr key={device.id}>
              <td className="border border-gray-400 px-4 py-2">{device.device_id}</td>
              <td className="border border-gray-400 px-4 py-2">{device.ip_address}</td>
              <td className="border border-gray-400 px-4 py-2">{device.assigned_srt || 'Ninguno'}</td>
              <td className="border border-gray-400 px-4 py-2">{device.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
