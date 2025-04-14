import { v4 as uuid } from "uuid";

import "server-only";

const getComfyuiUrl = () => {
  const comfyuiUrl = process.env.COMFYUI_URL;
  if (!comfyuiUrl) {
    throw new Error("COMFYUI_URL is not set");
  }
  return comfyuiUrl;
};

const openWebSocket = () => {
  const comfyuiUrl = getComfyuiUrl();
  const clientId = uuid().replace(/-/g, "");
  const wsUrl = new URL(`ws?clientId=${clientId}`, comfyuiUrl);
  console.log("WebSocket URL:", wsUrl.toString());
  wsUrl.protocol = wsUrl.protocol === "http:" ? "ws:" : "wss:";
  const ws = new WebSocket(wsUrl.toString());
  return { ws, clientId };
};

const queuePrompt = async (clientId: string, workflow: Record<string, any>) => {
  const comfyuiUrl = getComfyuiUrl();
  console.log("queuePrompt url:", `${comfyuiUrl}/prompt`);
  console.log("queuePrompt clientId:", clientId);
  const response = await fetch(`${comfyuiUrl}/prompt`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: workflow,
      client_id: clientId,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to queue prompt");
  }
  const responseData = await response.json();
  return responseData.prompt_id;
};

const trackProgress = async (
  ws: WebSocket,
  promptId: string,
  workflow: Record<string, any>
) => {
  const nodeIds = Object.keys(workflow);
  const finishedNodes = new Set();

  return new Promise((resolve, reject) => {
    ws.onopen = () => {
      console.log("WebSocket connection opened");
    };

    ws.onmessage = (event) => {
      console.log("WebSocket message received:", event.data);
      const message = JSON.parse(event.data);
      if (message.type === "progress") {
        const data = message.data;
        const currentStep = data.value;
        console.log("In K-Sampler -> Step:", currentStep, " of: ", data.max);
      } else if (message.type === "execution_cached") {
        const data = message.data;
        for (const node in data.nodes) {
          if (!(node in finishedNodes)) {
            finishedNodes.add(node);
            console.log(
              "Progress: ",
              finishedNodes.size,
              "/",
              nodeIds.length,
              " Tasks done"
            );
          }
        }
      } else if (message.type === "executing") {
        const data = message.data;
        if (!(data.node in finishedNodes)) {
          finishedNodes.add(data.node);
          console.log(
            "Executing progress: ",
            finishedNodes.size,
            "/",
            nodeIds.length,
            " Tasks done"
          );
        }

        if (
          !data.node &&
          finishedNodes.size === nodeIds.length &&
          data.prompt_id === promptId
        ) {
          debugger;
          resolve(void 0);
          ws.close();
          console.log("Prompt execution completed");
          return;
        }
      } else if (message.type === "status") {
        const {
          status: {
            exec_info: { queue_remaining },
          },
        } = message.data;
        //: {"exec_info": {"queue_remaining": 0}}

        if (queue_remaining === 0) {
          console.log("All tasks completed");
          resolve(void 0);
          ws.close();
          return;
        } else if (queue_remaining > 0) {
          console.log(`${queue_remaining} tasks remaining in the queue`);
        }
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      reject(error);
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed");
    };
  });
};

const getHistory = async (promptId: string) => {
  const comfyuiUrl = getComfyuiUrl();
  const response = await fetch(`${comfyuiUrl}/history?prompt_id=${promptId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch history");
  }
  const history = await response.json();
  return history[promptId];
};

const getImage = async (filename: string, subfolder: string, type: string) => {
  const comfyuiUrl = getComfyuiUrl();
  const response = await fetch(
    `${comfyuiUrl}/view?filename=${filename}&subfolder=${subfolder}&type=${type}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch image");
  }
  const imageBlob = await response.blob();
  return await imageBlob.arrayBuffer();
};

export const generateImageByPrompt = async (workflow: Record<string, any>) => {
  const { ws, clientId } = openWebSocket();
  const promptId = await queuePrompt(clientId, workflow);
  await trackProgress(ws, promptId, workflow);
  const history = await getHistory(promptId);
  const images = [];
  for (const output of Object.values(history.outputs)) {
    for (const image of (output as any).images || []) {
      const filename = image.filename;
      const subfolder = image.subfolder;
      const type = image.type;

      const imageData = await getImage(filename, subfolder, type);
      if (imageData) {
        images.push(imageData);
      }
    }
  }
  return images;
};
