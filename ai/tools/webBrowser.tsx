import { DallEAPIWrapper } from "@langchain/openai";
import { z } from "zod";
import { Web, WebLoading } from "@/components/prebuilt/web";
import { createRunnableUI } from "@/utils/server";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { WebBrowser } from "langchain/tools/webbrowser";

export const webBrowserSchema = z.object({
  url: z.string().describe("The valid URL including protocol"),
  description: z.string().describe("what you want to find on the page or empty string for a summary")
});

export async function webBrowserData(input: z.infer<typeof webBrowserSchema>) {
  try {
    const browser = new WebBrowser({
      model: new ChatOpenAI({ temperature: 0 }),
      embeddings: new OpenAIEmbeddings({}),
    });
    const result = await browser.invoke(
      `${input.url}, ${input.description}`);
    return {
      result
    };
  } catch (error) {
    console.error("Error in webBrowserData:", error);
    throw error; // Re-throw the error if you want it to be handled further up the call stack
  }
}

export const webBrowserTool = new DynamicStructuredTool({
  name: "webBrowser",
  description: "find something on or summarize a webpage",
  schema: webBrowserSchema,
  func: async (input, config) => {
    const stream = await createRunnableUI(config, 
      <WebLoading />
    );
    try {
      const data = await webBrowserData(input);
      stream.done(
        <Web {...data} />
      );
      return JSON.stringify(data, null, 2);
    } catch (error) {
      stream.done(
        <span>error</span>
      );
      return JSON.stringify({ error: error }, null, 2);
    }
  },
});
