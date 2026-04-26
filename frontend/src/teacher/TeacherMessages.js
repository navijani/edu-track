import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const TeacherMessages = ({ user }) => {
    const [posts, setPosts] = useState([]);
    const [newMsg, setNewMsg] = useState('');
    const [replyingTo, setReplyingTo] = useState(null); 

    const fetchPosts = useCallback(async () => {
        if (!user.subject) return;
        try {
            const res = await axios.get(`http://localhost:8080/api/forum?subject=${encodeURIComponent(user.subject)}`);
            setPosts(res.data);
        } catch (err) { console.error(err); }
    }, [user.subject]);

    useEffect(() => { fetchPosts(); }, [fetchPosts]);

    const handlePost = async (e) => {
        e.preventDefault();
        if (!newMsg.trim()) return;
        try {
            await axios.post('http://localhost:8080/api/forum', {
                name: user.name, 
                role: 'teacher', 
                subject: user.subject, 
                message: newMsg,
                parentId: replyingTo ? replyingTo.id : null
            });
            setNewMsg('');
            setReplyingTo(null); 
            fetchPosts(); 
        } catch (err) { alert("Network Error: Check Backend"); }
    };

    const mainPosts = posts.filter(p => !p.parentId);
    const replies = posts.filter(p => p.parentId);

    return (
        <div className="t-forum-container">
            {/* LEFT SIDE: Post Form */}
            <div className="t-forum-left">
                <div className="t-forum-form-card">
                    <h2 style={{ margin: '0 0 10px 0', color: '#1e293b' }}>
                        {replyingTo ? 'Reply to Student' : 'Announcements'}
                    </h2>
                    
                    {replyingTo ? (
                        <div className="t-adddoc-preview-box" style={{ marginBottom: '15px', borderLeftColor: '#f39c12', background: '#fffaf0' }}>
                            <p style={{ margin: 0, fontSize: '13px' }}>
                                ↪ Replying to <strong>{replyingTo.name}</strong>
                                <button onClick={() => setReplyingTo(null)} className="t-cancel-link" style={{ float: 'right', color: '#e74c3c', border: 'none', background: 'none', cursor: 'pointer' }}>Cancel</button>
                            </p>
                        </div>
                    ) : (
                        <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>
                            Broadcast updates to your <strong>{user.subject}</strong> class.
                        </p>
                    )}

                    <form onSubmit={handlePost}>
                        <textarea 
                            className="t-forum-textarea"
                            value={newMsg} 
                            onChange={(e) => setNewMsg(e.target.value)}
                            placeholder={replyingTo ? "Type your reply..." : "Write something to the class..."}
                        />
                        <button type="submit" className="t-btn-broadcast">
                            {replyingTo ? "✉️ Send Reply" : "📢 Broadcast Message"}
                        </button>
                    </form>
                </div>
            </div>

            {/* RIGHT SIDE: Discussion Feed */}
            <div className="t-forum-right">
                <div className="t-forum-feed-header">
                    <h3 style={{ margin: 0, color: '#314c7a' }}>{user.subject} Discussions</h3>
                    <span className="t-score-badge blue">{mainPosts.length} Active Threads</span>
                </div>

                <div className="t-forum-scroll">
                    {mainPosts.length === 0 ? (
                        <div className="t-empty-state">
                            <p>No messages in the forum yet.</p>
                        </div>
                    ) : (
                        mainPosts.map(post => {
                            const isTeacher = post.role?.toLowerCase() === 'teacher';
                            const postReplies = replies.filter(r => r.parentId === post.id).sort((a, b) => new Date(a.date) - new Date(b.date));

                            return (
                                <div key={post.id}>
                                    {/* MAIN POST BUBBLE */}
                                    <div className={`t-post-card ${isTeacher ? 'teacher-post' : 'student-post'}`}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <strong style={{ color: '#1e293b' }}>{post.name}</strong> 
                                            <span className={`t-role-badge`} style={{ background: isTeacher ? '#dcfce7' : '#dbeafe', color: isTeacher ? '#166534' : '#1e40af' }}>
                                                {isTeacher ? 'Teacher' : 'Student'}
                                            </span>
                                            <small style={{ marginLeft: 'auto', color: '#94a3b8' }}>
                                                {new Date(post.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </small>
                                        </div>
                                        <p style={{ margin: '12px 0', lineHeight: '1.6', color: '#334155', whiteSpace: 'pre-wrap' }}>
                                            {post.message}
                                        </p>
                                        <div style={{ textAlign: 'right' }}>
                                            <button onClick={() => setReplyingTo(post) } className="t-add-option-link" style={{ fontSize: '13px' ,border: 'none', background: 'none', cursor: 'pointer', color: '#3b82f6' }}>
                                                💬 Reply
                                            </button>
                                        </div>
                                    </div>

                                    {/* NESTED REPLIES */}
                                    {postReplies.length > 0 && (
                                        <div className="t-reply-thread">
                                            {postReplies.map(reply => {
                                                const isRepTeacher = reply.role?.toLowerCase() === 'teacher';
                                                return (
                                                    <div key={reply.id} className="t-reply-card" style={{ borderLeft: isRepTeacher ? '3px solid #2ecc71' : '3px solid #cbd5e1' }}>
                                                        <div style={{ marginBottom: '4px' }}>
                                                            <strong>{reply.name}</strong>
                                                            {isRepTeacher && <span style={{ color: '#2ecc71', fontSize: '10px', marginLeft: '5px' }}>✔</span>}
                                                        </div>
                                                        <p style={{ margin: 0, color: '#475569' }}>{reply.message}</p>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

export default TeacherMessages;