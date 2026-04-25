import { useState } from "react";
import { useAuth } from "../../context/Authcontext";
import { CSS, MOCK_NOTIFS, NOTIF_META } from "./Shared";

export default function ProfileNotifsPage() {
  const { user } = useAuth();
  const [notifs, setNotifs]       = useState(user?.notifications || MOCK_NOTIFS);
  const [visibleCount, setVisible] = useState(4);

  const unread  = notifs.filter(n => !n.read).length;
  const markAll = () => setNotifs(n => n.map(x => ({ ...x, read: true })));

  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif" }}>
      <style>{CSS}</style>

      <div style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 800, color: "#1a3329" }}>Notifications</div>
        <div style={{ fontSize: 13, color: "#5a7a6e", marginTop: 4 }}>Stay up to date with your plan and appointments.</div>
      </div>

      <div className="pr-card pr-slide-in">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            {unread > 0 && (
              <span style={{ background: "#f5e642", color: "#1a3329", borderRadius: 999, padding: "2px 8px", fontSize: 10.5, fontWeight: 800 }}>{unread} new</span>
            )}
          </div>
          {unread > 0 && (
            <button onClick={markAll} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12.5, fontWeight: 600, color: "#4f9e7a", fontFamily: "'DM Sans',sans-serif" }}>
              Mark all read
            </button>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          {notifs.slice(0, visibleCount).map(n => {
            const m = NOTIF_META[n.type] || NOTIF_META.blog;
            return (
              <div
                key={n.id}
                className="pr-notif"
                style={{ background: n.read ? "transparent" : "rgba(245,230,66,0.04)", border: `1px solid ${n.read ? "transparent" : "rgba(245,230,66,0.15)"}` }}
                onClick={() => setNotifs(p => p.map(x => x.id === n.id ? { ...x, read: true } : x))}
              >
                <div style={{ width: 38, height: 38, borderRadius: 10, background: m.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0 }}>{m.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 3 }}>
                    <span style={{ fontSize: 10.5, fontWeight: 700, color: m.color, background: m.bg, borderRadius: 999, padding: "2px 7px" }}>{m.label}</span>
                    <span style={{ fontSize: 11, color: "#9ab8ae", flexShrink: 0 }}>{n.date}</span>
                  </div>
                  <div style={{ fontSize: 13, color: "#1a3329", fontWeight: n.read ? 400 : 600, lineHeight: 1.5 }}>{n.text}</div>
                </div>
                {!n.read && <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#f5e642", flexShrink: 0, marginTop: 8 }} />}
              </div>
            );
          })}
        </div>

        {notifs.length > visibleCount && (
          <button
            onClick={() => setVisible(v => v + 3)}
            style={{ width: "100%", marginTop: 12, background: "transparent", border: "1.5px solid rgba(79,158,122,0.18)", borderRadius: 10, padding: "10px 0", fontSize: 13, fontWeight: 600, color: "#4f9e7a", cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
            Load more
          </button>
        )}
      </div>
    </div>
  );
}