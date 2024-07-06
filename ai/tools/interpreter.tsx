import { useState, useEffect } from "react";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { createRunnableUI } from "@/utils/server";
import { z } from "zod";
import { v4 as uuidv4 } from 'uuid';

const results: { [key: string]: string } = {};

// EventHandler class to handle assistant events
class EventHandler {
  thread_id: string;
  result: string;

  constructor(thread_id: string) {
    this.thread_id = thread_id;
    this.result = "";
  }

  onTextCreated(text: any): void {
    this.result += text.value; // Convert Text object to string
  }

  onTextDelta(delta: any, snapshot: any): void {
    this.result += delta.value;
  }

  onToolCallCreated(tool_call: any): void {
    this.result += `\nassistant > ${tool_call.type}\n`;
  }

  onToolCallDelta(delta: any, snapshot: any): void {
    if (delta.type === "code_interpreter") {
      if (delta.code_interpreter.input) {
        this.result += delta.code_interpreter.input;
      }
      if (delta.code_interpreter.outputs) {
        this.result += `\n\noutput >`;
        delta.code_interpreter.outputs.forEach((output: any) => {
          if (output.type === "logs") {
            this.result += `\n${output.logs}`;
          }
        });
      }
    }
  }

  saveResult(): void {
    results[this.thread_id] = this.result;
  }
}

// Define the schema for input validation
const threadSchema = z.object({
  thread_id: z.string().describe("The ID of the thread"),
});

// Functions to simulate the REST API functionality

async function createAssistant() {
  const assistantId = uuidv4();
  return { assistant_id: assistantId };
}

async function startConversation() {
  const threadId = uuidv4();
  return { thread_id: threadId };
}

async function addMessage(input: { thread_id: string; content: string }) {
  const messageId = uuidv4();
  return { message_id: messageId };
}

async function runAssistant(input: { thread_id: string; assistant_id: string }) {
  const eventHandler = new EventHandler(input.thread_id);
  // Simulate the streaming process
  await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate delay
  eventHandler.onTextDelta({ value: "Sample response from assistant." }, {});
  eventHandler.saveResult();
  return { status: "completed" };
}

async function getResult(input: { thread_id: string }) {
  const result = results[input.thread_id] || "No result found";
  return { result };
}

// Define the tool to handle assistant operations
const createAssistantTool = new DynamicStructuredTool({
  name: "create_assistant",
  description: "A tool to create an assistant",
  schema: z.object({}),
  func: async (input, config) => {
    const data = await createAssistant();
    return JSON.stringify(data, null, 2);
  },
});

const startConversationTool = new DynamicStructuredTool({
  name: "start_conversation",
  description: "A tool to start a conversation (create a thread)",
  schema: z.object({}),
  func: async (input, config) => {
    const data = await startConversation();
    return JSON.stringify(data, null, 2);
  },
});

const addMessageTool = new DynamicStructuredTool({
  name: "add_message",
  description: "A tool to add a message to the thread",
  schema: z.object({
    thread_id: z.string(),
    content: z.string(),
  }),
  func: async (input, config) => {
    const data = await addMessage(input);
    return JSON.stringify(data, null, 2);
  },
});

const runAssistantTool = new DynamicStructuredTool({
  name: "run_assistant",
  description: "A tool to run the assistant on the thread and stream the response",
  schema: threadSchema.extend({
    assistant_id: z.string(),
  }),
  func: async (input, config) => {
    const data = await runAssistant(input);
    return JSON.stringify(data, null, 2);
  },
});

const getResultTool = new DynamicStructuredTool({
  name: "get_result",
  description: "A tool to get the result of the message",
  schema: threadSchema,
  func: async (input, config) => {
    const data = await getResult(input);
    return JSON.stringify(data, null, 2);
  },
});

export { createAssistantTool, startConversationTool, addMessageTool, runAssistantTool, getResultTool };
