import { useState } from "react";
import { User } from "./types";
import { mockUsers } from "./mocks";

export default function Welcome({
  setUser,
}: {
  setUser: (user: User) => void;
}) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const startChat = () => {
    if (!selectedUser) return;

    setUser(selectedUser);
  };

  return (
    <section className="flex justify-center items-center h-screen bg-gray-100">
      <div className="max-w-md w-full bg-white rounded p-6 space-y-4">
        <div className="mb-4">
          <p className="text-gray-600">Sign In</p>
          <h2 className="text-xl font-bold">Join the Chat</h2>
        </div>
        <div>
          {/* Select one of the created users */}
          <ul>
            {mockUsers.map((user) => (
              <li
                key={user.id}
                onClick={() => setSelectedUser(user)}
                className={`flex items-center space-x-2 p-2 rounded cursor-pointer ${
                  selectedUser?.id === user.id ? "bg-gray-200" : ""
                }`}
              >
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-8 h-8 rounded-full"
                />
                <span>{user.name}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <button
            onClick={startChat}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 rounded text-sm font-bold text-gray-50 transition duration-200"
          >
            Join
          </button>
        </div>
      </div>
    </section>
  );
}
