import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ChatWindow from '../components/ChatWindow';
import '../styles/Teacher.css';

const TeacherParentsChat = ({ user }) => {
    const [parents, setParents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedParent, setSelectedParent] = useState(null);

    useEffect(() => {
        const fetchParents = async () => {
            try {
                const res = await axios.get('http://localhost:8080/api/teacher/parents');
                setParents(res.data);
            } catch (err) {
                console.error("Error fetching parents:", err);
            }
        };
        fetchParents();
    }, []);

    const filteredParents = parents.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.childName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="t-chat-container">
            {/* LEFT PANEL: Parent Directory */}
            <div className="t-chat-left">
                <div className="t-header-mini">
                    <h2 style={{ color: '#1e293b', marginBottom: '10px' }}>Parent Directory</h2>
                    <input 
                        type="text" 
                        placeholder="🔍 Search parent or child..." 
                        className="t-chat-search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="t-parent-list-scroll">
                    {filteredParents.map((parent) => (
                        <div 
                            key={parent.id} 
                            onClick={() => setSelectedParent(parent)}
                            className={`t-parent-card ${selectedParent?.id === parent.id ? 'active' : ''}`}
                        >
                            <div className="t-parent-avatar">
                                {parent.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="t-student-info">
                                <h4 style={{ margin: 0, fontSize: '15px' }}>{parent.name}</h4>
                                <p style={{ margin: 0, color: '#64748b', fontSize: '12px' }}>
                                    Parent of: <strong>{parent.childName}</strong>
                                </p>
                            </div>
                        </div>
                    ))}
                    {filteredParents.length === 0 && (
                        <div className="t-empty-state" style={{ marginTop: '20px' }}>
                            <p>No parents found.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* RIGHT PANEL: Chat Window Area */}
            <div className="t-chat-right">
                {!selectedParent ? (
                    <div className="t-empty-state" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ fontSize: '1.2rem', color: '#94a3b8' }}>
                                Select a parent from the list to start a secure conversation.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div style={{ height: '100%', padding: '20px' }}>
                        <ChatWindow 
                            currentUser={user} 
                            partnerName={`${selectedParent.name} (Parent of ${selectedParent.childName})`} 
                            parentId={selectedParent.id} 
                            teacherId={user.id} 
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default TeacherParentsChat;