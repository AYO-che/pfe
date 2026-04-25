import { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function BlogsPage() {
    const [blogs, setBlogs] = useState([]);
    const [open, setOpen] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("http://localhost:5000/blog")
            .then(res => res.json())
            .then(data => {
                setBlogs(data.posts || []);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const toggle = (id) => setOpen(prev => prev === id ? null : id);

    return (
        <div className="blogs-page">
           
            <div className="blogs-container">

                <div className="blogs-header">
                    <span className="blogs-badge">
                        <span className="blogs-badge-icon">✦</span>
                        Our Blog
                    </span>
                    <h1 className="blogs-title">
                        Health tips &{" "}
                        <span className="blogs-title-highlight">
                            <span className="blogs-title-highlight-text">expert insights</span>
                            <span className="blogs-title-underline" />
                        </span>
                    </h1>
                    <p className="blogs-subtitle">
                        Evidence-based articles from our nutritionists — written to help you transform.
                    </p>
                </div>

                {loading ? (
                    <div className="blogs-state-msg">Loading...</div>
                ) : blogs.length === 0 ? (
                    <div className="blogs-state-msg">No articles yet.</div>
                ) : (
                    <div className="blogs-list">
                        {blogs.map((b, i) => (
                            <BlogRow key={b.id} blog={b} flip={i % 2 !== 0} open={open === b.id} onToggle={() => toggle(b.id)} />
                        ))}
                    </div>
                )}

            </div>
        </div>
    );
}

function BlogRow({ blog, flip, open, onToggle }) {
    const [hov, setHov] = useState(false);

    return (
        <div className={`blog-row ${hov || open ? "blog-row--active" : ""}`}>
            <div
                onMouseEnter={() => setHov(true)}
                onMouseLeave={() => setHov(false)}
                onClick={onToggle}
                className={`blog-row-inner ${flip ? "blog-row-inner--flip" : ""}`}
            >
                <div className="blog-row-img-wrap">
                    <img
                        src={blog.images?.[0] || "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80"}
                        alt={blog.title}
                        className={`blog-row-img ${hov ? "blog-row-img--hov" : ""}`}
                    />
                    <div className={`blog-row-overlay ${flip ? "blog-row-overlay--flip" : "blog-row-overlay--normal"}`} />
                    <span className={`blog-row-tag ${flip ? "blog-row-tag--flip" : "blog-row-tag--normal"}`}>
                        Health
                    </span>
                </div>

                <div className="blog-row-body">
                    <h2 className="blog-row-title">{blog.title}</h2>
                    <p className="blog-row-excerpt">{blog.content?.slice(0, 120) + "..."}</p>
                    <div
                        className="blog-row-cta"
                        style={{ color: open || hov ? "#c8a800" : "#2d6b50" }}
                    >
                        {open ? "Close" : "Read article"}
                        <svg
                            width="13" height="13" viewBox="0 0 24 24"
                            fill="none" stroke="currentColor"
                            strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                            style={{
                                transition: "transform 0.22s ease",
                                transform: open ? "rotate(90deg)" : hov ? "translateX(3px)" : "none"
                            }}
                        >
                            <line x1="5" y1="12" x2="19" y2="12" />
                            <polyline points="12 5 19 12 12 19" />
                        </svg>
                    </div>
                </div>
            </div>

            {open && (
                <div className="blog-content">
                    {blog.content?.split("\n\n").map((para, i, arr) => (
                        <p key={i} style={{ marginBottom: i < arr.length - 1 ? 18 : 0 }}>
                            {para}
                        </p>
                    ))}
                </div>
            )}
        </div>
    );
}