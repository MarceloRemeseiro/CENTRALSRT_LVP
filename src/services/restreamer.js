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

    const processedData = data.reduce((acc, process) => {
      if (
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
          createdAt: process.created_at, // Guardamos el timestamp sin formatear
          createdAtFormatted: new Date(
            process.created_at * 1000
          ).toLocaleString(), // Versión formateada para mostrar
          streamId: streamId,
          state: process.state?.exec || "Desconocido",
          defaultOutputs: {
            HLS: `https://${RESTREAMER__URL}/memfs/${streamId}.m3u8`,
            SRT: `srt://${RESTREAMER__URL}:${port}/?mode=caller&transtype=live&streamid=${streamId},mode:request`,
            RTMP: `rtmp://${RESTREAMER__URL}/${streamId}.stream`,
            HTML: `https://${RESTREAMER__URL}/${streamId}.html`,
          },
          customOutputs: [],
        };

        // Buscar los outputs personalizados
        data.forEach((potentialOutput) => {
          if (
            potentialOutput.id.includes(":egress:") &&
            potentialOutput.reference === streamId
          ) {
            const address =
              potentialOutput.config?.output?.[0]?.address ||
              "Dirección no disponible";
            const outputInfo = {
              name:
                potentialOutput.metadata?.["restreamer-ui"]?.name ||
                "Sin nombre",
              address: address,
              state: potentialOutput.state?.exec || "Desconocido",
            };

            // Si la dirección es RTMP, añadir la clave
            if (address.toLowerCase().includes("rtmp")) {
              outputInfo.key =
                potentialOutput.metadata?.["restreamer-ui"]?.outputs?.[0]
                  ?.options?.[5] || "--";
            }

            inputInfo.customOutputs.push(outputInfo);
          }
        });

        acc.push(inputInfo);
      }
      return acc;
    }, []);

    // Ordenar los datos por fecha de creación (de más reciente a más antiguo)
    processedData.sort((a, b) => b.createdAt - a.createdAt);

    return processedData;
  } catch (error) {
    console.error(
      "Error al conectarse con la API de Restreamer:",
      error.message
    );
    throw error;
  }
}
export { authenticatedRequest };
