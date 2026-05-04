import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ChatWindow from '../components/ChatWindow';
import UserProfile from '../components/UserProfile';
import QuizRanklist from '../components/QuizRanklist';
import '../styles/Parent.css'; // Make sure to create this file

const ParentDashboard = ({ user, onLogout }) => {
    const [data, setData] = useState(null);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('overview');
    const [teachers, setTeachers] = useState([]);
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [teacherError, setTeacherError] = useState('');
    const [selectedRanklistQuiz, setSelectedRanklistQuiz] = useState(null);

    useEffect(() => {
        const fetchProgress = async () => {
            try {
                const res = await axios.get(`http://localhost:8080/api/parent/dashboard?parentId=${user.id}`);
                if (res.data.error) setError(res.data.error);
                else setData(res.data);
            } catch (err) { setError("Server connection failed."); }
        };
        fetchProgress();
    }, [user.id]);

    useEffect(() => {
        const fetchTeachers = async () => {
            try {
                const res = await axios.get('http://localhost:8080/api/parent/teachers');
                setTeachers(res.data);
            } catch (err) { 
                setTeacherError("⚠️ Backend Routing Error: Check Main.java"); 
            }
        };
        fetchTeachers();
    }, []);

    return (
        <div className="p-portal-container">
            {/* Navbar */}
            <nav className="p-navbar">
                <h2 style={{ margin: 0 }}>👪 EduTrack <span>Parent</span></h2>
                <div>
                    <span style={{ marginRight: '20px', fontSize: '14px' }}>Welcome, Parent <strong> {user.name}</strong></span>
                    <button onClick={onLogout} className="t-btn-glass-purple" style={{ padding: '8px 18px', background: '#e74c3c', borderColor: '#e74c3c', color: 'white' }}>Logout</button>
                </div>
            </nav>

            <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
                {error ? (
                    <div className="t-status-pill error" style={{ marginTop: '50px' }}>{error}</div>
                ) : !data ? (
                    <div className="t-empty-state">Loading Academic Records...</div>
                ) : (
                    <>
                        {/* Profile Header */}
                        <div className="p-hero-card">
                            <h1 style={{ margin: 0 }}>{data.childName}</h1>
                            <p style={{ color: '#64748b', fontWeight: '600' }}>Academic Profile • Student ID: {data.childId}</p>
                        </div>

                        {/* Tabs */}
                        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginBottom: '30px', flexWrap: 'wrap' }}>
                            <button className={`p-tab-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>📊 Progress</button>
                            <button className={`p-tab-btn ${activeTab === 'ranklist' ? 'active' : ''}`} onClick={() => { setActiveTab('ranklist'); setSelectedRanklistQuiz(null); }}>🏆 Quiz Ranklist</button>
                            <button className={`p-tab-btn ${activeTab === 'messages' ? 'active' : ''}`} onClick={() => setActiveTab('messages')}>💬 Teacher Chat</button>
                            <button className={`p-tab-btn ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>👤 My Profile</button>
                        </div>

                        {/* OVERVIEW CONTENT */}
                        {activeTab === 'overview' && (
                            <div className="t-grid-3">
                                {/* Quizzes */}
                                <div className="p-stat-card">
                                    <h3 style={{ color: '#10b981', borderBottom: '2px solid #f0fdf4', paddingBottom: '10px' }}>📝 Quiz Scores</h3>
                                    {data.quizzes.length === 0 ? <p className="t-no-data">No attempts yet.</p> : 
                                        data.quizzes.map((q, i) => (
                                            <div key={i} className="p-progress-row">
                                                <div>
                                                    <strong>{q.title}</strong>
                                                    <div className="p-subject-tag">{q.subject}</div>
                                                </div>
                                                <strong style={{ color: '#059669' }}>{q.score}/{q.total}</strong>
                                            </div>
                                        ))
                                    }
                                </div>

                                {/* Videos */}
                                <div className="p-stat-card">
                                    <h3 style={{ color: '#3498db', borderBottom: '2px solid #f0f9ff', paddingBottom: '10px' }}>▶️ Video Completion</h3>
                                    {data.videos.length === 0 ? <p className="t-no-data">No videos watched.</p> : 
                                        data.videos.map((v, i) => (
                                            <div key={i} className="p-progress-row" style={{ display: 'block' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <strong>{v.title}</strong>
                                                    <span className="p-subject-tag">{v.subject}</span>
                                                </div>
                                                <div className="t-progress-bar-bg" style={{ marginTop: '10px' }}>
                                                    <div className="t-progress-bar-fill" style={{ width: `${v.progress}%`, backgroundColor: '#3498db' }}></div>
                                                </div>
                                            </div>
                                        ))
                                    }
                                </div>

                                {/* Documents */}
                                <div className="p-stat-card">
                                    <h3 style={{ color: '#a855f7', borderBottom: '2px solid #f5f3ff', paddingBottom: '10px' }}>📄 Reading Logs</h3>
                                    {data.documents.length === 0 ? <p className="t-no-data">No reading materials.</p> : 
                                        data.documents.map((d, i) => (
                                            <div key={i} className="p-progress-row" style={{ display: 'block' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <strong>{d.title}</strong>
                                                    <span className="p-subject-tag">{d.subject}</span>
                                                </div>
                                                <div className="t-progress-bar-bg" style={{ marginTop: '10px' }}>
                                                    <div className="t-progress-bar-fill" style={{ width: `${d.progress}%`, backgroundColor: '#a855f7' }}></div>
                                                </div>
                                            </div>
                                        ))
                                    }
                                </div>
                            </div>
                        )}

                        {/* RANKLIST TAB */}
                        {activeTab === 'ranklist' && (
                            <div>
                                {selectedRanklistQuiz ? (
                                    <QuizRanklist
                                        quizId={selectedRanklistQuiz.id}
                                        quizTitle={selectedRanklistQuiz.title}
                                        totalMarks={selectedRanklistQuiz.total}
                                        currentUserId={data.childId}
                                        onClose={() => setSelectedRanklistQuiz(null)}
                                    />
                                ) : (
                                    <div style={{ background: 'white', borderRadius: '20px', padding: '30px', boxShadow: '0 10px 40px rgba(0,0,0,0.06)' }}>
                                        <h3 style={{ color: '#1e293b', marginTop: 0 }}>🏆 Select a Quiz to View the Ranklist</h3>
                                        <p style={{ color: '#64748b', marginBottom: '20px' }}>See how {data.childName} ranks among their class.</p>
                                        {data.quizzes.length === 0 ? (
                                            <p style={{ color: '#94a3b8' }}>No quiz attempts found for {data.childName} yet.</p>
                                        ) : (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                {data.quizzes.map((q, i) => (
                                                    <div
                                                        key={i}
                                                        onClick={() => setSelectedRanklistQuiz(q)}
                                                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: '#f8fafc', borderRadius: '14px', border: '2px solid #e2e8f0', cursor: 'pointer', transition: 'all 0.2s' }}
                                                        onMouseEnter={e => e.currentTarget.style.borderColor = '#f59e0b'}
                                                        onMouseLeave={e => e.currentTarget.style.borderColor = '#e2e8f0'}
                                                    >
                                                        <div>
                                                            <strong style={{ color: '#1e293b' }}>{q.title}</strong>
                                                            <div style={{ fontSize: '12px', color: '#64748b' }}>{q.subject}</div>
                                                        </div>
                                                        <div style={{ textAlign: 'right' }}>
                                                            <div style={{ fontWeight: 800, color: '#059669' }}>{q.score}/{q.total}</div>
                                                            <div style={{ fontSize: '12px', color: '#f59e0b', fontWeight: 700 }}>View Rankings →</div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* MESSAGES CONTENT */}
                        {activeTab === 'messages' && (
                            <div className="t-chat-container" style={{ background: 'white', borderRadius: '24px', padding: '25px', height: '600px' }}>
                                <div className="t-chat-left" style={{ borderRight: 'px solid #d0dce8' }}>
                                    <h2 style={{ color: '#4580de',marginBottom: '15px' }}>Select Teacher</h2>
                                    {teacherError && <p className="t-status-pill error" style={{ fontSize: '12px' }}>{teacherError}</p>}
                                    
                                    <div className="t-parent-list-scroll">
                                        {teachers.map(t => (
                                            <div 
                                                key={t.id} 
                                                onClick={() => setSelectedTeacher(t)}
                                                className={`t-parent-card ${selectedTeacher?.id === t.id ? 'active' : ''}`}
                                            >
                                                <div className="t-parent-avatar" style={{ background: '#3498db' }}>{t.name.charAt(0)}</div>
                                                <div className="t-student-info">
                                                    <h4 style={{ margin: 0 }}>{t.name}</h4>
                                                    <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>{t.subject} Specialist</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="t-chat-right">
                                    {!selectedTeacher ? (
                                        <div className="t-empty-state" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <p style={{ color: '#94a3b8' }}>Choose a teacher to start a conversation.</p>
                                        </div>
                                    ) : (
                                        <div className="p-chat-right-content">
                                            <div className="p-chat-window-wrapper">
                                                <ChatWindow 
                                                    currentUser={user} 
                                                    partnerName={`${selectedTeacher.name} (${selectedTeacher.subject})`} 
                                                    parentId={user.id} 
                                                    teacherId={selectedTeacher.id}
                                                 />
                                            </div>
                                    </div>
        )}
                                </div>
                            </div>
                        )}
                        {/* PROFILE CONTENT */}
                        {activeTab === 'profile' && <UserProfile user={user} />}
                    </>
                )}
            </div>
        </div>
    );
};

export default ParentDashboard;