"use client";

import { useState, useRef, useEffect } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { EndpointsContext } from "@/app/agent";
import { useActions } from "@/utils/client";
import { LocalContext } from "@/app/shared";
import { HumanMessageText } from "./message";
import { Image, ArrowUp  } from "lucide-react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ModelDropdown from "../ui/ModelDropdown";
import CodeChat from "./chat2";

export interface ChatProps {}

function convertFileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result as string;
      resolve(base64String.split(",")[1]); // Remove the data URL prefix
    };
    reader.onerror = (error) => {
      reject(error);
    };
    reader.readAsDataURL(file);
  });
}

function FileUploadMessage({ file }: { file: File }) {
  return (
    <div className="flex w-full max-w-fit ml-auto">
      <p>File uploaded: {file.name}</p>
    </div>
  );
}

export default function Chat() {
  const actions = useActions<typeof EndpointsContext>();

  const [elements, setElements] = useState<JSX.Element[]>([]);
  const [history, setHistory] = useState<[role: string, content: string][]>([]);
  const [input, setInput] = useState("");
  const [selectedFile, setSelectedFile] = useState<File>();
  const [submitLock, setSubmitLock] = useState(false);

  const ulRef = useRef<HTMLUListElement>(null);

  async function onSubmit(input: string) {
    if (submitLock || input.trim() === "") {
      return;
    }

    setSubmitLock(true);

    const newElements = [...elements];
    let base64File: string | undefined = undefined;
    let fileExtension = selectedFile?.type.split("/")[1];
    if (selectedFile) {
      base64File = await convertFileToBase64(selectedFile);
    }

    const element = await actions.agent({
      input,
      chat_history: history,
      file:
        base64File && fileExtension
          ? {
              base64: base64File,
              extension: fileExtension,
            }
          : undefined,
    });

    newElements.push(
      <li key={`user-${Date.now()}`}>
        {selectedFile && <FileUploadMessage file={selectedFile} />}
        <HumanMessageText content={input} />
      </li>
    );

    newElements.push(
      <li key={`agent-${Date.now()}`} className="flex flex-col gap-1 w-full max-w-fit mr-auto">
        {element.ui}
      </li>
    );

    // consume the value stream to obtain the final value
    // after which we can append to our chat history state
    (async () => {
      let lastEvent = await element.lastEvent;
      if (typeof lastEvent === "object") {
        if (lastEvent["invokeModel"]["result"]) {
          setHistory((prev) => [
            ...prev,
            ["user", input],
            ["assistant", lastEvent["invokeModel"]["result"]],
          ]);
        } else if (lastEvent["invokeTools"]) {
          setHistory((prev) => [
            ...prev,
            ["user", input],
            [
              "assistant",
              `Tool result: ${JSON.stringify(lastEvent["invokeTools"]["toolResult"], null)}`,
            ],
          ]);
        } else {
          console.log("ELSE!", lastEvent);
        }
      }
    })().then(() => {
      setSubmitLock(false);
    });

    setElements(newElements);
    setInput("");
    setSelectedFile(undefined);
  }

  useEffect(() => {
    if (ulRef.current) {
      const observer = new MutationObserver(() => {
        ulRef.current!.scrollTop = ulRef.current!.scrollHeight;
      });

      observer.observe(ulRef.current, {
        childList: true,
        subtree: true,
      });

      // Clean up the observer on component unmount
      return () => {
        observer.disconnect();
      };
    }
  }, [ulRef]);

  const [model, setModel] = useState('GPT-4o');

  return (
    <div className="w-full h-screen max-h-dvh flex flex-col gap-4 mx-auto rounded-lg p-3 shadow-sm">
      <ToastContainer 
        autoClose={1000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        pauseOnHover
        theme="dark"
      />

      <ModelDropdown model={model} setModel={setModel} />
      {model === 'GPT-4o' && (
        <>
        <LocalContext.Provider value={onSubmit} >
          <ul className="flex flex-col w-[80%] gap-1 mt-auto mx-auto overflow-y-auto hide-scrollbar" ref={ulRef}>
            {elements}
          </ul>
        </LocalContext.Provider>
        
        <form
          onSubmit={async (e) => {
            e.stopPropagation();
            e.preventDefault();
            await onSubmit(input);
          }}
          className="flex flex-row gap-2 container w-[80%] bg-transparent items-end"
        >
          <label className="flex items-center cursor-pointer">
            <Image />
            <Input
              disabled={submitLock}
              id="image"
              type="file"
              accept="image/*"
              className="w-0 p-0 m-0"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  setSelectedFile(e.target.files[0]);
                  toast.success("Image uploaded");
                }
              }}
            />
          </label>
          <div className="w-full">
          {selectedFile && (
            <span className="ml-2 text-sm text-gray-500 mb-1">File is selected: {selectedFile.name}</span>
          )}
          <Input
            placeholder="Enter your question"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="rounded-xl"
          />
          </div>
          
          <Button type="submit" className="rounded-xl" disabled={submitLock || input.trim() === ""}>
            <ArrowUp />
          </Button>
        </form>
      </>
    )}
      {model === 'code' && <CodeChat />}
    </div>
  );
}