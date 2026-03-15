import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ChatWindow from '../components/ChatWindow';


const ParentDashboard = ({ user, onLogout }) => {
    const [data, setData] = useState(null);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('overview');
    
    // State for the teachers list
    const [teachers, setTeachers] = useState([]);
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [teacherError, setTeacherError] = useState(''); // NEW: Tracks teacher loading errors

    // Fetch Student Progress
    useEffect(() => {
        const fetchProgress = async () => {
            try {
                const res = await axios.get(`http://localhost:8080/api/parent/dashboard?parentId=${user.id}`);
                if (res.data.error) setError(res.data.error);
                else setData(res.data);
            } catch (err) { setError("Failed to connect to the server."); }
        };
        fetchProgress();
    }, [user.id]);

    // Fetch Teachers List
    useEffect(() => {
        const fetchTeachers = async () => {
            try {
                const res = await axios.get('http://localhost:8080/api/parent/teachers');
                console.log("Teachers loaded from database:", res.data); // Prints to browser console
                setTeachers(res.data);
            } catch (err) { 
                console.error("Error loading teachers:", err);
                setTeacherError("⚠️ Backend Error: Did you add the route to Main.java and restart the server?"); 
            }
        };
        fetchTeachers();
    }, []);

    return (
        <div style={{ backgroundColor: '#f4f6f7', minHeight: '100vh', padding: '20px' }}>
            <div style={styles.navbar}>
                <h2>👪 EduTrack Parent Portal</h2>
                <div>
                    <span style={{ marginRight: '15px' }}>Logged in as: <strong>{user.name}</strong></span>
                    <button onClick={onLogout} style={styles.logoutBtn}>Logout</button>
                </div>
            </div>

            <div style={{ maxWidth: '1000px', margin: '0 auto', marginTop: '30px' }}>
                {error ? (
                    <div style={styles.errorBox}>⚠️ {error}</div>
                ) : !data ? (
                    <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading student data...</div>
                ) : (
                    <>
                        <div style={styles.heroCard}>
                            <h1 style={{ margin: 0, color: '#2c3e50' }}>Academic Profile: {data.childName}</h1>
                            <p style={{ margin: '5px 0 0 0', color: '#7f8c8d' }}>Student ID: {data.childId}</p>
                        </div>

                        <div style={styles.tabContainer}>
                            <button 
                                style={activeTab === 'overview' ? styles.activeTab : styles.inactiveTab}
                                onClick={() => setActiveTab('overview')}
                            >
                                📊 Academic Overview
                            </button>
                            <button 
                                style={activeTab === 'messages' ? styles.activeTab : styles.inactiveTab}
                                onClick={() => setActiveTab('messages')}
                            >
                                💬 Teacher Messages
                            </button>
                        </div>

                        {/* OVERVIEW TAB */}
                        {activeTab === 'overview' && (
                            <div style={styles.grid}>
                                {/* Quiz Card */}
                                <div style={styles.card}>
                                    <h3 style={{ color: '#e67e22', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>📝 Quiz Scores</h3>
                                    {data.quizzes.length === 0 ? <p style={styles.noData}>No quizzes attempted.</p> : 
                                        data.quizzes.map((q, i) => (
                                            <div key={i} style={styles.row}>
                                                <div>
                                                    <strong>{q.title}</strong>
                                                    <div style={styles.badge}>{q.subject}</div>
                                                </div>
                                                <strong style={{ fontSize: '16px' }}>{q.score}/{q.total}</strong>
                                            </div>
                                        ))
                                    }
                                </div>

                                {/* Video Card */}
                                <div style={styles.card}>
                                    <h3 style={{ color: '#3498db', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>▶️ Video Progress</h3>
                                    {data.videos.length === 0 ? <p style={styles.noData}>No videos watched.</p> : 
                                        data.videos.map((v, i) => (
                                            <div key={i} style={styles.row}>
                                                <div style={{ flex: 1 }}>
                                                    <strong>{v.title}</strong>
                                                    <div style={styles.badge}>{v.subject}</div>
                                                    <div style={styles.barBg}>
                                                        <div style={{...styles.barFill, width: `${v.progress}%`, backgroundColor: '#3498db'}}></div>
                                                    </div>
                                                </div>
                                                <span style={styles.percentage}>{v.progress}%</span>
                                            </div>
                                        ))
                                    }
                                </div>

                                {/* Document Card */}
                                <div style={styles.card}>
                                    <h3 style={{ color: '#9b59b6', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>📄 Document Progress</h3>
                                    {data.documents.length === 0 ? <p style={styles.noData}>No documents viewed.</p> : 
                                        data.documents.map((d, i) => (
                                            <div key={i} style={styles.row}>
                                                <div style={{ flex: 1 }}>
                                                    <strong>{d.title}</strong>
                                                    <div style={styles.badge}>{d.subject}</div>
                                                    <div style={styles.barBg}>
                                                        <div style={{...styles.barFill, width: `${d.progress}%`, backgroundColor: '#9b59b6'}}></div>
                                                    </div>
                                                </div>
                                                <span style={styles.percentage}>{d.progress}%</span>
                                            </div>
                                        ))
                                    }
                                </div>
                            </div>
                        )}

                        {/* MESSAGES TAB */}
                        {activeTab === 'messages' && (
                            <div style={{ display: 'flex', gap: '20px', height: '500px', backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                                
                                {/* Teachers List */}
                                <div style={{ flex: 1, borderRight: '1px solid #eee', paddingRight: '20px', overflowY: 'auto' }}>
                                    <h3 style={{ marginTop: 0, color: '#2c3e50' }}>Select a Teacher</h3>
                                    
                                    {/* NEW: Displays exactly why the list is empty! */}
                                    {teacherError && <p style={{ color: '#e74c3c', fontSize: '13px', fontWeight: 'bold' }}>{teacherError}</p>}
                                    
                                    {!teacherError && teachers.length === 0 && (
                                        <p style={{ color: '#7f8c8d', fontSize: '14px', padding: '10px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
                                            No teachers found in the database. Please ask the Admin to register a Teacher account.
                                        </p>
                                    )}

                                    {teachers.map(t => (
                                        <div 
                                            key={t.id} 
                                            onClick={() => setSelectedTeacher(t)}
                                            style={{
                                                padding: '12px', 
                                                borderRadius: '8px', 
                                                marginBottom: '10px', 
                                                cursor: 'pointer',
                                                border: '1px solid #eee',
                                                backgroundColor: selectedTeacher?.id === t.id ? '#f4f9fd' : 'white',
                                                borderLeft: selectedTeacher?.id === t.id ? '4px solid #3498db' : '4px solid transparent'
                                            }}
                                        >
                                            <strong>{t.name}</strong>
                                            <div style={{ fontSize: '12px', color: '#7f8c8d', marginTop: '4px' }}>{t.subject} Teacher</div>
                                        </div>
                                    ))}
                                </div>

                                {/* Chat Window */}
                                <div style={{ flex: 2, display: 'flex', justifyContent: 'center' }}>
                                    {!selectedTeacher ? (
                                        <div style={{ display: 'flex', alignItems: 'center', color: '#95a5a6' }}>
                                            Select a teacher to start chatting.
                                        </div>
                                    ) : (
                                        <ChatWindow 
                                            currentUser={user} 
                                            partnerName={`${selectedTeacher.name} (${selectedTeacher.subject})`} 
                                            parentId={user.id} 
                                            teacherId={selectedTeacher.id}
                                        />
                                    )}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

const styles = {
    navbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#2c3e50', color: 'white', padding: '15px 30px', borderRadius: '8px' },
    logoutBtn: { padding: '8px 15px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' },
    errorBox: { backgroundColor: '#fadbd8', color: '#c0392b', padding: '20px', borderRadius: '8px', textAlign: 'center', fontWeight: 'bold' },
    heroCard: { backgroundColor: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', marginBottom: '20px', textAlign: 'center' },
    tabContainer: { display: 'flex', gap: '10px', marginBottom: '20px', justifyContent: 'center' },
    activeTab: { padding: '10px 20px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' },
    inactiveTab: { padding: '10px 20px', backgroundColor: '#ecf0f1', color: '#7f8c8d', border: 'none', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' },
    card: { backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #eee' },
    row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', paddingBottom: '15px', borderBottom: '1px solid #f9f9f9' },
    badge: { display: 'inline-block', fontSize: '10px', backgroundColor: '#ecf0f1', color: '#7f8c8d', padding: '2px 6px', borderRadius: '4px', marginLeft: '8px', textTransform: 'uppercase' },
    barBg: { height: '6px', backgroundColor: '#ecf0f1', borderRadius: '3px', marginTop: '8px', overflow: 'hidden' },
    barFill: { height: '100%', borderRadius: '3px' },
    percentage: { marginLeft: '15px', fontSize: '13px', fontWeight: 'bold', color: '#7f8c8d' },
    noData: { color: '#95a5a6', fontStyle: 'italic', fontSize: '14px' }
};

export default ParentDashboard;