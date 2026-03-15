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
                role: user.role.toLowerCase(), // Standardize role to lowercase just in case
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
                    <h2 style={{ margin: '0 0 5px 0' }}>Discussion Forum</h2>
                    
                    {replyingTo ? (
                        <div style={styles.replyBanner}>
                            <span style={{ fontSize: '13px', color: '#34495e' }}>
                                ↪ Replying to <strong>{replyingTo.name}</strong>
                            </span>
                            <button onClick={() => setReplyingTo(null)} style={styles.cancelBtn}>Cancel</button>
                        </div>
                    ) : (
                        <p style={{ color: '#7f8c8d', fontSize: '14px', marginBottom: '20px' }}>
                            Ask questions and help your classmates.
                        </p>
                    )}
                    
                    <label style={{ fontWeight: 'bold', marginBottom: '8px', display: 'block', color: '#2c3e50' }}>
                        Select Subject:
                    </label>
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
                            placeholder={replyingTo ? `Type your reply...` : `Ask a question in ${selectedSubject || 'this subject'}...`}
                            style={styles.textarea}
                        />
                        <button type="submit" style={styles.btn}>
                            {replyingTo ? "✉️ Send Reply" : "🚀 Post to Forum"}
                        </button>
                    </form>
                </div>
            </div>

            {/* RIGHT SIDE: Message Feed */}
            <div style={styles.rightPanel}>
                <div style={styles.feedHeader}>
                    <h3 style={{ margin: 0 }}>Conversations in {selectedSubject}</h3>
                    <span style={styles.badge}>{mainPosts.length} Threads</span>
                </div>

                <div style={styles.messagesContainer}>
                    {mainPosts.length === 0 ? (
                        <div style={styles.emptyState}>
                            <p>No discussions yet for this subject. Be the first to ask!</p>
                        </div>
                    ) : (
                        mainPosts.map(post => {
                            // FIX: Case-insensitive check for teacher role on main posts
                            const isTeacher = post.role && post.role.toLowerCase() === 'teacher';
                            
                            const postReplies = replies
                                .filter(r => r.parentId === post.id)
                                .sort((a, b) => new Date(a.date) - new Date(b.date));

                            return (
                                <div key={post.id} style={{ marginBottom: '25px' }}>
                                    {/* MAIN THREAD POST */}
                                    <div style={{
                                        ...styles.postCard, 
                                        borderLeft: isTeacher ? '5px solid #2ecc71' : '5px solid #3498db',
                                        backgroundColor: isTeacher ? '#fafdff' : '#ffffff'
                                    }}>
                                        <div style={styles.postHeader}>
                                            <strong style={{ fontSize: '16px', color: '#2c3e50' }}>{post.name}</strong> 
                                            <span style={{
                                                ...styles.roleBadge,
                                                backgroundColor: isTeacher ? '#e8f8f5' : '#ebf5fb',
                                                color: isTeacher ? '#27ae60' : '#2980b9'
                                            }}>
                                                {isTeacher ? '👨‍🏫 Teacher' : '🎓 Student'}
                                            </span>
                                            <small style={{ marginLeft: 'auto', color: '#95a5a6', fontSize: '12px' }}>
                                                {new Date(post.date).toLocaleString()}
                                            </small>
                                        </div>
                                        <p style={{ margin: '10px 0', lineHeight: '1.5', color: '#34495e', whiteSpace: 'pre-wrap' }}>
                                            {post.message}
                                        </p>
                                        <div style={{ textAlign: 'right', marginTop: '10px' }}>
                                            <button onClick={() => setReplyingTo(post)} style={styles.replyBtn}>
                                                💬 Reply
                                            </button>
                                        </div>
                                    </div>

                                    {/* NESTED REPLIES */}
                                    {postReplies.length > 0 && (
                                        <div style={styles.replyThread}>
                                            {postReplies.map(reply => {
                                                // FIX: Case-insensitive check for teacher role on replies
                                                const isRepTeacher = reply.role && reply.role.toLowerCase() === 'teacher';
                                                
                                                return (
                                                    <div key={reply.id} style={{
                                                        ...styles.replyCard,
                                                        borderLeft: isRepTeacher ? '3px solid #2ecc71' : '3px solid #bdc3c7',
                                                        backgroundColor: isRepTeacher ? '#fafdff' : '#f8f9fa'
                                                    }}>
                                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '5px' }}>
                                                            <strong style={{ color: '#2c3e50' }}>{reply.name}</strong>
                                                            {isRepTeacher && <span style={{fontSize: '10px', color: '#27ae60', fontWeight: 'bold'}}>✔ Teacher</span>}
                                                            <small style={{ marginLeft: 'auto', color: '#95a5a6', fontSize: '11px' }}>
                                                                {new Date(reply.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                            </small>
                                                        </div>
                                                        <p style={{ margin: 0, fontSize: '14px', color: '#34495e', whiteSpace: 'pre-wrap' }}>
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

// Styles 
const styles = {
    container: { display: 'flex', gap: '30px', height: 'calc(100vh - 100px)', alignItems: 'flex-start' },
    leftPanel: { flex: '1', minWidth: '300px', maxWidth: '400px' },
    stickyContainer: { position: 'sticky', top: '0', backgroundColor: '#f4f6f7', paddingBottom: '20px' },
    rightPanel: { flex: '2', display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', overflow: 'hidden' },
    feedHeader: { padding: '20px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fafbfc' },
    messagesContainer: { padding: '20px', overflowY: 'auto', flexGrow: '1' },
    select: { padding: '12px', marginBottom: '20px', borderRadius: '8px', width: '100%', border: '1px solid #ddd', fontSize: '15px' },
    form: { display: 'flex', flexDirection: 'column', gap: '15px' },
    textarea: { padding: '15px', borderRadius: '8px', border: '1px solid #ddd', minHeight: '150px', resize: 'vertical', fontFamily: 'inherit', fontSize: '15px' },
    btn: { padding: '12px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px', transition: 'background 0.2s' },
    postCard: { padding: '20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.02)', border: '1px solid #f1f1f1' },
    postHeader: { display: 'flex', gap: '10px', alignItems: 'center' },
    roleBadge: { fontSize: '11px', padding: '4px 8px', borderRadius: '12px', textTransform: 'uppercase', fontWeight: 'bold' },
    badge: { backgroundColor: '#ecf0f1', color: '#7f8c8d', padding: '4px 10px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold' },
    emptyState: { textAlign: 'center', padding: '40px', color: '#95a5a6', backgroundColor: '#f9f9f9', borderRadius: '8px', border: '1px dashed #ddd' },
    replyBanner: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#eef2f5', padding: '10px', borderRadius: '8px', marginBottom: '15px', borderLeft: '3px solid #f39c12' },
    cancelBtn: { background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' },
    replyBtn: { background: 'none', border: 'none', color: '#7f8c8d', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold', padding: '5px 10px', borderRadius: '4px', transition: 'color 0.2s' },
    replyThread: { marginLeft: '40px', marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' },
    replyCard: { padding: '10px 15px', borderRadius: '6px', fontSize: '14px', border: '1px solid #eee' }
};

export default StudentForum;