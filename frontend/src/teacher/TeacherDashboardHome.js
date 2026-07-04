import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import '../styles/Teacher.css'; // Using the indigo-themed styles
import Loader from '../components/Loader';

const TeacherDashboardHome = ({ user }) => {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            if (!user.subject) return;
            try {
                const res = await axios.get(`https://edu-track-c6ml.onrender.com/api/teacher/dashboard?subject=${encodeURIComponent(user.subject)}`);
                setStats(res.data);
            } catch (err) {
                console.error("Error fetching stats:", err);
            }
        };
        fetchStats();
    }, [user.subject]);

    if (!stats) return <Loader text="Initializing Teacher Portal..." />;

    const chartData = [
        { name: 'Videos', count: stats.totalVideos, color: 'url(#blueGradient)' },
        { name: 'Docs', count: stats.totalDocs, color: 'url(#purpleGradient)' },
        { name: 'Quizzes', count: stats.totalQuizzes, color: 'url(#emeraldGradient)' }
    ];

    const totalMaterials = stats.totalVideos + stats.totalDocs + stats.totalQuizzes;

    return (
        <div className="t-home-container">
            {/* --- WELCOME BANNER --- */}
            <div className="t-welcome-banner premium-glass-card">
                <div className="banner-text">
                    <h2 className="gradient-text">Welcome back, {user.name.split(' ')[0]}! </h2>
                    <p>Your <strong>{user.subject}</strong> overview looks great today.</p>
                </div>
                <div className="banner-badge">{user.subject} Department</div>
            </div>

            {/* --- TOP STATS CARDS --- */}
            <div className="t-stats-grid">
                <div className="t-stat-card premium-glass-card">
                    <div className="stat-icon-wrapper student-icon">
                        <span className="stat-icon">👥</span>
                    </div>
                    <div className="stat-info">
                        <h3>{stats.totalStudents}</h3>
                        <p>Total Students</p>
                    </div>
                </div>

                <div className="t-stat-card premium-glass-card">
                    <div className="stat-icon-wrapper material-icon">
                        <span className="stat-icon">📚</span>
                    </div>
                    <div className="stat-info">
                        <h3>{totalMaterials}</h3>
                        <p>Learning Units</p>
                    </div>
                </div>

                <div className="t-stat-card premium-glass-card">
                    <div className="stat-icon-wrapper calendar-icon">
                        <span className="stat-icon">📅</span>
                    </div>
                    <div className="stat-info">
                        <h3>{stats.upcomingMeetings.length}</h3>
                        <p>Next Sessions</p>
                    </div>
                </div>
            </div>

            <div className="t-dashboard-main">
                {/* --- CHART SECTION --- */}
                <div className="t-chart-section premium-glass-card">
                    <h3>Content Distribution</h3>
                    <div className="chart-wrapper">
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#60a5fa" />
                                        <stop offset="100%" stopColor="#3b82f6" />
                                    </linearGradient>
                                    <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#c084fc" />
                                        <stop offset="100%" stopColor="#9333ea" />
                                    </linearGradient>
                                    <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#34d399" />
                                        <stop offset="100%" stopColor="#10b981" />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.5)', borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}
                                    cursor={{fill: 'rgba(0,0,0,0.02)'}}
                                />
                                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* --- UPCOMING MEETINGS --- */}
                <div className="t-meetings-section premium-glass-card">
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