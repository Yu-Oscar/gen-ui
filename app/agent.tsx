import { agentExecutor } from "@/ai/graph";
import { exposeEndpoints, streamRunnableUI } from "@/utils/server";
import { HumanMessage, AIMessage } from "@langchain/core/messages";

const convertChatHistoryToMessages = (
  chat_history: [role: string, content: string][],
) => {
  return chat_history.map(([role, content]) => {
    switch (role) {
      case "human":
        return new HumanMessage(content);
      case "assistant":
      case "ai":
        return new AIMessage(content);
      default:
        return new HumanMessage(content);
    }
  });
};

function processFile(input: {
  input: string;
  chat_history: [role: string, content: string][];
  files?: {
    base64: string;
    extension: string;
  }[];
}) {
  const messages = convertChatHistoryToMessages(input.chat_history);

  if (input.files) {
    input.files.forEach(file => {
      const imageTemplate = new HumanMessage({
        content: [
          {
            type: "image_url",
            image_url: {
              url: `data:image/${file.extension};base64,${file.base64}`,
            },
          },
        ],
      });
      messages.push(imageTemplate);
    });
  }

  return {
    input: input.input,
    chat_history: messages,
  };
}

async function agent(inputs: {
  input: string;
  chat_history: [role: string, content: string][];
  files?: {
    base64: string;
    extension: string;
  }[];
}) {
  "use server";
  const processedInputs = processFile(inputs);

  return streamRunnableUI(agentExecutor(), processedInputs);
}

export const EndpointsContext = exposeEndpoints({ agent });