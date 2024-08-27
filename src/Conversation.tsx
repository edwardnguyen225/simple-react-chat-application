import React, { useEffect, useRef, useState } from "react";
import "./Conversation.css";
import { MessageItem, User } from "./types";

export const API_URL = process.env.REACT_APP_API_URL;

export default function Conversation({
  roomId,
  me,
  targetUser,
  messages,
  sendMessage,
  isLoading,
}: {
  roomId: string;
  me: User;
  targetUser: User;
  messages: MessageItem[];
  isLoading: boolean;
  sendMessage: (message: {
    messageContent: string;
    mediaName?: string;
    mediaType?: string;
    mediaUrl?: string;
  }) => void;
}) {
  const [message, setMessage] = useState<string>("");
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [, setFile] = useState<File | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  });

  const messagesGroupedBySender = messages.reduce((prev, curr) => {
    if (prev.length > 0 && curr.senderId === prev[prev.length - 1].sender.id) {
      prev[prev.length - 1].messages.push(curr);
      return prev;
    } else {
      const sender = curr.senderId === me.id ? me : targetUser;
      return [
        ...prev,
        {
          sender,
          messages: [curr],
        },
      ];
    }
  }, [] as { sender: User; messages: MessageItem[] }[]);

  const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("🚀 ~ handleUploadFile ~ e.target.files", e.target.files);

    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setFile(file);
      const url = await uploadFileAsync(file);

      sendMessage({
        messageContent: "",
        mediaName: file.name,
        mediaType: url.mediaType,
        mediaUrl: url.mediaUrl,
      });

      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";

        // Reset the file state
        setFile(null);
        scrollToBottom();
      }
    }
  };

  const uploadFileAsync = async (file: File) => {
    console.log("🚀 ~ uploadFileAsync ~ file:", file);

    const fileName = file.name;
    const body = {
      roomId,
      userId: me.id,
      fileName,
    };
    const response = await fetch(`${API_URL}/uploadFile`, {
      method: "POST",
      body: JSON.stringify(body),
    });
    const uploadResponse = (await response.json()) as {
      file: {
        id: string;
        fileName: string;
        roomId: string;
        userId: string;
        createdAt: number;
      };
      uploadUrl: string;
    };

    await fetch(uploadResponse.uploadUrl, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": file.type,
      },
    });

    const {
      file: { downloadUrl },
    } = await fetch(`${API_URL}/getFile`, {
      method: "POST",
      body: JSON.stringify({ fileId: uploadResponse.file.id }),
    }).then((res) => res.json() as Promise<{ file: { downloadUrl: string } }>);

    return {
      mediaName: fileName,
      mediaType: file.type,
      mediaUrl: downloadUrl,
    };
  };

  const submit = () => {
    setMessage("");
    sendMessage({
      messageContent: message,
    });
    scrollToBottom();
  };

  const renderMessage = (isMe: boolean, message: MessageItem, key: string) => {
    if (message.mediaType.startsWith("image")) {
      return (
        <div key={key}>
          <img
            src={message.mediaUrl}
            alt={message.mediaName}
            className="w-full rounded-lg"
          />
        </div>
      );
    }

    // If the message is a video
    if (message.mediaType.startsWith("video")) {
      return (
        <div key={key}>
          <video
            src={message.mediaUrl}
            controls
            className="w-full rounded-lg"
          ></video>
        </div>
      );
    }

    // If the message is a file
    if (message.mediaType.startsWith("application")) {
      return (
        <div key={key}>
          <a
            href={message.mediaUrl}
            target="_blank"
            rel="noreferrer"
            className={`px-4 py-2 rounded-lg inline-flex items-center gap-2 ${
              !isMe
                ? "rounded-bl-none bg-gray-300 text-gray-600"
                : "rounded-br-none bg-blue-600 text-white"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 384 512"
              className="flex-shrink-0 w-4 h-5"
            >
              <path
                fill={isMe ? "white" : "#4a5568"}
                d="M64 0C28.7 0 0 28.7 0 64L0 448c0 35.3 28.7 64 64 64l256 0c35.3 0 64-28.7 64-64l0-288-128 0c-17.7 0-32-14.3-32-32L224 0 64 0zM256 0l0 128 128 0L256 0zM216 232l0 102.1 31-31c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-72 72c-9.4 9.4-24.6 9.4-33.9 0l-72-72c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l31 31L168 232c0-13.3 10.7-24 24-24s24 10.7 24 24z"
              />
            </svg>
            {message.mediaName}
          </a>
        </div>
      );
    }

    return (
      <div key={key}>
        <span
          className={`px-4 py-2 rounded-lg inline-block ${
            !isMe
              ? "rounded-bl-none bg-gray-300 text-gray-600"
              : "rounded-br-none bg-blue-600 text-white"
          }`}
        >
          {message.messageContent}
        </span>
      </div>
    );
  };

  return (
    <div className="flex-1 p:2 sm:p-6 justify-between flex flex-col h-screen">
      <div className="flex sm:items-center justify-between py-3 border-b-2 border-gray-200">
        <div className="flex items-center space-x-4">
          <img
            src={targetUser.avatar}
            alt=""
            className="w-10 sm:w-16 h-10 sm:h-16 rounded-full"
          />
          <div className="flex flex-col leading-tight">
            <div className="text-2xl mt-1 flex items-center">
              <span className="text-gray-700 mr-3">{targetUser.name}</span>
              <span className="text-green-500">
                <svg width="10" height="10">
                  <circle cx="5" cy="5" r="5" fill="currentColor"></circle>
                </svg>
              </span>
            </div>
          </div>
        </div>
      </div>
      <div
        id="messages"
        className="flex flex-col space-y-4 p-3 overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch h-screen"
      >
        {isLoading ? (
          <div className="chat-message">
            <div className="flex items-center">
              <div className="flex flex-col space-y-2 text-xs max-w-xs mx-2">
                <div>
                  <span className="px-4 py-2 inline-block bg-gray-300 rounded-lg">
                    Loading...
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : messages.length > 0 ? (
          <>
            {messagesGroupedBySender.map((group, key) => (
              <div key={key} className="chat-message">
                <div
                  className={`flex items-end${
                    group.sender.id === targetUser.id ? "" : " justify-end"
                  }`}
                >
                  <div
                    className={`flex flex-col space-y-2 text-xs max-w-xs mx-2 ${
                      group.sender.id === targetUser.id
                        ? "order-2 items-start"
                        : "order-1 items-end"
                    }`}
                  >
                    {group.messages.map((message, key) => {
                      return renderMessage(
                        group.sender.id === me.id,
                        message,
                        key.toString()
                      );
                    })}
                  </div>
                  <img
                    src={group.sender.avatar}
                    alt="My profile"
                    className={`w-6 h-6 rounded-full order-${
                      group.sender.id === targetUser.id ? 1 : 2
                    }`}
                  />
                </div>
              </div>
            ))}
            <div ref={messagesEndRef}></div>
          </>
        ) : (
          <div className="chat-message flex justify-center">
            <span className="px-4 py-2 inline-block">No messages yet.</span>
          </div>
        )}
      </div>
      <div className="border-t-2 border-gray-200 px-4 pt-4 mb-2 sm:mb-0">
        <div className="relative flex">
          <span className="absolute inset-y-0 flex items-center">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-full h-12 w-12 transition duration-500 ease-in-out text-gray-500 hover:bg-gray-300 focus:outline-none"
              onClick={() => {
                alert("Not implemented yet");
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="h-6 w-6 text-gray-600"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                ></path>
              </svg>
            </button>
          </span>
          <input
            type="text"
            placeholder="Write Something"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => (e.key === "Enter" ? submit() : null)}
            className="w-full focus:outline-none focus:placeholder-gray-400 text-gray-600 placeholder-gray-600 pl-12 bg-gray-200 rounded-full py-3"
          />
          <div className="absolute right-0 items-center inset-y-0 hidden sm:flex">
            <input
              ref={fileInputRef}
              type="file"
              id="file"
              className="hidden"
              onChange={handleUploadFile}
              multiple={false}
            />
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-full h-10 w-10 transition duration-500 ease-in-out text-gray-500 hover:bg-gray-300 focus:outline-none"
              onClick={() => {
                fileInputRef.current?.click();
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="h-6 w-6 text-gray-600"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                ></path>
              </svg>
            </button>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-full h-10 w-10 transition duration-500 ease-in-out text-gray-500 hover:bg-gray-300 focus:outline-none"
              onClick={() => {
                alert("Not implemented yet");
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="h-6 w-6 text-gray-600"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                ></path>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                ></path>
              </svg>
            </button>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-full h-10 w-10 transition duration-500 ease-in-out text-gray-500 hover:bg-gray-300 focus:outline-none"
              onClick={() => {
                alert("Not implemented yet");
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="h-6 w-6 text-gray-600"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
            </button>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-full h-12 w-12 transition duration-500 ease-in-out text-white bg-blue-500 hover:bg-blue-400 focus:outline-none"
              onClick={() => submit()}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-6 w-6 transform rotate-90"
              >
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
