import { assistantId } from "@/app/assistant-config";
import { openai } from "@/app/openai";
import { NextRequest } from "next/server";

// upload file to assistant's vector store
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData(); // process file as FormData
    const file = formData.get("file") as File; // retrieve the single file from FormData and cast to File
    const vectorStoreId = await getOrCreateVectorStore(); // get or create vector store

    if (!file) {
      throw new Error("No file uploaded");
    }

    // upload using the file stream
    const openaiFile = await openai.files.create({
      file: file,
      purpose: "assistants",
    });

    // add file to vector store
    await openai.beta.vectorStores.files.create(vectorStoreId, {
      file_id: openaiFile.id,
    });
    return new Response("File uploaded successfully", { status: 200 });
  } catch (error) {
    console.error("Error uploading file:", error);
    return new Response("File upload failed", { status: 500 });
  }
}

// list files in assistant's vector store
export async function GET() {
  const vectorStoreId = await getOrCreateVectorStore(); // get or create vector store
  const fileList = await openai.beta.vectorStores.files.list(vectorStoreId);

  const filesArray = await Promise.all(
    fileList.data.map(async (file) => {
      const fileDetails = await openai.files.retrieve(file.id);
      const vectorFileDetails = await openai.beta.vectorStores.files.retrieve(
        vectorStoreId,
        file.id
      );
      return {
        file_id: file.id,
        filename: fileDetails.filename,
        status: vectorFileDetails.status,
      };
    })
  );
  return Response.json(filesArray);
}

// delete file from assistant's vector store
export async function DELETE(request:NextRequest) {
  const body = await request.json();
  const fileId = body.fileId;

  const vectorStoreId = await getOrCreateVectorStore(); // get or create vector store
  await openai.beta.vectorStores.files.del(vectorStoreId, fileId); // delete file from vector store

  return new Response();
}

/* Helper functions */

const getOrCreateVectorStore = async () => {
  try {
    const assistant = await openai.beta.assistants.retrieve(assistantId);

    // Check if the assistant already has a vector store and return it
    const vectorStoreIds = assistant.tool_resources?.file_search?.vector_store_ids ?? [];
    if (vectorStoreIds.length > 0) {
      return vectorStoreIds[0];
    }

    // Otherwise, create a new vector store and attach it to the assistant
    const vectorStore = await openai.beta.vectorStores.create({
      name: "sample-assistant-vector-store",
    });
    await openai.beta.assistants.update(assistantId, {
      tool_resources: {
        file_search: {
          vector_store_ids: [vectorStore.id],
        },
      },
    });
    return vectorStore.id;
  } catch (error) {
    console.error("Error getting or creating vector store:", error);
    throw new Error("Failed to get or create vector store");
  }
};