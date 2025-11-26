import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

function ChatPage() {
  const { jobId, receiverId } = useParams();
  const user = JSON.parse(localStorage.getItem("user"));
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [receiver, setReceiver] = useState({ name: "", email: "" });
  const chatEndRef = useRef(null);

  useEffect(() => {
    const fetchReceiver = async () => {
      try {
        const res = await axios.get(`https://careerconnect-d6ke.onrender.com/api/users/${receiverId}`);
        setReceiver(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchReceiver();
  }, [receiverId]);

  const fetchMessages = async () => {
    if (!user) return;
    try {
      const res = await axios.get("https://careerconnect-d6ke.onrender.com/api/messages/conversation", {
        params: { user1: user._id, user2: receiverId, jobId },
      });
      setMessages(res.data);
      scrollToBottom();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [receiverId, jobId]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    try {
      await axios.post("https://careerconnect-d6ke.onrender.com/api/messages/send", {
        senderId: user._id,
        receiverId,
        jobId,
        content: input,
      });
      setInput("");
      fetchMessages();
    } catch (err) {
      console.error(err);
    }
  };

  const scrollToBottom = () => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="container mt-4 d-flex flex-column align-items-center">
      <div className="w-100" style={{ maxWidth: 700 }}>
        <div className="d-flex align-items-center justify-content-between border-bottom pb-2 mb-3">
          <h5 className="mb-0">
            Chat with <span className="text-primary">{receiver.name}</span>
          </h5>
          <small className="text-muted">{receiver.email}</small>
        </div>

        <div
          className="border rounded shadow-sm p-3 mb-3"
          style={{
            height: "350px",
            overflowY: "scroll", 
            backgroundColor: "#f8f9fa",
            scrollbarWidth: "thin",
            scrollbarColor: "#bbb #f8f9fa",
          }}
        >
          {messages.length === 0 && (
            <div className="text-center text-muted mt-5">
              No messages yet. Start the conversation!
            </div>
          )}

          {messages.map((msg) => {
            const isSender = msg.senderId._id === user._id;
            return (
              <div
                key={msg._id}
                className={`d-flex flex-column mb-2 align-items-${isSender ? "end" : "start"}`}
              >
                <div
                  className={`p-2 rounded ${
                    isSender ? "bg-primary text-white" : "bg-light text-dark"
                  }`}
                  style={{
                    maxWidth: "70%",
                    wordBreak: "break-word",
                    fontSize: "0.9rem",
                  }}
                >
                  {msg.content}
                </div>
                <small className="text-muted mt-1" style={{ fontSize: "0.7rem" }}>
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </small>
              </div>
            );
          })}
          <div ref={chatEndRef} />
        </div>

        <div className="d-flex">
          <input
            type="text"
            className="form-control me-2"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button className="btn btn-primary" onClick={sendMessage}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatPage;
