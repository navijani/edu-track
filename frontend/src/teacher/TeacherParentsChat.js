import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ChatWindow from '../components/ChatWindow'; // Adjust path if needed

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
        <div style={styles.container}>
            {/* LEFT PANEL: Parent Directory */}
            <div style={styles.leftPanel}>
                <div style={styles.header}>
                    <h2 style={{ margin: '0 0 5px 0', color: '#2c3e50' }}>Parent Directory</h2>
                    <input 
                        type="text" 
                        placeholder="🔍 Search parent or child name..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={styles.searchBar}
                    />
                </div>

                <div style={styles.listContainer}>
                    {filteredParents.map((parent) => (
                        <div 
                            key={parent.id} 
                            onClick={() => setSelectedParent(parent)}
                            style={{
                                ...styles.card,
                                borderLeft: selectedParent?.id === parent.id ? '4px solid #3498db' : '4px solid transparent',
                                backgroundColor: selectedParent?.id === parent.id ? '#f4f9fd' : 'white'
                            }}
                        >
                            <div style={styles.avatar}>{parent.name.charAt(0).toUpperCase()}</div>
                            <div style={styles.info}>
                                <h4 style={styles.name}>{parent.name}</h4>
                                <p style={styles.childText}>Parent of: <strong>{parent.childName}</strong></p>
                            </div>
                        </div>
                    ))}
                    {filteredParents.length === 0 && (
                        <p style={{ textAlign: 'center', color: '#95a5a6', marginTop: '20px' }}>No parents found.</p>
                    )}
                </div>
            </div>

            {/* RIGHT PANEL: Chat Window */}
            <div style={styles.rightPanel}>
                {!selectedParent ? (
                    <div style={styles.emptyState}>
                        <p>Select a parent from the list to start chatting.</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', padding: '20px' }}>
                        <ChatWindow 
                            currentUser={user} // The Teacher
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

const styles = {
    container: { display: 'flex', gap: '25px', height: 'calc(100vh - 80px)', alignItems: 'flex-start' },
    leftPanel: { flex: '1', minWidth: '280px', maxWidth: '350px', display: 'flex', flexDirection: 'column', height: '100%' },
    header: { marginBottom: '15px' },
    searchBar: { padding: '10px 15px', borderRadius: '8px', border: '1px solid #ddd', width: '100%', fontSize: '14px', outline: 'none', boxSizing: 'border-box', marginTop: '10px' },
    listContainer: { overflowY: 'auto', flexGrow: 1, paddingRight: '5px' },
    card: { padding: '15px', borderRadius: '8px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '15px', border: '1px solid #eee', cursor: 'pointer', transition: 'background 0.2s' },
    avatar: { width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#9b59b6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 'bold', flexShrink: 0 },
    info: { overflow: 'hidden' },
    name: { margin: '0 0 3px 0', color: '#2c3e50', fontSize: '15px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
    childText: { margin: 0, color: '#7f8c8d', fontSize: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
    
    rightPanel: { flex: '2', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', height: '100%', overflowY: 'auto', border: '1px solid #e9ecef' },
    emptyState: { height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#95a5a6' },
};

export default TeacherParentsChat;