import React, { useState, useEffect } from 'react';
import axios from 'axios';

const StudentForum = ({ user }) => {
    const [posts, setPosts] = useState([]);
    const [subjects, setSubjects] = useState([]); 
    const [newMsg, setNewMsg] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [replyingTo, setReplyingTo] = useState(null); 

    // 1. Fetch Subjects from DB
    useEffect(() => {
        const fetchSubjects = async () => {
            try {
                const res = await axios.get('http://localhost:8080/api/subjects');
                setSubjects(res.data);
                if (res.data.length > 0) setSelectedSubject(res.data[0].title);
            } catch (err) { console.error("Error fetching subjects", err); }
        };
        fetchSubjects();
    }, []);

    // 2. Fetch Posts based on selected subject
    const fetchPosts = async () => {
        if (!selectedSubject) return;
        try {
            const res = await axios.get(`http://localhost:8080/api/forum?subject=${selectedSubject}`);
            setPosts(res.data);
        } catch (err) { console.error(err); }
    };

    useEffect(() => { 
        fetchPosts(); 
        setReplyingTo(null); 
    }, [selectedSubject]);

    const handlePost = async (e) => {
        e.preventDefault();
        if (!newMsg.trim()) return;
        try {
            await axios.post('http://localhost:8080/api/forum', {
                name: user.name, 
                role: user.role.toLowerCase(), 
                subject: selectedSubject, 
                message: newMsg,
                parentId: replyingTo ? replyingTo.id : null 
            });
            setNewMsg('');
            setReplyingTo(null); 
            fetchPosts();
        } catch (err) { alert("Network Error: Check if Backend is running"); }
    };

    const mainPosts = posts.filter(p => !p.parentId);
    const replies = posts.filter(p => p.parentId);

    return (
        <div style={styles.container}>
            
            {/* LEFT SIDE: Input Form */}
            <div style={styles.leftPanel}>
                <div style={styles.stickyContainer}>
                    <h2 style={{ margin: '0 0 10px 0', color: '#1e293b', fontWeight: '800' }}>EduTalk Forum</h2>
                    
                    <div style={styles.glassCard}>
                        {replyingTo ? (
                            <div style={styles.replyBanner}>
                                <span style={{ fontSize: '13px', color: '#6b21a8' }}>
                                    ↪ Replying to <strong>{replyingTo.name}</strong>
                                </span>
                                <button onClick={() => setReplyingTo(null)} style={styles.cancelBtn}>Cancel</button>
                            </div>
                        ) : (
                            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '15px' }}>
                                Connect with your peers and teachers.
                            </p>
                        )}
                        
                        <label style={styles.label}>Select Subject Room:</label>
                        <select 
                            value={selectedSubject} 
                            onChange={(e) => setSelectedSubject(e.target.value)} 
                            style={styles.select}
                            disabled={replyingTo !== null} 
                        >
                            {subjects.map((sub, index) => (
                                <option key={index} value={sub.title}>{sub.title}</option>
                            ))}
                        </select>

                        <form onSubmit={handlePost} style={styles.form}>
                            <textarea 
                                value={newMsg} 
                                onChange={(e) => setNewMsg(e.target.value)}
                                placeholder={replyingTo ? `Write your response...` : `Share your thoughts in ${selectedSubject}...`}
                                style={styles.textarea}
                            />
                            <button type="submit" style={styles.btn}>
                                {replyingTo ? "✉️ Send Reply" : "🚀 Post to Forum"}
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* RIGHT SIDE: Message Feed */}
            <div style={styles.rightPanel}>
                <div style={styles.feedHeader}>
                    <div>
                        <h3 style={{ margin: 0, color: '#1e293b' }}>{selectedSubject} Room</h3>
                        <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>{mainPosts.length} Active Conversations</p>
                    </div>
                </div>

                <div style={styles.messagesContainer}>
                    {mainPosts.length === 0 ? (
                        <div style={styles.emptyState}>
                            <p>No messages here yet. Start the conversation!</p>
                        </div>
                    ) : (
                        mainPosts.map(post => {
                            const isTeacher = post.role && post.role.toLowerCase() === 'teacher';
                            const postReplies = replies
                                .filter(r => r.parentId === post.id)
                                .sort((a, b) => new Date(a.date) - new Date(b.date));

                            return (
                                <div key={post.id} style={{ marginBottom: '30px' }}>
                                    {/* MAIN THREAD POST */}
                                    <div style={{
                                        ...styles.postCard, 
                                        borderLeft: isTeacher ? '5px solid #10b981' : '5px solid #3498db',
                                    }}>
                                        <div style={styles.postHeader}>
                                            <div style={{...styles.avatar, background: isTeacher ? '#10b981' : '#3498db'}}>
                                                {post.name.charAt(0)}
                                            </div>
                                            <div>
                                                <strong style={{ fontSize: '15px', color: '#1e293b' }}>{post.name}</strong> 
                                                <span style={{
                                                    ...styles.roleBadge,
                                                    background: isTeacher ? '#f0fdf4' : '#eff6ff',
                                                    color: isTeacher ? '#10b981' : '#3498db'
                                                }}>
                                                    {isTeacher ? 'STAFF' : 'STUDENT'}
                                                </span>
                                            </div>
                                            <small style={{ marginLeft: 'auto', color: '#94a3b8' }}>
                                                {new Date(post.date).toLocaleDateString()}
                                            </small>
                                        </div>
                                        <p style={styles.messageText}>{post.message}</p>
                                        <div style={{ textAlign: 'right' }}>
                                            <button onClick={() => setReplyingTo(post)} style={styles.replyBtn}>
                                                Reply
                                            </button>
                                        </div>
                                    </div>

                                    {/* NESTED REPLIES */}
                                    {postReplies.length > 0 && (
                                        <div style={styles.replyThread}>
                                            {postReplies.map(reply => {
                                                const isRepTeacher = reply.role && reply.role.toLowerCase() === 'teacher';
                                                return (
                                                    <div key={reply.id} style={{
                                                        ...styles.replyCard,
                                                        borderLeft: isRepTeacher ? '3px solid #10b981' : '3px solid #e2e8f0',
                                                        background: isRepTeacher ? '#f0fdf4' : '#f8fafc'
                                                    }}>
                                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '5px' }}>
                                                            <strong style={{ color: '#1e293b', fontSize: '13px' }}>{reply.name}</strong>
                                                            {isRepTeacher && <span style={{fontSize: '9px', color: '#10b981', fontWeight: '900'}}>VERIFIED</span>}
                                                            <small style={{ marginLeft: 'auto', color: '#94a3b8', fontSize: '11px' }}>
                                                                {new Date(reply.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                            </small>
                                                        </div>
                                                        <p style={{ margin: 0, fontSize: '13px', color: '#475569', whiteSpace: 'pre-wrap' }}>
                                                            {reply.message}
                                                        </p>
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

// Internal Styles
const styles = {
    container: { display: 'flex', gap: '20px', height: '80vh', padding: '10px' },
    leftPanel: { flex: '1', minWidth: '320px', maxWidth: '380px' },
    stickyContainer: { position: 'sticky', top: '0' },
    glassCard: { background: 'white', padding: '20px', borderRadius: '20px', border: '1px solid #f1f5f9', boxShadow: '0 10px 25px rgba(0,0,0,0.03)' },
    rightPanel: { flex: '2', display: 'flex', flexDirection: 'column', background: 'white', borderRadius: '24px', border: '1px solid #f1f5f9', boxShadow: '0 10px 30px rgba(0,0,0,0.04)', overflow: 'hidden' },
    feedHeader: { padding: '20px 25px', borderBottom: '1px solid #f1f5f9', background: '#ffffff' },
    messagesContainer: { padding: '25px', overflowY: 'auto', flexGrow: '1', background: '#fcfcfd' },
    label: { fontWeight: '700', fontSize: '13px', marginBottom: '8px', display: 'block', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' },
    select: { padding: '12px', marginBottom: '20px', borderRadius: '12px', width: '100%', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none', background: '#f8fafc' },
    form: { display: 'flex', flexDirection: 'column', gap: '15px' },
    textarea: { padding: '15px', borderRadius: '15px', border: '1px solid #e2e8f0', minHeight: '120px', resize: 'none', fontFamily: 'inherit', fontSize: '14px', outline: 'none', background: '#f8fafc' },
    btn: { padding: '14px', background: 'linear-gradient(90deg, #3498db 0%, #2980b9 100%)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '14px', boxShadow: '0 4px 12px rgba(52, 152, 219, 0.2)' },
    postCard: { padding: '20px', borderRadius: '18px', border: '1px solid #f1f5f9', background: 'white', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' },
    postHeader: { display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '10px' },
    avatar: { width: '32px', height: '32px', borderRadius: '50%', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px' },
    roleBadge: { fontSize: '10px', padding: '3px 8px', borderRadius: '6px', fontWeight: '800', marginLeft: '8px' },
    messageText: { margin: '0 0 15px 0', lineHeight: '1.6', color: '#334155', fontSize: '15px', whiteSpace: 'pre-wrap' },
    replyBtn: { background: '#f1f5f9', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '12px', fontWeight: '700', padding: '6px 15px', borderRadius: '8px' },
    replyThread: { marginLeft: '45px', marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '10px', borderLeft: '2px solid #f1f5f9' },
    replyCard: { padding: '12px 16px', borderRadius: '12px', fontSize: '14px' },
    replyBanner: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f5f3ff', padding: '10px 15px', borderRadius: '10px', marginBottom: '15px', borderLeft: '4px solid #7c3aed' },
    cancelBtn: { background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '12px', fontWeight: '800' },
    emptyState: { textAlign: 'center', padding: '60px', color: '#94a3b8' }
};

export default StudentForum;