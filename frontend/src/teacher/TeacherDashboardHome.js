import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import '../styles/Teacher.css'; // Using the indigo-themed styles

const TeacherDashboardHome = ({ user }) => {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            if (!user.subject) return;
            try {
                const res = await axios.get(`http://localhost:8080/api/teacher/dashboard?subject=${encodeURIComponent(user.subject)}`);
                setStats(res.data);
            } catch (err) {
                console.error("Error fetching stats:", err);
            }
        };
        fetchStats();
    }, [user.subject]);

    if (!stats) return <div className="t-loading">Initializing Teacher Portal...</div>;

    const chartData = [
        { name: 'Videos', count: stats.totalVideos, color: '#818cf8' },
        { name: 'Docs', count: stats.totalDocs, color: '#a855f7' },
        { name: 'Quizzes', count: stats.totalQuizzes, color: '#2dd4bf' }
    ];

    const totalMaterials = stats.totalVideos + stats.totalDocs + stats.totalQuizzes;

    return (
        <div className="t-home-container">
            {/* --- WELCOME BANNER --- */}
            <div className="t-welcome-banner glass-card">
                <div className="banner-text">
                    <h2>Welcome back, Professor {user.name.split(' ')[0]}! </h2>
                    <p>Your <strong>{user.subject}</strong> overview looks great today.</p>
                </div>
                <div className="banner-badge">{user.subject} Department</div>
            </div>

            {/* --- TOP STATS CARDS --- */}
            <div className="t-stats-grid">
                <div className="t-stat-card glass-card purple-glow">
                    <div className="stat-icon">👥</div>
                    <div className="stat-info">
                        <h3>{stats.totalStudents}</h3>
                        <p>Total Students</p>
                    </div>
                </div>

                <div className="t-stat-card glass-card blue-glow">
                    <div className="stat-icon">📚</div>
                    <div className="stat-info">
                        <h3>{totalMaterials}</h3>
                        <p>Learning Units</p>
                    </div>
                </div>

                <div className="t-stat-card glass-card teal-glow">
                    <div className="stat-icon">📅</div>
                    <div className="stat-info">
                        <h3>{stats.upcomingMeetings.length}</h3>
                        <p>Next Sessions</p>
                    </div>
                </div>
            </div>

            <div className="t-dashboard-main">
                {/* --- CHART SECTION --- */}
                <div className="t-chart-section glass-card">
                    <h3>Content Distribution</h3>
                    <div className="chart-wrapper">
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px' }}
                                    cursor={{fill: 'rgba(255,255,255,0.05)'}}
                                />
                                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* --- UPCOMING MEETINGS --- */}
                <div className="t-meetings-section glass-card">
                    <h3>📅 Upcoming Schedule</h3>
                    <div className="meeting-list">
                        {stats.upcomingMeetings.length === 0 ? (
                            <div className="no-data">No classes scheduled</div>
                        ) : (
                            stats.upcomingMeetings.map((meeting, i) => (
                                <div key={i} className="meeting-item">
                                    <div className="meeting-date-box">
                                        <span className="m-time">{meeting.time}</span>
                                    </div>
                                    <div className="meeting-details">
                                        <h4>{meeting.topic}</h4>
                                        <p>{meeting.date}</p>
                                    </div>
                                    <div className="meeting-indicator"></div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeacherDashboardHome;