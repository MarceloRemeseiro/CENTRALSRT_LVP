import { NextResponse } from "next/server";
import { authenticatedRequest } from "../../../services/restreamer";
import { v4 as uuidv4 } from "uuid";

export async function POST(request) {
  try {
    const { tipo, nombre, descripcion } = await request.json();

    const referenceId = uuidv4();
    const idAleatorio = `restreamer-ui:ingest:${referenceId}`;

    // Estructura para un proceso de SRT
    const nuevoProceso = {
      id: idAleatorio,
      type: "ffmpeg",
      reference: referenceId,
      input: [
        {
          id: "input_0",
          address: `{srt,name=${referenceId}.stream,mode=request}`,
          options: [
            "-fflags",
            "+genpts",
            "-thread_queue_size",
            "512",
            "-probesize",
            "5000000",
            "-analyzeduration",
            "5000000",
          ],
        },
      ],
      output: [
        {
          id: "output_0",
          address: `[f=hls:start_number=0:hls_time=2:hls_list_size=6:hls_flags=append_list+delete_segments+program_date_time+temp_file:hls_delete_threshold=4:hls_segment_filename={memfs}/${referenceId}_{outputid}_%04d.ts:master_pl_name=${referenceId}.m3u8:master_pl_publish_rate=2:method=PUT]{memfs}/${referenceId}_output_0.m3u8|[f=flv]rtmp://localhost:1935/${referenceId}.stream|[f=mpegts]{srt,name=${referenceId},mode=publish}`,
          options: [
            "-dn",
            "-sn",
            "-map",
            "0:1",
            "-codec:v",
            "copy",
            "-map",
            "0:0",
            "-codec:a",
            "copy",
            "-metadata",
            `title=https://lvp.streamingpro.es/${referenceId}/oembed.json`,
            "-metadata",
            "service_provider=datarhei-Restreamer",
            "-flags",
            "+low_delay+global_header",
            "-tag:v",
            "7",
            "-tag:a",
            "10",
            "-f",
            "tee",
          ],
          cleanup: [
            {
              pattern: `memfs:/${referenceId}**`,
              max_files: 0,
              max_file_age_seconds: 0,
              purge_on_delete: true,
            },
            {
              pattern: `memfs:/${referenceId}_{outputid}.m3u8`,
              max_files: 0,
              max_file_age_seconds: 24,
              purge_on_delete: true,
            },
            {
              pattern: `memfs:/${referenceId}_{outputid}_**.ts`,
              max_files: 12,
              max_file_age_seconds: 24,
              purge_on_delete: true,
            },
            {
              pattern: `memfs:/${referenceId}.m3u8`,
              max_files: 0,
              max_file_age_seconds: 24,
              purge_on_delete: true,
            },
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

    // Después de crear el proceso, ahora enviamos la metadata completa
    const metadata = {
      "restreamer-ui": {
        control: {
          hls: {
            cleanup: true,
            lhls: false,
            listSize: 6,
            master_playlist: true,
            segmentDuration: 2,
            storage: "memfs",
            version: 3
          },
          limits: {
            cpu_usage: 0,
            memory_mbytes: 0,
            waitfor_seconds: 5
          },
          process: {
            autostart: true,
            delay: 15,
            low_delay: true,
            reconnect: true,
            staleTimeout: 30
          },
          rtmp: {
            enable: true
          },
          snapshot: {
            enable: true,
            interval: 60
          },
          srt: {
            enable: true
          }
        },
        license: "CC BY 4.0",
        meta: {
          author: {
            description: "",
            name: ""
          },
          description: descripcion,
          name: nombre
        },
        player: {},
        profiles: [
          {
            audio: {
              coder: "copy",
              decoder: {
                coder: "default",
                mapping: {
                  global: [],
                  local: []
                },
                settings: {}
              },
              encoder: {
                coder: "copy",
                mapping: {
                  global: [],
                  local: ["-codec:a", "copy"]
                },
                settings: {}
              },
              filter: {
                graph: "",
                settings: {}
              },
              source: 0,
              stream: 0
            },
            custom: {
              selected: false,
              stream: 0
            },
            video: {
              decoder: {
                coder: "default",
                mapping: {
                  global: [],
                  local: []
                },
                settings: {}
              },
              encoder: {
                coder: "copy",
                mapping: {
                  global: [],
                  local: ["-codec:v", "copy"]
                },
                settings: {}
              },
              filter: {
                graph: "",
                settings: {}
              },
              source: 0,
              stream: 1
            }
          }
        ],
        sources: [
          {
            inputs: [
              {
                address: `{srt,name=${referenceId}.stream,mode=request}`,
                options: [
                  "-fflags",
                  "+genpts",
                  "-thread_queue_size",
                  512,
                  "-probesize",
                  5000000,
                  "-analyzeduration",
                  5000000
                ]
              }
            ],
            settings: {
              address: `{srt,name=${referenceId}.stream,mode=request}`,
              general: {
                analyzeduration: 5000000,
                analyzeduration_http: 20000000,
                analyzeduration_rtmp: 3000000,
                avoid_negative_ts: "auto",
                copyts: false,
                fflags: ["genpts"],
                max_probe_packets: 2500,
                probesize: 5000000,
                start_at_zero: false,
                thread_queue_size: 512,
                use_wallclock_as_timestamps: false
              },
              http: {
                forceFramerate: false,
                framerate: 25,
                http_proxy: "",
                readNative: true,
                referer: "",
                userAgent: ""
              },
              mode: "push",
              password: "",
              push: {
                name: referenceId,
                type: "srt"
              },
              rtsp: {
                stimeout: 5000000,
                udp: false
              },
              username: ""
            },
            streams: [
              {
                bitrate_kbps: 131,
                channels: 2,
                codec: "aac",
                coder: "aac",
                duration_sec: 0,
                format: "mpegts",
                fps: 0,
                height: 0,
                index: 0,
                language: "und",
                layout: "stereo",
                pix_fmt: "",
                sampling_hz: 48000,
                stream: 0,
                type: "audio",
                url: `srt://localhost:6000?mode=caller&transtype=live&latency=20000&streamid=${referenceId}.stream,mode:request`,
                width: 0
              },
              {
                bitrate_kbps: 0,
                channels: 0,
                codec: "h264",
                coder: "h264",
                duration_sec: 0,
                format: "mpegts",
                fps: 59.94,
                height: 1080,
                index: 0,
                language: "und",
                layout: "",
                pix_fmt: "yuv420p",
                sampling_hz: 0,
                stream: 1,
                type: "video",
                url: `srt://localhost:6000?mode=caller&transtype=live&latency=20000&streamid=${referenceId}.stream,mode:request`,
                width: 1920
              }
            ],
            type: "network"
          }
        ],
        streams: [
          {
            channels: 0,
            codec: "h264",
            height: 1080,
            index: 0,
            layout: "",
            pix_fmt: "",
            sampling_hz: 0,
            stream: 0,
            type: "video",
            url: "",
            width: 1920
          },
          {
            channels: 2,
            codec: "aac",
            height: 0,
            index: 0,
            layout: "stereo",
            pix_fmt: "",
            sampling_hz: 48000,
            stream: 1,
            type: "audio",
            url: "",
            width: 0
          }
        ],
        version: "1.13.0"
      }
    };

    await authenticatedRequest(
      "PUT",
      `/api/v3/process/${createdProcess.id}/metadata/restreamer-ui`,
      metadata
    );

    // Retornamos la respuesta con la metadata completa
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
