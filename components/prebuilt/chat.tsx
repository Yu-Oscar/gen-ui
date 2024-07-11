"use client";

import { useState, useRef, useEffect } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { EndpointsContext } from "@/app/agent";
import { useActions } from "@/utils/client";
import { LocalContext } from "@/app/shared";
import { HumanMessageText } from "./message";
import { Paperclip, FileText, Image, Video, ArrowUp } from "lucide-react";

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
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState("ChatGPT 4o");

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

  return (
    <div className="w-full h-screen max-h-dvh flex flex-col gap-4 mx-auto rounded-lg p-3 shadow-sm">
      <header className="px-4 relative">
        <div className="relative inline-block text-left">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-black text-white text-sm font-medium hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            id="options-menu"
            aria-haspopup="true"
            aria-expanded="true"
          >
            {selectedOption}
            <svg className="-mr-1 ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>

          {dropdownOpen && (
            <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-black ring-1 ring-black ring-opacity-5 focus:outline-none" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
              <div className="py-1" role="none">
                <button
                  className="block px-4 py-2 text-sm text-white hover:bg-gray-700"
                  role="menuitem"
                  onClick={() => {
                    setSelectedOption("GPT-4o");
                    setDropdownOpen(false);
                  }}
                >
                  GPT-4o
                  <span className="block text-xs text-gray-400">Newest and most advanced model</span>
                </button>
                <button
                  className="block px-4 py-2 text-sm text-white hover:bg-gray-700"
                  role="menuitem"
                  onClick={() => {
                    setSelectedOption("GPT-4");
                    setDropdownOpen(false);
                  }}
                >
                  GPT-4
                  <span className="block text-xs text-gray-400">Advanced model for complex tasks</span>
                </button>
                <button
                  className="block px-4 py-2 text-sm text-white hover:bg-gray-700"
                  role="menuitem"
                  onClick={() => {
                    setSelectedOption("GPT-3.5");
                    setDropdownOpen(false);
                  }}
                >
                  GPT-3.5
                  <span className="block text-xs text-gray-400">Great for everyday tasks     </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </header>
      
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
        className="flex flex-row gap-2 container w-[80%] bg-transparent"
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
              }
            }}
          />
        </label>
        <Input
          placeholder="Enter your question"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="rounded-xl"
        />
        
        <Button type="submit" className="rounded-xl" disabled={submitLock || input.trim() === ""}>
          <ArrowUp />
        </Button>
      </form>
    </div>
  );
}
