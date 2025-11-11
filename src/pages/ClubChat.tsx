import React, { useState } from "react";
import { useParams } from "react-router-dom";

const ClubChat = () => {
  const { clubId } = useParams();
  const [messages, setMessages] = useState<{ text: string; user: string }[]>([]);
  const [newMessage, setNewMessage] = useState("");

  const user = "You"; // Temporary until user system is added

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const msg = { text: newMessage, user };
    setMessages([...messages, msg]);
    setNewMessage("");
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 p-4">
      <h2 className="text-2xl font-bold text-center mb-4">
        {clubId?.toUpperCase()} Chat Room
      </h2>

      {/* Chat Box */}
      <div className="flex-1 overflow-y-auto border rounded-lg bg-white p-4 shadow-inner">
        {messages.length === 0 ? (
          <p className="text-gray-400 text-center mt-20">
            No messages yet. Start the conversation!
          </p>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`flex mb-2 ${
                msg.user === user ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[70%] rounded-xl px-4 py-2 text-white ${
                  msg.user === user ? "bg-blue-600" : "bg-gray-600"
                }`}
              >
                <span className="block text-sm font-semibold">{msg.user}</span>
                <span>{msg.text}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Message Input */}
      <form
        onSubmit={sendMessage}
        className="flex mt-4 border-t pt-4 gap-2"
      >
        <input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 border rounded-lg p-2 focus:outline-none focus:ring focus:ring-blue-200"
          placeholder="Type your message..."
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 rounded-lg hover:bg-blue-700"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ClubChat;
