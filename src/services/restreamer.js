// src/services/restreamer.js
import axios from "axios";
import https from "https";

const RESTREAMER_API_URL = "https://lvp.streamingpro.es";
const RESTREAMER__URL = "lvp.streamingpro.es";
const port = "6001";
const RESTREAMER_USERNAME = "admin";
const RESTREAMER_PASSWORD = "Fandroid2024";

let accessToken = null;
let refreshToken = null;
let isRefreshing = false;

const httpsAgent = new https.Agent({
  rejectUnauthorized: false, // Ignora errores de certificado SSL (no recomendado en producción)
});

// Función para obtener un nuevo access token
async function login() {
  try {
    const response = await axios.post(
      `${RESTREAMER_API_URL}/api/login`,
      {
        username: RESTREAMER_USERNAME,
        password: RESTREAMER_PASSWORD,
      },
      { httpsAgent }
    );
    accessToken = response.data.access_token;
    refreshToken = response.data.refresh_token;
  } catch (error) {
    console.error("Error al obtener el access token:", error.message);
    throw error;
  }
}

// Función para refrescar el access token
async function refreshAccessToken() {
  if (isRefreshing) {
    // Si ya estamos refrescando el token, esperar a que termine
    return new Promise((resolve, reject) => {
      const interval = setInterval(() => {
        if (!isRefreshing) {
          clearInterval(interval);
          resolve();
        }
      }, 500);
    });
  }

  isRefreshing = true;
  try {
    const response = await axios.post(
      `${RESTREAMER_API_URL}/api/refresh`,
      {
        refresh_token: refreshToken,
      },
      { httpsAgent }
    );
    accessToken = response.data.access_token;
    refreshToken = response.data.refresh_token;
  } catch (error) {
    console.error("Error al refrescar el access token:", error.message);
    // Si falla el refresco, volver a hacer login
    await login();
  } finally {
    isRefreshing = false;
  }
}

// Función para hacer solicitudes autenticadas
async function authenticatedRequest(method, url, data = null) {
  if (!accessToken) {
    await login();
  }

  try {
    const response = await axios({
      method,
      url: `${RESTREAMER_API_URL}${url}`,
      data,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      httpsAgent,
    });
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      // Token expirado, refrescar y reintentar
      await refreshAccessToken();
      // Reintentar la solicitud con el nuevo token
      const response = await axios({
        method,
        url: `${RESTREAMER_API_URL}${url}`,
        data,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        httpsAgent,
      });
      return response.data;
    } else {
      console.error("Error en la solicitud autenticada:", error.message);
      throw error;
    }
  }
}

// Función de prueba para obtener los procesos
export async function restreamerAPIConnection() {
  try {
    const data = await authenticatedRequest("GET", "/api/v3/process");

    // Primera pasada: procesamos los inputs de tipo 'ingest'
    const inputs = data.reduce((acc, process) => {
      if (
        process.type === "ffmpeg" &&
        process.id.includes(":ingest:") &&
        !process.id.includes("_snapshot")
      ) {
        const streamId = process.reference;

        const inputInfo = {
          id: process.id,
          name: process.metadata?.["restreamer-ui"]?.meta?.name || "Sin nombre",
          description:
            process.metadata?.["restreamer-ui"]?.meta?.description ||
            "Sin descripción",
          createdAt: process.created_at,
          createdAtFormatted: new Date(
            process.created_at * 1000
          ).toLocaleString(),
          streamId: streamId,
          state: process.state?.exec || "Desconocido",
          defaultOutputs: {
            SRT: `srt://${RESTREAMER__URL}:${port}/?mode=caller&transtype=live&streamid=${streamId},mode:request`,
            RTMP: `rtmp://${RESTREAMER__URL}/${streamId}.stream`,
            HLS: `https://${RESTREAMER__URL}/memfs/${streamId}.m3u8`,
            HTML: `https://${RESTREAMER__URL}/${streamId}.html`,
          },

          customOutputs: [], // Inicializamos vacío para luego añadir los outputs
        };
        acc.push(inputInfo);
      }
      return acc;
    }, []);

    // Segunda pasada: procesamos los outputs de tipo 'egress' y los añadimos al input correspondiente
    data.forEach((process) => {
      if (process.id.includes(":egress:")) {
        // Buscar el input correspondiente usando el 'reference' del egress
        const parentInput = inputs.find(
          (input) => input.streamId === process.reference
        );

        if (parentInput) {
          // Extraer información del output
          const outputInfo = {
            id: process.id,
            name: process.metadata?.["restreamer-ui"]?.name || "Sin nombre",
            address:process.config?.output?.[0]?.address || "Dirección no disponible",
            state: process.state?.exec || "Desconocido",
            order: process.state?.order || "Desconocido",
            key: process.config?.output?.[0]?.options?.[13] || "--", // Validación para evitar errores
          };

          // Añadir el output al input correspondiente
          parentInput.customOutputs.push(outputInfo);
        } else {
          console.warn(
            `No se encontró input para el output con reference ${process.reference}`
          );
        }
      }
    });

    return inputs;
  } catch (error) {
    console.error(
      "Error al conectarse con la API de Restreamer:",
      error.message
    );
    throw error;
  }
}

export { authenticatedRequest };
