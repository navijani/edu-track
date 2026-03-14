import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const ChatWindow = ({ currentUser, partnerName, parentId, teacherId }) => {
    const [messages, setMessages] = useState([]);
    const [newMsg, setNewMsg] = useState('');
    const messagesEndRef = useRef(null);

    // Fetch messages from the database
    const fetchMessages = async () => {
        if (!parentId || !teacherId) return;
        try {
            const res = await axios.get(`http://localhost:8080/api/chat?parentId=${parentId}&teacherId=${teacherId}`);
            setMessages(res.data);
        } catch (err) {
            console.error("Error fetching chat:", err);
        }
    };

    // Auto-refresh chat every 3 seconds for a "Live" feel
    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 3000);
        return () => clearInterval(interval);
    }, [parentId, teacherId]);

    // Auto-scroll to the bottom when a new message arrives
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMsg.trim()) return;

        try {
            await axios.post('http://localhost:8080/api/chat', {
                parentId: parentId,
                teacherId: teacherId,
                senderId: currentUser.id,
                senderName: currentUser.name,
                message: newMsg
            });
            setNewMsg('');
            fetchMessages(); // Instantly update UI
        } catch (err) {
            alert("Network error: Could not send message.");
        }
    };

    return (
        <div style={styles.chatContainer}>
            {/* Chat Header */}
            <div style={styles.header}>
                <div style={styles.avatar}>{partnerName.charAt(0).toUpperCase()}</div>
                <div>
                    <h3 style={{ margin: 0, color: '#2c3e50', fontSize: '16px' }}>{partnerName}</h3>
                    <span style={{ fontSize: '12px', color: '#2ecc71' }}>● Online</span>
                </div>
            </div>

            {/* Chat Messages Area */}
            <div style={styles.messagesArea}>
                {messages.length === 0 ? (
                    <div style={styles.emptyState}>No messages yet. Say hello! 👋</div>
                ) : (
                    messages.map((msg, index) => {
                        const isMe = msg.senderId === currentUser.id;
                        return (
                            <div key={index} style={{
                                ...styles.messageWrapper,
                                justifyContent: isMe ? 'flex-end' : 'flex-start'
                            }}>
                                <div style={{
                                    ...styles.messageBubble,
                                    backgroundColor: isMe ? '#dcf8c6' : '#ffffff', // WhatsApp green & white
                                    borderRadius: isMe ? '12px 12px 0 12px' : '12px 12px 12px 0'
                                }}>
                                    <p style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#2c3e50' }}>
                                        {msg.message}
                                    </p>
                                    <span style={{ fontSize: '10px', color: '#95a5a6', float: 'right', marginLeft: '15px' }}>
                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} /> {/* Invisible div to scroll to */}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSend} style={styles.inputArea}>
                <input
                    type="text"
                    value={newMsg}
                    onChange={(e) => setNewMsg(e.target.value)}
                    placeholder="Type a message..."
                    style={styles.input}
                />
                <button type="submit" style={styles.sendBtn}>➤</button>
            </form>
        </div>
    );
};

const styles = {
    chatContainer: { display: 'flex', flexDirection: 'column', height: '500px', width: '100%', maxWidth: '600px', backgroundColor: '#efeae2', borderRadius: '12px', overflow: 'hidden', border: '1px solid #ddd', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' },
    header: { display: 'flex', alignItems: 'center', padding: '15px', backgroundColor: '#f0f2f5', borderBottom: '1px solid #ddd', gap: '15px' },
    avatar: { width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#bdc3c7', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 'bold' },
    messagesArea: { flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' },
    messageWrapper: { display: 'flex', width: '100%' },
    messageBubble: { maxWidth: '75%', padding: '10px 15px', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' },
    inputArea: { display: 'flex', padding: '15px', backgroundColor: '#f0f2f5', gap: '10px' },
    input: { flex: 1, padding: '12px 15px', borderRadius: '25px', border: 'none', outline: 'none', fontSize: '15px' },
    sendBtn: { width: '45px', height: '45px', borderRadius: '50%', backgroundColor: '#00a884', color: 'white', border: 'none', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'rotate(-45deg)', transition: 'background 0.2s' },
    emptyState: { textAlign: 'center', color: '#7f8c8d', fontStyle: 'italic', marginTop: 'auto', marginBottom: 'auto' }
};

export default ChatWindow;