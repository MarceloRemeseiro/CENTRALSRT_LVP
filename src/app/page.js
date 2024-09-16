'use client'

import React, { useEffect, useState } from 'react';
import { restreamerAPIConnection } from '../services/restreamer';
import InputCard from '../components/InputCard';

export default function Home() {
  const [inputs, setInputs] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await restreamerAPIConnection();
        setInputs(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
    fetchData();
  }, []);

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">StreamingPro Inputs</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {inputs.map((input, index) => (
          <InputCard key={input.id} input={input} index={index + 1} />
        ))}
      </div>
    </main>
  );
}