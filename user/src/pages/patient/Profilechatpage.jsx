import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../../context/Authcontext";

const API_URL = "http://localhost:5000";

let _sio = null;
const getSio = async (userId) => {
  if (_sio) return _sio;
  try {
    const { io } = await import("socket.io-client");
    _sio = io(import.meta.env.VITE_API_URL || "http://localhost:5000", {
      query: { userId },
      withCredentials: true,
    });
    return _sio;
  } catch { return null; }
};

const fmt = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  const diff = Date.now() - d;
  if (diff < 60000)    return "just now";
  if (diff < 3600000)  return `${Math.floor(diff / 60000)}m`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const avatar = (u) =>
  u?.image ||
  `https://ui-avatars.com/api/?name=${encodeURIComponent(
    `${u?.firstName ?? "?"} ${u?.lastName ?? ""}`
  )}&background=0b6630&color=a8e02c&bold=true&size=80`;

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Syne:wght@700;800&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

@keyframes slideUp   { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
@keyframes shimmer   { 0% { background-position:200% 0; } 100% { background-position:-200% 0; } }
@keyframes dropdownIn { from { opacity:0; transform:translateY(-4px) scale(0.96); } to { opacity:1; transform:translateY(0) scale(1); } }
@keyframes messagePop { from { opacity:0; transform:scale(0.95) translateY(6px); } to { opacity:1; transform:scale(1) translateY(0); } }

.anim-up { animation: slideUp 0.45s cubic-bezier(0.22,1,0.36,1) both; }

/* ── Chat shell ── */
.ch-root {
  display: flex;
  height: calc(100vh - 120px);
  border-radius: 22px;
  overflow: hidden;
  /* glass card styling */
  background: rgba(255,255,255,0.18);
  backdrop-filter: blur(22px);
  -webkit-backdrop-filter: blur(22px);
  border-top:    1.5px solid rgba(168,224,44,0.85);
  border-left:   1.5px solid rgba(168,224,44,0.85);
  border-bottom: 1.5px solid rgba(0,168,84,0.75);
  border-right:  1.5px solid rgba(0,168,84,0.75);
  box-shadow: 0 8px 32px rgba(15,89,47,0.14), inset 0 0 12px rgba(255,255,255,0.55);
}

/* ── Sidebar ── */
.ch-sidebar {
  width: 300px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  border-right: 1.5px solid rgba(0,168,84,0.15);
  background: rgba(255,255,255,0.12);
  backdrop-filter: blur(12px);
}

.ch-sidebar-top {
  padding: 22px 18px 14px;
  border-bottom: 1px solid rgba(0,168,84,0.1);
  background: rgba(255,255,255,0.15);
}
.ch-sidebar-title {
  font-family: 'Syne',sans-serif;
  font-size: 16px;
  font-weight: 800;
  color: #1a3329;
  margin-bottom: 12px;
  letter-spacing: -0.2px;
}

/* Search */
.ch-search-wrap { position: relative; }
.ch-search-icon {
  position: absolute; left: 11px; top: 50%; transform: translateY(-50%);
  width: 14px; height: 14px; color: #5a7a6e; pointer-events: none;
}
.ch-search {
  width: 100%;
  padding: 9px 12px 9px 33px;
  border: 1.5px solid rgba(0,168,84,0.25);
  border-radius: 12px;
  background: rgba(255,255,255,0.35);
  backdrop-filter: blur(8px);
  font-family: 'DM Sans',sans-serif;
  font-size: 13px;
  color: #1a3329;
  outline: none;
  transition: all 0.2s;
}
.ch-search:focus {
  border-color: rgba(168,224,44,0.7);
  background: rgba(255,255,255,0.6);
}
.ch-search::placeholder { color: #5a7a6e; }

/* Conv list */
.ch-conv-list {
  flex: 1; overflow-y: auto; padding: 8px 0;
  scrollbar-width: thin; scrollbar-color: rgba(0,168,84,0.2) transparent;
}
.ch-conv-list::-webkit-scrollbar { width: 3px; }
.ch-conv-list::-webkit-scrollbar-thumb { background: rgba(0,168,84,0.2); border-radius: 99px; }

.ch-conv-item-wrap {
  display: flex; align-items: center; position: relative;
  margin: 3px 8px; border-radius: 16px;
  transition: background 0.18s;
}
.ch-conv-item-wrap:hover { background: rgba(255,255,255,0.4); }
.ch-conv-item-wrap.active {
  background: rgba(255,255,255,0.55);
  border: 1px solid rgba(168,224,44,0.4);
  box-shadow: 0 2px 12px rgba(15,89,47,0.1), inset 0 0 6px rgba(255,255,255,0.4);
}
.ch-conv-item {
  display: flex; align-items: center; gap: 11px;
  padding: 11px 13px; border: none; background: transparent;
  cursor: pointer; flex: 1; text-align: left; font-family: 'DM Sans',sans-serif;
}

.ch-avatar-wrap { position: relative; flex-shrink: 0; }
.ch-avatar {
  width: 42px; height: 42px; border-radius: 50%; object-fit: cover;
  border: 2px solid rgba(168,224,44,0.4);
  transition: border-color 0.2s;
}
.ch-conv-item-wrap.active .ch-avatar { border-color: rgba(168,224,44,0.8); }
.ch-online-dot {
  position: absolute; bottom: 1px; right: 1px;
  width: 11px; height: 11px; border-radius: 50%;
  background: #22c55e; border: 2px solid rgba(255,255,255,0.8);
}

.ch-conv-info { flex: 1; min-width: 0; }
.ch-conv-row { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 2px; }
.ch-conv-name { font-size: 13.5px; font-weight: 700; color: #1a3329; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 150px; }
.ch-conv-time { font-size: 10.5px; color: #5a7a6e; flex-shrink: 0; }
.ch-conv-preview { font-size: 12px; color: #5a7a6e; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ch-you { color: #0b6630; font-weight: 600; }

.ch-conv-actions { position: relative; display: flex; align-items: center; padding-right: 8px; }
.ch-conv-more {
  width: 26px; height: 26px; border-radius: 8px; border: none;
  background: transparent; color: rgba(26,51,41,0.25); cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  opacity: 0; transition: all 0.15s;
}
.ch-conv-item-wrap:hover .ch-conv-more { opacity: 1; }
.ch-conv-more:hover { background: rgba(255,255,255,0.6); color: #1a3329; }

.ch-dropdown {
  position: absolute; top: 30px; right: 4px;
  background: rgba(255,255,255,0.85); backdrop-filter: blur(16px);
  border-top: 1px solid rgba(168,224,44,0.5);
  border-left: 1px solid rgba(168,224,44,0.5);
  border-bottom: 1px solid rgba(0,168,84,0.4);
  border-right: 1px solid rgba(0,168,84,0.4);
  border-radius: 14px;
  box-shadow: 0 8px 28px rgba(15,89,47,0.15);
  padding: 5px; min-width: 170px; z-index: 100;
  animation: dropdownIn 0.15s ease;
}
.ch-dropdown-item {
  display: flex; align-items: center; gap: 8px;
  width: 100%; padding: 8px 12px; border: none; border-radius: 9px;
  background: transparent; font-family: 'DM Sans',sans-serif;
  font-size: 12.5px; color: #c0392b; cursor: pointer; transition: background 0.15s;
}
.ch-dropdown-item:hover { background: rgba(192,57,43,0.08); }

/* Skeletons */
.ch-skeleton {
  height: 60px; margin: 5px 14px; border-radius: 14px;
  background: linear-gradient(90deg,rgba(255,255,255,0.15) 25%,rgba(255,255,255,0.4) 50%,rgba(255,255,255,0.15) 75%);
  background-size: 200% 100%; animation: shimmer 1.4s infinite;
}
.ch-empty-state { display: flex; flex-direction: column; align-items: center; padding: 50px 20px; gap: 10px; }
.ch-empty-state p { font-size: 12.5px; color: #5a7a6e; text-align: center; }

/* ── Main area ── */
.ch-main {
  flex: 1; display: flex; flex-direction: column; min-width: 0;
  background: rgba(255,255,255,0.08);
}

/* Placeholder */
.ch-placeholder {
  flex: 1; display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 14px; padding: 40px;
}
.ch-placeholder-icon {
  width: 68px; height: 68px; border-radius: 20px;
  background: linear-gradient(135deg,#1a3329,#0b6630);
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 8px 28px rgba(11,102,48,0.25);
}
.ch-placeholder-title { font-family: 'Syne',sans-serif; font-size: 18px; font-weight: 800; color: #1a3329; }
.ch-placeholder-sub { font-size: 13px; color: #5a7a6e; text-align: center; max-width: 260px; line-height: 1.6; }

/* Header */
.ch-header {
  display: flex; align-items: center; gap: 13px;
  padding: 14px 22px;
  border-bottom: 1px solid rgba(0,168,84,0.1);
  background: rgba(255,255,255,0.2);
  backdrop-filter: blur(12px);
  flex-shrink: 0;
}
.ch-header-avatar { width: 42px; height: 42px; border-radius: 50%; object-fit: cover; border: 2px solid rgba(168,224,44,0.5); }
.ch-header-name { font-size: 14.5px; font-weight: 700; color: #1a3329; }
.ch-header-status { font-size: 11.5px; color: #5a7a6e; display: flex; align-items: center; gap: 5px; margin-top: 2px; }
.ch-header-status.online { color: #22c55e; }
.ch-status-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }

/* Messages */
.ch-messages {
  flex: 1; overflow-y: auto; padding: 18px 22px;
  display: flex; flex-direction: column; gap: 7px;
  scrollbar-width: thin; scrollbar-color: rgba(0,168,84,0.2) transparent;
}
.ch-messages::-webkit-scrollbar { width: 3px; }
.ch-messages::-webkit-scrollbar-thumb { background: rgba(0,168,84,0.2); border-radius: 99px; }
.ch-no-msgs { flex:1; display:flex; align-items:center; justify-content:center; font-size:13.5px; color:#5a7a6e; }

.ch-msg-row { display:flex; align-items:flex-end; gap:7px; animation: messagePop 0.28s ease; }
.ch-msg-row.mine { flex-direction:row-reverse; }

.ch-msg-avatar-slot { width:26px; flex-shrink:0; }
.ch-msg-avatar { width:26px; height:26px; border-radius:50%; object-fit:cover; border:1.5px solid rgba(168,224,44,0.35); }
.ch-msg-avatar-placeholder { display:block; width:26px; height:26px; }

.ch-bubble-wrap { display:flex; align-items:center; gap:5px; max-width:64%; }
.ch-bubble-wrap.mine { flex-direction:row-reverse; }

/* Theirs: glass */
.ch-bubble {
  max-width:100%; padding:11px 15px; border-radius:17px;
  font-size:13.5px; line-height:1.5; word-break:break-word;
  font-family:'DM Sans',sans-serif; position:relative;
}
.ch-bubble.theirs {
  background: rgba(255,255,255,0.5);
  backdrop-filter: blur(8px);
  border-top:    1px solid rgba(168,224,44,0.4);
  border-left:   1px solid rgba(168,224,44,0.4);
  border-bottom: 1px solid rgba(0,168,84,0.3);
  border-right:  1px solid rgba(0,168,84,0.3);
  color: #1a3329;
  border-bottom-left-radius: 4px;
  box-shadow: 0 2px 10px rgba(15,89,47,0.08), inset 0 0 4px rgba(255,255,255,0.4);
}
/* Mine: solid dark */
.ch-bubble.mine {
  background: #0b6630;
  color: #a8e02c;
  border-bottom-right-radius: 4px;
  box-shadow: 0 4px 14px rgba(11,102,48,0.28);
  border: none;
}
.ch-bubble.optimistic { opacity: 0.55; }
.ch-bubble-time { display:block; font-size:9.5px; margin-top:4px; opacity:0.5; text-align:right; font-weight:500; }

.ch-msg-actions { display:flex; align-items:center; position:relative; }
.ch-msg-more {
  width:22px; height:22px; border-radius:6px; border:none;
  background:transparent; color:rgba(26,51,41,0.2); cursor:pointer;
  display:flex; align-items:center; justify-content:center;
  opacity:0; transition:all 0.15s;
}
.ch-msg-row.mine:hover .ch-msg-more { opacity:1; }
.ch-msg-more:hover { background:rgba(255,255,255,0.5); color:#1a3329; }
.ch-msg-dropdown {
  position:absolute; top:26px; right:0;
  background: rgba(255,255,255,0.85); backdrop-filter:blur(16px);
  border-top: 1px solid rgba(168,224,44,0.5);
  border-left: 1px solid rgba(168,224,44,0.5);
  border-bottom: 1px solid rgba(0,168,84,0.4);
  border-right: 1px solid rgba(0,168,84,0.4);
  border-radius:12px;
  box-shadow:0 4px 20px rgba(15,89,47,0.15);
  padding:4px; min-width:130px; z-index:100;
  animation:dropdownIn 0.15s ease;
}

.ch-msg-skeleton {
  height:38px; width:50%; border-radius:14px;
  background:linear-gradient(90deg,rgba(255,255,255,0.1) 25%,rgba(255,255,255,0.3) 50%,rgba(255,255,255,0.1) 75%);
  background-size:200% 100%; animation:shimmer 1.4s infinite;
}
.ch-msg-skeleton.right { align-self:flex-end; }

/* Input bar */
.ch-input-bar {
  display:flex; align-items:center; gap:11px;
  padding:13px 20px;
  border-top:1px solid rgba(0,168,84,0.1);
  background:rgba(255,255,255,0.2);
  backdrop-filter:blur(12px);
  flex-shrink:0;
}
.ch-input {
  flex:1; padding:11px 16px;
  border:1.5px solid rgba(0,168,84,0.25);
  border-radius:14px;
  background:rgba(255,255,255,0.35);
  backdrop-filter:blur(8px);
  font-family:'DM Sans',sans-serif; font-size:13.5px;
  color:#1a3329; outline:none; transition:all 0.2s;
}
.ch-input:focus {
  border-color:rgba(168,224,44,0.7);
  background:rgba(255,255,255,0.6);
}
.ch-input::placeholder { color:#5a7a6e; }

.ch-send-btn {
  width:42px; height:42px; border-radius:13px; border:none;
  background:rgba(255,255,255,0.25);
  border:1.5px solid rgba(0,168,84,0.2);
  color:rgba(26,51,41,0.25); cursor:not-allowed;
  display:flex; align-items:center; justify-content:center;
  flex-shrink:0; transition:all 0.2s;
}
.ch-send-btn.active {
  background:#0b6630; color:#a8e02c; cursor:pointer; border:none;
  box-shadow:0 4px 14px rgba(11,102,48,0.3);
}
.ch-send-btn.active:hover { background:#0d7a38; transform:scale(1.05); }
.ch-send-btn.active:active { transform:scale(0.95); }

@media (max-width: 768px) {
  .ch-sidebar { display:none; }
}
`;

export default function ProfileChatPage() {
  const { user } = useAuth();

  const [conversations, setConversations] = useState([]);
  const [activeConv,    setActiveConv]    = useState(null);
  const [messages,      setMessages]      = useState([]);
  const [input,         setInput]         = useState("");
  const [loading,       setLoading]       = useState(true);
  const [msgLoading,    setMsgLoading]    = useState(false);
  const [search,        setSearch]        = useState("");
  const [onlineUsers,   setOnlineUsers]   = useState(new Set());
  const [menuMsgId,     setMenuMsgId]     = useState(null);
  const [menuConvId,    setMenuConvId]    = useState(null);

  const bottomRef   = useRef(null);
  const inputRef    = useRef(null);
  const sock        = useRef(null);
  const msgMenuRef  = useRef(null);
  const convMenuRef = useRef(null);

  const fetchConversations = useCallback(async () => {
    try {
      const res  = await fetch(`${API_URL}/conversations`, { credentials: "include" });
      const data = await res.json();
      const sorted = (data.conversations || []).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      const seen = new Set();
      const deduped = sorted.filter((c) => {
        const otherId = user?.role === "CLIENT" ? c.nutrition?.id : c.patient?.id;
        if (!otherId || seen.has(otherId)) return false;
        seen.add(otherId); return true;
      });
      setConversations(deduped);
    } catch { /* noop */ }
    finally { setLoading(false); }
  }, [user?.role]);

  const fetchMessages = useCallback(async (convId) => {
    setMsgLoading(true);
    try {
      const res  = await fetch(`${API_URL}/conversations/${convId}/messages`, { credentials: "include" });
      const data = await res.json();
      setMessages(data.messages ?? []);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 60);
    } catch { /* noop */ }
    finally { setMsgLoading(false); }
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    fetchConversations();
    getSio(user.id).then((s) => {
      if (!s) return;
      sock.current = s;
      s.on("new_message", (msg) => {
        if (msg.senderId === user.id) return;
        setMessages(prev => prev.find(m => m.id === msg.id) ? prev : [...prev, msg]);
        setConversations(prev =>
          prev.map(c => c.id === msg.conversationId ? { ...c, messages: [msg], updatedAt: msg.createdAt } : c)
              .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        );
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 60);
      });
      s.on("message_deleted",      ({ messageId, conversationId }) => {
        if (conversationId !== activeConv?.id) return;
        setMessages(prev => prev.filter(m => m.id !== messageId));
      });
      s.on("conversation_deleted", ({ conversationId }) => {
        setConversations(prev => prev.filter(c => c.id !== conversationId));
        if (activeConv?.id === conversationId) { setActiveConv(null); setMessages([]); }
      });
      s.on("user_online",  id => setOnlineUsers(prev => new Set([...prev, id])));
      s.on("user_offline", id => setOnlineUsers(prev => { const n = new Set(prev); n.delete(id); return n; }));
    });
    return () => {
      sock.current?.off("new_message");
      sock.current?.off("message_deleted");
      sock.current?.off("conversation_deleted");
      sock.current?.off("user_online");
      sock.current?.off("user_offline");
    };
  }, [user?.id, fetchConversations, activeConv?.id]);

  useEffect(() => {
    const handle = (e) => {
      if (msgMenuRef.current  && !msgMenuRef.current.contains(e.target))  setMenuMsgId(null);
      if (convMenuRef.current && !convMenuRef.current.contains(e.target)) setMenuConvId(null);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const otherUser = (conv) => user?.role === "CLIENT" ? conv.nutrition : conv.patient;

  const openConv = (conv) => {
    if (!otherUser(conv)?.id) return;
    setActiveConv(conv);
    setMenuMsgId(null);
    setMenuConvId(null);
    fetchMessages(conv.id);
    inputRef.current?.focus();
  };

  const send = async () => {
    const text = input.trim();
    if (!text || !activeConv) return;
    setInput("");
    const optId = `opt-${Date.now()}`;
    const optimistic = {
      id: optId, conversationId: activeConv.id, content: text,
      createdAt: new Date().toISOString(),
      sender: { id: user.id, firstName: user.firstName, lastName: user.lastName, image: user.image },
      senderId: user.id, _optimistic: true,
    };
    setMessages(p => [...p, optimistic]);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 40);
    try {
      const res  = await fetch(`${API_URL}/conversations/${activeConv.id}/messages`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text }),
      });
      const data = await res.json();
      setMessages(p => p.map(m => m.id === optId ? data.message : m));
    } catch {
      setMessages(p => p.filter(m => m.id !== optId));
      setInput(text);
    }
  };

  const deleteMessage = async (msgId) => {
    setMenuMsgId(null);
    setMessages(prev => prev.filter(m => m.id !== msgId));
    try { await fetch(`${API_URL}/conversations/${activeConv.id}/messages/${msgId}`, { method: "DELETE", credentials: "include" }); }
    catch { /* noop */ }
  };

  const deleteConversation = async (convId) => {
    setMenuConvId(null);
    setConversations(prev => prev.filter(c => c.id !== convId));
    if (activeConv?.id === convId) { setActiveConv(null); setMessages([]); }
    try { await fetch(`${API_URL}/conversations/${convId}`, { method: "DELETE", credentials: "include" }); }
    catch { /* noop */ }
  };

  const filtered = conversations.filter((c) => {
    const other = otherUser(c);
    return `${other?.firstName ?? ""} ${other?.lastName ?? ""}`.toLowerCase().includes(search.toLowerCase());
  });

  const activeOther = activeConv ? otherUser(activeConv) : null;
  const isOnline    = activeOther && onlineUsers.has(activeOther.id);

  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif" }}>
      <style>{CSS}</style>

      {/* Page heading */}
      <div className="anim-up" style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 10.5, fontWeight: 700, color: "#5a7a6e", textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 5 }}>
          Communication
        </div>
        <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 24, fontWeight: 800, color: "#1a3329", letterSpacing: -0.5 }}>
          Chat
        </div>
        <div style={{ fontSize: 13, color: "#5a7a6e", marginTop: 5, lineHeight: 1.6 }}>
          Message your nutritionist and track your conversations.
        </div>
      </div>

      <div className="ch-root">

        {/* ══ SIDEBAR ══ */}
        <aside className="ch-sidebar">
          <div className="ch-sidebar-top">
            <div className="ch-sidebar-title">Messages</div>
            <div className="ch-search-wrap">
              <svg className="ch-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                className="ch-search"
                placeholder="Search conversations…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="ch-conv-list">
            {loading && [1,2,3].map(i => (
              <div key={i} className="ch-skeleton" style={{ animationDelay: `${i*0.1}s` }} />
            ))}
            {!loading && filtered.length === 0 && (
              <div className="ch-empty-state">
                <span style={{ fontSize: 32 }}>💬</span>
                <p>No conversations yet</p>
              </div>
            )}
            {filtered.map(conv => {
              const other       = otherUser(conv);
              const lastMsg     = conv.messages?.[0];
              const online      = onlineUsers.has(other?.id);
              const isMe        = lastMsg?.senderId === user?.id;
              const active      = activeConv?.id === conv.id;
              const menuOpen    = menuConvId === conv.id;
              return (
                <div key={conv.id} className={`ch-conv-item-wrap ${active ? "active" : ""}`}>
                  <button className="ch-conv-item" onClick={() => openConv(conv)}>
                    <div className="ch-avatar-wrap">
                      <img src={avatar(other)} alt="" className="ch-avatar" />
                      {online && <span className="ch-online-dot" />}
                    </div>
                    <div className="ch-conv-info">
                      <div className="ch-conv-row">
                        <span className="ch-conv-name">{other?.firstName} {other?.lastName}</span>
                        <span className="ch-conv-time">{fmt(conv.updatedAt)}</span>
                      </div>
                      <div className="ch-conv-preview">
                        {isMe && <span className="ch-you">You: </span>}
                        {lastMsg?.content ?? <em style={{ color: "rgba(26,51,41,0.3)" }}>No messages yet</em>}
                      </div>
                    </div>
                  </button>
                  <div className="ch-conv-actions">
                    <button
                      className="ch-conv-more"
                      onClick={e => { e.stopPropagation(); setMenuConvId(menuOpen ? null : conv.id); setMenuMsgId(null); }}
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13">
                        <circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/>
                      </svg>
                    </button>
                    {menuOpen && (
                      <div className="ch-dropdown" ref={convMenuRef}>
                        <button className="ch-dropdown-item" onClick={e => {
                          e.stopPropagation();
                          if (window.confirm("Delete this entire conversation?")) deleteConversation(conv.id);
                        }}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                          </svg>
                          Delete conversation
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        {/* ══ MAIN ══ */}
        <main className="ch-main">
          {!activeConv ? (
            <div className="ch-placeholder">
              <div className="ch-placeholder-icon">
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#a8e02c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
              <h3 className="ch-placeholder-title">Select a conversation</h3>
              <p className="ch-placeholder-sub">Choose a nutritionist from the sidebar to start chatting.</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="ch-header">
                <div style={{ position: "relative" }}>
                  <img src={avatar(activeOther)} alt="" className="ch-header-avatar" />
                  {isOnline && <span className="ch-online-dot" />}
                </div>
                <div>
                  <div className="ch-header-name">{activeOther?.firstName} {activeOther?.lastName}</div>
                  <div className={`ch-header-status ${isOnline ? "online" : ""}`}>
                    {isOnline && <span className="ch-status-dot" />}
                    {isOnline ? "Online now" : "Offline"}
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="ch-messages">
                {msgLoading && [1,2,3,4].map(i => (
                  <div key={i} className={`ch-msg-skeleton ${i%2===0 ? "right" : ""}`} style={{ animationDelay: `${i*0.1}s` }} />
                ))}
                {!msgLoading && messages.length === 0 && (
                  <div className="ch-no-msgs">No messages yet — say hello 👋</div>
                )}
                {!msgLoading && messages.map((msg, idx) => {
                  const mine      = msg.senderId === user?.id;
                  const prevSame  = idx > 0 && messages[idx-1].senderId === msg.senderId;
                  const showAvatar = !mine && !prevSame;
                  const menuOpen  = menuMsgId === msg.id;
                  return (
                    <div key={msg.id} className={`ch-msg-row ${mine ? "mine" : "theirs"}`}>
                      {!mine && (
                        <div className="ch-msg-avatar-slot">
                          {showAvatar
                            ? <img src={avatar(msg.sender)} alt="" className="ch-msg-avatar" />
                            : <span className="ch-msg-avatar-placeholder" />
                          }
                        </div>
                      )}
                      <div className={`ch-bubble-wrap ${mine ? "mine" : "theirs"}`}>
                        <div className={`ch-bubble ${mine ? "mine" : "theirs"} ${msg._optimistic ? "optimistic" : ""}`}>
                          {msg.content}
                          <span className="ch-bubble-time">{fmt(msg.createdAt)}</span>
                        </div>
                        {mine && !msg._optimistic && (
                          <div className="ch-msg-actions">
                            <button
                              className="ch-msg-more"
                              onClick={e => { e.stopPropagation(); setMenuMsgId(menuOpen ? null : msg.id); setMenuConvId(null); }}
                            >
                              <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                                <circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/>
                              </svg>
                            </button>
                            {menuOpen && (
                              <div className="ch-msg-dropdown" ref={msgMenuRef}>
                                <button className="ch-dropdown-item" onClick={e => {
                                  e.stopPropagation();
                                  if (window.confirm("Delete this message?")) deleteMessage(msg.id);
                                }}>
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
                                    <polyline points="3 6 5 6 21 6"/>
                                    <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                                  </svg>
                                  Remove
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              {/* Input bar */}
              <div className="ch-input-bar">
                <input
                  ref={inputRef}
                  className="ch-input"
                  placeholder="Write a message…"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
                />
                <button className={`ch-send-btn ${input.trim() ? "active" : ""}`} onClick={send} disabled={!input.trim()}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" width="17" height="17">
                    <line x1="22" y1="2" x2="11" y2="13"/>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                  </svg>
                </button>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}