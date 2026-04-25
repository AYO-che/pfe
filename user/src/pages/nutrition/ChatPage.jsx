import { useState } from "react";

const CSS = `
@keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
.ch-card{
  background:#fff;
  border-radius:20px;
  padding:24px;
  box-shadow:0 1px 3px rgba(0,0,0,0.04),0 4px 16px rgba(26,51,41,0.06);
  border:1px solid rgba(79,158,122,0.1);
  animation:fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) both;
}
`;

export default function ChatPage() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMsg = message;
    setMessage("");

    setChat((prev) => [...prev, { role: "user", text: userMsg }]);

    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // IMPORTANT (cookies)
        body: JSON.stringify({ message: userMsg }),
      });

      const data = await res.json();

      setChat((prev) => [
        ...prev,
        { role: "bot", text: data.reply || "No response" },
      ]);
    } catch (err) {
      setChat((prev) => [
        ...prev,
        { role: "bot", text: "Error connecting to server" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{CSS}</style>

      <div style={{ marginBottom: 22 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: "#1a3329" }}>
          Messages
        </div>
        <div style={{ fontSize: 13, color: "#9ab8ae" }}>
          Chat with AI assistant
        </div>
      </div>

      <div className="ch-card" style={{ minHeight: 400 }}>
        {/* CHAT MESSAGES */}
        <div style={{ marginBottom: 20 }}>
          {chat.map((c, i) => (
            <div
              key={i}
              style={{
                textAlign: c.role === "user" ? "right" : "left",
                marginBottom: 10,
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  padding: "10px 14px",
                  borderRadius: 12,
                  background: c.role === "user" ? "#3d9b73" : "#f0f7f4",
                  color: c.role === "user" ? "white" : "#1a3329",
                  maxWidth: "70%",
                }}
              >
                {c.text}
              </span>
            </div>
          ))}
        </div>

        {/* INPUT */}
        <div style={{ display: "flex", gap: 10 }}>
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            style={{
              flex: 1,
              padding: 10,
              borderRadius: 10,
              border: "1px solid #ddd",
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") sendMessage();
            }}
          />

          <button
            onClick={sendMessage}
            disabled={loading}
            style={{
              padding: "10px 16px",
              background: "#3d9b73",
              color: "white",
              border: "none",
              borderRadius: 10,
              cursor: "pointer",
            }}
          >
            {loading ? "..." : "Send"}
          </button>
        </div>
      </div>
    </>
  );
}