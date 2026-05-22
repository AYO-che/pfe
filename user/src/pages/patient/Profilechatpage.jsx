import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../../context/Authcontext";

const API_URL = "https://chrysalise-server.onrender.com";

let _sio = null;
const getSio = async (userId) => {
  if (_sio) return _sio;
  try {
    const { io } = await import("socket.io-client");
    _sio = io(import.meta.env.VITE_API_URL || "https://chrysalise-server.onrender.com", {
      query: { userId },
      withCredentials: true,
    });
    return _sio;
  } catch { return null; }
};

const fmt = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const diff = now - d;
  if (diff < 60000) return "just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const avatar = (u) =>
  u?.image ||
  `https://ui-avatars.com/api/?name=${encodeURIComponent(
    `${u?.firstName ?? "?"} ${u?.lastName ?? ""}`
  )}&background=2d6b50&color=f5e642&bold=true&size=80`;

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
  const [showSidebar,   setShowSidebar]   = useState(true);
  const [menuMsgId,     setMenuMsgId]     = useState(null);
  const [menuConvId,    setMenuConvId]    = useState(null);

  const bottomRef   = useRef(null);
  const inputRef    = useRef(null);
  const sock        = useRef(null);
  const msgMenuRef  = useRef(null);
  const convMenuRef = useRef(null);

  const fetchConversations = useCallback(async () => {
    try {
      const res  = await authFetch(`${API_URL}/conversations`, { credentials: "include" });
      const data = await res.json();
      const sorted = (data.conversations || []).sort(
        (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
      );
      const seen = new Set();
      const deduped = sorted.filter((c) => {
        const otherId = user?.role === "CLIENT" ? c.nutrition?.id : c.patient?.id;
        if (!otherId || seen.has(otherId)) return false;
        seen.add(otherId);
        return true;
      });
      setConversations(deduped);
    } catch { /* noop */ }
    finally { setLoading(false); }
  }, [user?.role]);

  const fetchMessages = useCallback(async (convId) => {
    setMsgLoading(true);
    try {
      const res  = await authFetch(`${API_URL}/conversations/${convId}/messages`, { credentials: "include" });
      const data = await res.json();
      const normalized = (data.messages ?? []).map(m => ({
        ...m,
        senderId: String(m.senderId ?? m.sender?.id),
      }));
      setMessages(normalized);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 60);
    } catch { /* noop */ }
    finally { setMsgLoading(false); }
  }, []);

  // Effect 1: Socket — runs ONCE
  useEffect(() => {
    if (!user?.id) return;

    getSio(user.id).then((s) => {
      if (!s) return;
      sock.current = s;

      s.on("new_message", (msg) => {
        const senderId = String(msg.senderId ?? msg.sender?.id);
        if (senderId === String(user.id)) return;

        const normalized = { ...msg, senderId };
        setMessages(prev =>
          prev.find(m => m.id === normalized.id) ? prev : [...prev, normalized]
        );
        setConversations(prev =>
          prev
            .map(c => c.id === msg.conversationId ? { ...c, messages: [msg], updatedAt: msg.createdAt } : c)
            .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        );
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 60);
      });

      s.on("message_deleted", ({ messageId }) => {
        setMessages(prev => prev.filter(m => m.id !== messageId));
      });

      s.on("conversation_deleted", ({ conversationId }) => {
        setConversations(prev => prev.filter(c => c.id !== conversationId));
        setActiveConv(prev => prev?.id === conversationId ? null : prev);
        setMessages([]);
        setShowSidebar(true);
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
  }, [user?.id]);

  // Effect 2: Fetch conversations
  useEffect(() => {
    if (!user?.id) return;
    fetchConversations();
  }, [user?.id, fetchConversations]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handle = (e) => {
      if (msgMenuRef.current  && !msgMenuRef.current.contains(e.target))  setMenuMsgId(null);
      if (convMenuRef.current && !convMenuRef.current.contains(e.target)) setMenuConvId(null);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  // Auto-restore sidebar on desktop resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) setShowSidebar(true);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const otherUser = (conv) => user?.role === "CLIENT" ? conv.nutrition : conv.patient;

  const openConv = (conv) => {
    if (!otherUser(conv)?.id) return;
    setActiveConv(conv);
    setMenuMsgId(null);
    setMenuConvId(null);
    fetchMessages(conv.id);
    if (window.innerWidth <= 768) setShowSidebar(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const backToList = () => {
    setShowSidebar(true);
    setActiveConv(null);
  };

  const send = async () => {
    const text = input.trim();
    if (!text || !activeConv) return;
    setInput("");

    const optimisticId = `opt-${Date.now()}`;
    const optimistic = {
      id:             optimisticId,
      conversationId: activeConv.id,
      content:        text,
      createdAt:      new Date().toISOString(),
      sender:         { id: user.id, firstName: user.firstName, lastName: user.lastName, image: user.image },
      senderId:       String(user.id),
      _optimistic:    true,
    };
    setMessages(p => [...p, optimistic]);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 40);

    try {
      const res  = await authFetch(`${API_URL}/conversations/${activeConv.id}/messages`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content: text }),
      });
      const data = await res.json();
      const real = { ...data.message, senderId: String(data.message.senderId ?? data.message.sender?.id) };
      setMessages(p => p.map(m => m.id === optimisticId ? real : m));
    } catch {
      setMessages(p => p.filter(m => m.id !== optimisticId));
      setInput(text);
    }
  };

  const deleteMessage = async (msgId) => {
    setMenuMsgId(null);
    setMessages(prev => prev.filter(m => m.id !== msgId));
    try {
      await authFetch(`${API_URL}/conversations/${activeConv.id}/messages/${msgId}`, {
        method: "DELETE", credentials: "include",
      });
    } catch { /* noop */ }
  };

  const deleteConversation = async (convId) => {
    setMenuConvId(null);
    setConversations(prev => prev.filter(c => c.id !== convId));
    if (activeConv?.id === convId) { setActiveConv(null); setMessages([]); setShowSidebar(true); }
    try {
      await authFetch(`${API_URL}/conversations/${convId}`, {
        method: "DELETE", credentials: "include",
      });
    } catch { /* noop */ }
  };

  const filtered = conversations.filter((c) => {
    const other = otherUser(c);
    const name  = `${other?.firstName ?? ""} ${other?.lastName ?? ""}`.toLowerCase();
    return name.includes(search.toLowerCase());
  });

  const activeOther = activeConv ? otherUser(activeConv) : null;
  const isOnline    = activeOther && onlineUsers.has(activeOther.id);

  return (
    <>
      <style>{CSS}</style>
      <div className="ch-root">
        {/* ══ SIDEBAR ══ */}
        <aside className={`ch-sidebar ${showSidebar ? "visible" : "hidden"}`}>
          <div className="ch-sidebar-top">
            <h2 className="ch-sidebar-title">Messages</h2>
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
                <div className="ch-empty-icon">💬</div>
                <p>No conversations yet</p>
              </div>
            )}
            {filtered.map(conv => {
              const other    = otherUser(conv);
              const lastMsg  = conv.messages?.[0];
              const online   = onlineUsers.has(other?.id);
              const isMe     = String(lastMsg?.senderId) === String(user?.id);
              const active   = activeConv?.id === conv.id;
              const menuOpen = menuConvId === conv.id;

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
                        {lastMsg?.content ?? <em>No messages yet</em>}
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
        <main className={`ch-main ${showSidebar ? "" : "full"}`}>
          {!activeConv ? (
            <div className="ch-placeholder">
              <div className="ch-placeholder-icon">
                <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" width="56" height="56">
                  <rect width="64" height="64" rx="20" fill="url(#pg)"/>
                  <path d="M16 20h32a4 4 0 014 4v18a4 4 0 01-4 4H20l-8 6V24a4 4 0 014-4z" fill="rgba(245,230,66,0.25)" stroke="#f5e642" strokeWidth="1.5"/>
                  <defs>
                    <linearGradient id="pg" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#1a3329"/><stop offset="1" stopColor="#2d6b50"/>
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <h3 className="ch-placeholder-title">Select a conversation</h3>
              <p className="ch-placeholder-sub">Choose a nutritionist from the sidebar to start chatting.</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="ch-header">
                <button className="ch-back-btn" onClick={backToList} aria-label="Back">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
                    <line x1="19" y1="12" x2="5" y2="12"/>
                    <polyline points="12 19 5 12 12 5"/>
                  </svg>
                </button>
                <div className="ch-header-avatar-wrap">
                  <img src={avatar(activeOther)} alt="" className="ch-header-avatar" />
                  {isOnline && <span className="ch-online-dot" />}
                </div>
                <div className="ch-header-info">
                  <span className="ch-header-name">{activeOther?.firstName} {activeOther?.lastName}</span>
                  <span className={`ch-header-status ${isOnline ? "online" : ""}`}>
                    {isOnline ? "Online now" : "Offline"}
                  </span>
                </div>
              </div>

              {/* Messages */}
              <div className="ch-messages">
                {msgLoading && [1,2,3,4].map(i => (
                  <div key={i} className={`ch-msg-skeleton ${i%2===0 ? "right" : ""}`} />
                ))}
                {!msgLoading && messages.length === 0 && (
                  <div className="ch-no-msgs"><span>No messages yet — say hello 👋</span></div>
                )}
                {!msgLoading && messages.map((msg, idx) => {
                  const mine       = String(msg.senderId) === String(user?.id);
                  const prevSame   = idx > 0 && String(messages[idx-1].senderId) === String(msg.senderId);
                  const showAvatar = !mine && !prevSame;
                  const menuOpen   = menuMsgId === msg.id;

                  return (
                    <div key={msg.id ?? `msg-${idx}`} className={`ch-msg-row ${mine ? "mine" : "theirs"}`}>
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
                              <svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13">
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
                <button
                  className={`ch-send-btn ${input.trim() ? "active" : ""}`}
                  onClick={send}
                  disabled={!input.trim()}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                    <line x1="22" y1="2" x2="11" y2="13"/>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                  </svg>
                </button>
              </div>
            </>
          )}
        </main>
      </div>
    </>
  );
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Syne:wght@700;800&display=swap');

.ch-root {
  display: flex;
  height: calc(100vh - 80px);
  background: transparent;
  font-family: Inter, sans-serif;
  overflow: hidden;
  border-radius: 22px;
  box-shadow: 0 8px 32px rgba(15, 89, 47, 0.12);
  position: relative;
}

.ch-sidebar {
  width: 300px;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  display: flex;
  flex-direction: column;
  border-top: 1.5px solid rgba(168, 224, 44, 0.85);
  border-left: 1.5px solid rgba(168, 224, 44, 0.85);
  border-bottom: 1.5px solid rgba(0, 168, 84, 0.75);
  border-right: 1.5px solid rgba(0, 168, 84, 0.75);
  border-radius: 22px 0 0 22px;
  box-shadow: 0 8px 32px rgba(15, 89, 47, 0.1), inset 0 0 12px rgba(255, 255, 255, 0.5);
  transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.ch-sidebar-top {
  padding: 24px 18px 14px;
  border-bottom: 1px solid rgba(0, 168, 84, 0.12);
}

.ch-sidebar-title {
  font-family: Inter, sans-serif;
  font-size: 22px;
  font-weight: 800;
  color: #0b6630;
  margin-bottom: 16px;
  letter-spacing: -0.3px;
}

.ch-search-wrap { position: relative; }

.ch-search-icon {
  position: absolute;
  left: 13px;
  top: 50%;
  transform: translateY(-50%);
  width: 15px;
  height: 15px;
  color: rgba(11, 102, 48, 0.4);
}

.ch-search {
  width: 100%;
  padding: 10px 14px 10px 36px;
  border: 1.5px solid rgba(168, 224, 44, 0.5);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.35);
  font-family: Inter, sans-serif;
  font-size: 13px;
  color: #1a3329;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
  box-sizing: border-box;
}

.ch-search:focus {
  border-color: rgba(0, 168, 84, 0.7);
  box-shadow: 0 0 0 4px rgba(168, 224, 44, 0.15);
  background: rgba(255, 255, 255, 0.55);
}

.ch-search::placeholder { color: rgba(11, 102, 48, 0.35); }

.ch-conv-list {
  flex: 1;
  overflow-y: auto;
  padding: 10px 8px;
}

.ch-conv-list::-webkit-scrollbar { width: 3px; }
.ch-conv-list::-webkit-scrollbar-thumb { background: rgba(0, 168, 84, 0.2); border-radius: 10px; }

.ch-conv-item-wrap {
  display: flex;
  align-items: center;
  position: relative;
  margin: 3px 4px;
  border-radius: 16px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.ch-conv-item-wrap:hover {
  background: rgba(255, 255, 255, 0.45);
  box-shadow: 0 2px 12px rgba(15, 89, 47, 0.08);
}

.ch-conv-item-wrap.active {
  background: rgba(11, 102, 48, 0.12);
  box-shadow: 0 4px 16px rgba(11, 102, 48, 0.15);
}

.ch-conv-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 12px;
  border: none;
  background: transparent;
  cursor: pointer;
  flex: 1;
  text-align: left;
  font-family: Inter, sans-serif;
}

.ch-avatar-wrap { position: relative; flex-shrink: 0; }

.ch-avatar {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(168, 224, 44, 0.6);
  box-shadow: 0 2px 8px rgba(15, 89, 47, 0.12);
}

.ch-online-dot {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 11px;
  height: 11px;
  border-radius: 50%;
  background: #22c55e;
  border: 2px solid rgba(255, 255, 255, 0.9);
  box-shadow: 0 0 0 1.5px rgba(168, 224, 44, 0.5);
}

.ch-conv-info { flex: 1; min-width: 0; }

.ch-conv-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 3px;
}

.ch-conv-name {
  font-size: 13.5px;
  font-weight: 700;
  color: #1a3329;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 140px;
}

.ch-conv-time {
  font-size: 11px;
  color: rgba(11, 102, 48, 0.45);
  flex-shrink: 0;
}

.ch-conv-preview {
  font-size: 12.5px;
  color: rgba(11, 102, 48, 0.5);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ch-you { color: #0b6630; font-weight: 600; }

.ch-conv-actions {
  position: relative;
  display: flex;
  align-items: center;
  padding-right: 8px;
}

.ch-conv-more {
  width: 28px;
  height: 28px;
  border-radius: 10px;
  border: none;
  background: transparent;
  color: rgba(11, 102, 48, 0.25);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.15s;
}

.ch-conv-item-wrap:hover .ch-conv-more { opacity: 1; }
.ch-conv-more:hover { background: rgba(255, 255, 255, 0.6); color: #0b6630; }

.ch-dropdown {
  position: absolute;
  top: 32px;
  right: 4px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(168, 224, 44, 0.5);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(15, 89, 47, 0.15);
  padding: 6px;
  min-width: 180px;
  z-index: 100;
}

.ch-dropdown-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 10px 14px;
  border: none;
  border-radius: 12px;
  background: transparent;
  font-family: Inter, sans-serif;
  font-size: 12.5px;
  color: #c0392b;
  cursor: pointer;
  transition: background 0.15s;
}

.ch-dropdown-item:hover { background: rgba(192, 57, 43, 0.07); }

.ch-skeleton {
  height: 62px;
  margin: 6px 18px;
  border-radius: 16px;
  background: linear-gradient(90deg, rgba(255,255,255,0.3) 25%, rgba(168,224,44,0.15) 50%, rgba(255,255,255,0.3) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
}

@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.ch-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px 24px;
  gap: 10px;
}

.ch-empty-icon { font-size: 36px; }
.ch-empty-state p { font-size: 13px; color: rgba(11, 102, 48, 0.45); text-align: center; }

.ch-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  border-top: 1.5px solid rgba(168, 224, 44, 0.7);
  border-right: 1.5px solid rgba(168, 224, 44, 0.7);
  border-bottom: 1.5px solid rgba(0, 168, 84, 0.6);
  border-radius: 0 22px 22px 0;
  box-shadow: inset 0 0 16px rgba(255, 255, 255, 0.4);
  min-width: 0;
  overflow: hidden;
}

.ch-placeholder {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  padding: 40px;
}

.ch-placeholder-icon {
  width: 80px;
  height: 80px;
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 28px rgba(15, 89, 47, 0.25);
  border: 1.5px solid rgba(168, 224, 44, 0.4);
}

.ch-placeholder-title {
  font-family: Inter, sans-serif;
  font-size: 20px;
  font-weight: 800;
  color: #1a3329;
}

.ch-placeholder-sub {
  font-size: 13.5px;
  color: rgba(11, 102, 48, 0.45);
  text-align: center;
  max-width: 260px;
}

.ch-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 22px;
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(0, 168, 84, 0.12);
  flex-shrink: 0;
}

.ch-back-btn {
  display: none;
  background: rgba(255, 255, 255, 0.4);
  border: 1px solid rgba(168, 224, 44, 0.3);
  padding: 6px;
  cursor: pointer;
  color: #1a3329;
  border-radius: 12px;
  transition: all 0.15s;
  flex-shrink: 0;
}

.ch-back-btn:hover { background: rgba(255, 255, 255, 0.6); box-shadow: 0 2px 10px rgba(15, 89, 47, 0.1); }

.ch-header-avatar-wrap { position: relative; }

.ch-header-avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(168, 224, 44, 0.6);
  box-shadow: 0 2px 8px rgba(15, 89, 47, 0.12);
}

.ch-header-info { display: flex; flex-direction: column; gap: 2px; }
.ch-header-name { font-size: 15px; font-weight: 700; color: #1a3329; }
.ch-header-status { font-size: 12px; color: rgba(11, 102, 48, 0.4); }
.ch-header-status.online { color: #22c55e; }

.ch-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px 22px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.ch-messages::-webkit-scrollbar { width: 3px; }
.ch-messages::-webkit-scrollbar-thumb { background: rgba(0, 168, 84, 0.2); border-radius: 10px; }

.ch-no-msgs {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  color: rgba(11, 102, 48, 0.4);
}

.ch-msg-row { display: flex; align-items: flex-end; gap: 8px; }
.ch-msg-row.mine { flex-direction: row-reverse; }
.ch-msg-avatar-slot { width: 30px; flex-shrink: 0; }
.ch-msg-avatar { width: 30px; height: 30px; border-radius: 50%; object-fit: cover; border: 1.5px solid rgba(168, 224, 44, 0.5); }
.ch-msg-avatar-placeholder { display: block; width: 30px; height: 30px; }

.ch-bubble-wrap { display: flex; align-items: center; gap: 5px; max-width: 64%; }
.ch-bubble-wrap.mine { flex-direction: row-reverse; }

.ch-bubble {
  max-width: 100%;
  padding: 11px 16px;
  border-radius: 20px;
  font-size: 13.5px;
  line-height: 1.5;
  position: relative;
  word-break: break-word;
  font-family: Inter, sans-serif;
}

.ch-bubble.theirs {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  color: #1a3329;
  border-bottom-left-radius: 4px;
  border: 1px solid rgba(168, 224, 44, 0.3);
  box-shadow: 0 2px 12px rgba(15, 89, 47, 0.08);
}

.ch-bubble.mine {
  background: linear-gradient(135deg, #0b6630, #2d6b50);
  color: rgb(245, 230, 66);
  border-bottom-right-radius: 4px;
  box-shadow: 0 4px 16px rgba(11, 102, 48, 0.3);
}

.ch-bubble.optimistic { opacity: 0.6; }

.ch-bubble-time { display: block; font-size: 10px; margin-top: 5px; opacity: 0.55; text-align: right; }

.ch-msg-actions { display: flex; align-items: center; position: relative; }

.ch-msg-more {
  width: 24px;
  height: 24px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: rgba(11, 102, 48, 0.2);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.15s;
}

.ch-msg-row.mine:hover .ch-msg-more { opacity: 1; }
.ch-msg-more:hover { background: rgba(255, 255, 255, 0.5); color: #0b6630; }

.ch-msg-dropdown {
  position: absolute;
  top: 28px;
  right: 0;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(168, 224, 44, 0.4);
  border-radius: 14px;
  box-shadow: 0 6px 24px rgba(15, 89, 47, 0.14);
  padding: 5px;
  min-width: 130px;
  z-index: 100;
}

.ch-msg-skeleton {
  height: 40px;
  width: 52%;
  border-radius: 18px;
  background: linear-gradient(90deg, rgba(255,255,255,0.3) 25%, rgba(168,224,44,0.12) 50%, rgba(255,255,255,0.3) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
}

.ch-msg-skeleton.right { align-self: flex-end; }

.ch-input-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 18px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-top: 1px solid rgba(0, 168, 84, 0.12);
  flex-shrink: 0;
}

.ch-input {
  flex: 1;
  padding: 12px 18px;
  border: 1.5px solid rgba(168, 224, 44, 0.4);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.4);
  font-family: Inter, sans-serif;
  font-size: 13.5px;
  color: #1a3329;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
}

.ch-input:focus {
  border-color: rgba(0, 168, 84, 0.6);
  box-shadow: 0 0 0 4px rgba(168, 224, 44, 0.12);
  background: rgba(255, 255, 255, 0.6);
}

.ch-input::placeholder { color: rgba(11, 102, 48, 0.35); }

.ch-send-btn {
  width: 46px;
  height: 46px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.4);
  color: rgba(11, 102, 48, 0.3);
  cursor: not-allowed;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s;
  border: 1.5px solid rgba(168, 224, 44, 0.3);
}

.ch-send-btn.active {
  background: linear-gradient(135deg, #0b6630, #2d6b50);
  color: rgb(245, 230, 66);
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(11, 102, 48, 0.3);
  border-color: transparent;
}

.ch-send-btn.active:hover { transform: scale(1.07); }
.ch-send-btn.active:active { transform: scale(0.96); }

@media (max-width: 768px) {
  .ch-root { border-radius: 0; height: calc(100vh - 70px); box-shadow: none; }

  .ch-sidebar {
    position: absolute; top: 0; left: 0; width: 100%; height: 100%;
    z-index: 10; border-radius: 0; border: none;
    background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(30px);
  }

  .ch-sidebar.hidden { transform: translateX(-100%); pointer-events: none; }
  .ch-sidebar.visible { transform: translateX(0); pointer-events: auto; }

  .ch-main { width: 100%; border-radius: 0; border: none; background: rgba(255, 255, 255, 0.08); }
  .ch-main.full { z-index: 5; }
  .ch-back-btn { display: flex; align-items: center; justify-content: center; }
  .ch-header { padding: 12px 14px; gap: 10px; }
  .ch-header-avatar { width: 38px; height: 38px; }
  .ch-messages { padding: 14px 12px; }
  .ch-bubble-wrap { max-width: 82%; }
  .ch-bubble { padding: 9px 13px; font-size: 13px; border-radius: 18px; }
  .ch-input-bar { padding: 10px 12px; gap: 8px; }
  .ch-input { padding: 10px 14px; font-size: 13px; border-radius: 14px; }
  .ch-send-btn { width: 42px; height: 42px; border-radius: 14px; }
  .ch-placeholder { padding: 24px; }
  .ch-placeholder-icon { width: 64px; height: 64px; border-radius: 18px; }
  .ch-placeholder-title { font-size: 17px; }
  .ch-placeholder-sub { font-size: 12.5px; }
  .ch-conv-more { opacity: 1; }
}
`;
