import React, { useState, useEffect } from "react";
import { Trash2, Loader } from "lucide-react";

const FileViewer = () => {
    const [files, setFiles] = useState([]);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isDeletingID, setIsDeletingID] = useState(null);

    useEffect(() => {
        const interval = setInterval(() => {
            fetchFiles();
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const fetchFiles = async () => {
        const resp = await fetch("/api/assistants/files", {
            method: "GET",
        });
        const data = await resp.json();
        setFiles(data);
    };

    const handleFileDelete = async (fileId) => {
        setIsDeleting(true);
        setIsDeletingID(fileId);
        try {
            const response = await fetch("/api/assistants/files", {
                method: "DELETE",
                body: JSON.stringify({ fileId }),
                headers: {
                    "Content-Type": "application/json"
                }
            });
            if (response.ok) {
                setFiles((prevFiles) => prevFiles.filter(file => file.file_id !== fileId));
            } else {
                console.error("Failed to delete the file");
            }
        } catch (error) {
            console.error("Error deleting the file:", error);
        } finally {
            setIsDeleting(false);
            setIsDeletingID(null);
        }
    };

    const handleFileUpload = async (event) => {
        const data = new FormData();
        if (event.target.files.length < 0) return;
        data.append("file", event.target.files[0]);
        await fetch("/api/assistants/files", {
            method: "POST",
            body: data,
        });
    };

    return (
        <div className="flex flex-col justify-center items-center w-[180px] h-[85%] p-1 bg-gray-700 overflow-hidden rounded-xl fixed left-54 bottom-7">
            <div className={`overflow-y-auto p-2.5 flex flex-col gap-3 items-center w-full ${files.length !== 0 ? "flex-grow" : ""}`}>
                {files.length === 0 ? (
                    <div className="text-lg font-semibold">Attach files to test file search</div>
                ) : (
                    files.map((file) => (
                        <div key={file.file_id} className="flex flex-row items-center justify-between gap-4 p-2 w-full">
                            <div className="flex flex-col w-[100px]">
                                <span className="overflow-hidden whitespace-nowrap text-ellipsis">{file.filename}</span>
                                <span className="text-sm text-gray-400">{file.status}</span>
                            </div>
                            {isDeleting && isDeletingID === file.file_id ? (
                                <Loader className="h-4 w-4 animate-spin pointer-events-none"/>
                            ) : (
                                <Trash2 className="h-4 w-4 cursor-pointer" onClick={() => handleFileDelete(file.file_id)}/>
                            )}
                        </div>
                    ))
                )}
            </div>
            <div className="p-2.5 flex justify-center">
                <label htmlFor="file-upload" className="bg-white text-black px-6 py-2 rounded-2xl text-center cursor-pointer">
                    Attach files
                </label>
                <input
                    type="file"
                    id="file-upload"
                    name="file-upload"
                    className="hidden"
                    multiple
                    onChange={handleFileUpload}
                />
            </div>
        </div>
    );
};

export default FileViewer;
