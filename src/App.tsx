import React, { useEffect, useRef, useState } from "react";
import "./App.css";
import Conversation from "./Conversation";
import { MessageItem } from "./MessageItem";
import Sidebar from "./Sidebar";
import { WebSocketConnector } from "./WebSocketConnector";
import Welcome from "./Welcome";
import { User } from "./types";
import { mockUsers } from "./mocks";

const WS_URL = process.env.REACT_APP_WEBSOCKET_PORT;
const connector = new WebSocketConnector();

function App() {
  const clients = mockUsers;

  const [user, setUser] = useState<User>(
    JSON.parse(window.localStorage.getItem("user") || "{}")
  );
  // const [targetUser, setTargetUser] = useState<User>(
  //   JSON.parse(window.localStorage.getItem("lastTargetUser") || "{}")
  // );

  const targetUser: User = {
    id: "000",
    name: "Administrator",
    avatar: "https://cdn-icons-png.flaticon.com/512/6596/6596121.png",
  };

  const [messages, setMessages] = useState<MessageItem[]>([]);
  const webSocket = useRef(connector);

  const loadMessages = (target: User) => {
    webSocket.current.getConnection(url).send(
      JSON.stringify({
        action: "getMessages",
        targetId: target.id,
        limit: 1000,
      })
    );
  };

  const setNewTarget = (target: User) => {
    setUser(target);
    setMessages([]);
    loadMessages(target);
  };

  useEffect(() => {
    window.localStorage.setItem("user", JSON.stringify(user));
    window.localStorage.setItem("lastTargetUser", JSON.stringify(targetUser));
  });

  if (!user.name || user.name === "") {
    return (
      <Welcome
        setUser={(user) => {
          setUser(user);
          if (targetUser.id === "") {
            setUser(user);
          }
        }}
      />
    );
  }

  const url = `${WS_URL}?userId=${user.id}`;
  const ws = webSocket.current.getConnection(url);

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data) as {
      type: string;
      value: unknown;
    };
    console.log(msg);

    if (msg.type === "messages") {
      const body = msg.value as {
        messages: MessageItem[];
        lastEvaluatedKey: unknown;
      };

      setMessages([...body.messages.reverse(), ...messages]);
    }

    if (msg.type === "message") {
      const item = msg.value as MessageItem;
      if (item.senderId === user.id || item.senderId !== targetUser.id) {
        return;
      }
      setMessages([...messages, item]);
    }
  };

  ws.onopen = () => {
    loadMessages(targetUser);
  };

  const sendMessage = (value: string) => {
    webSocket.current.getConnection(url).send(
      JSON.stringify({
        action: "sendMessage",
        recipientId: targetUser.id,
        content: value,
      })
    );
    setMessages([
      ...messages,
      {
        content: value,
        senderId: user.id,
      },
    ]);
  };

  return (
    <div className="flex">
      <Sidebar
        me={user}
        clients={clients}
        setTarget={(target) => setNewTarget(target)}
      />
      <div className="flex-auto">
        <Conversation
          me={user}
          targetUser={targetUser}
          messages={messages}
          sendMessage={sendMessage}
        />
      </div>
    </div>
  );
}

export default App;
