import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import Loader from '../components/Loader';
import '../styles/Students.css';

const DashboardHome = ({ user }) => {
    const [data, setData] = useState(null);
    const [goalProgress, setGoalProgress] = useState(60); // Mock data for goal tracker

    const handleUpdateGoal = () => {
        setGoalProgress(prev => (prev >= 100 ? 0 : prev + 20));
    };

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const res = await axios.get(`https://edu-track-c6ml.onrender.com/api/student/dashboard?studentId=${user.id}`);
                setData(res.data);
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            }
        };
        fetchDashboard();
    }, [user.id]);

    if (!data) return <Loader text="Gathering your academic overview..." />;

    return (
        <div className="s-dash-container">
            <h2 className="s-welcome-text">
            Welcome, <span>{user?.name ? user.name.split(' ')[0] : 'Student'}!</span> 👋
        </h2>
        
        <p style={{ color: '#64748b', fontSize: '1.05rem', marginBottom: '35px', fontWeight: '500' }}>
            Here is a summary of your academic progress and new materials.
        </p>

            {/* QUICK STATS */}
            <div className="s-stats-grid" style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
    <div className="s-stat-card blue-glow">
        <h3>{data.totalSubjects}</h3>
        <p>Enrolled Subjects</p>
    </div>
    
    <div className="s-stat-card green-glow">
        <h3>{data.avgQuizScore}%</h3>
        <p>Average Quiz Score</p>
    </div>
    
    <div className="s-stat-card purple-glow">
        <h3>{data.recentContent.length}</h3>
        <p>New Materials</p>
    </div>
    </div>

            <div className="s-dash-grid">
                {/* PROGRESS GRAPH */}
                <div className="s-glass-panel" style={{ background: 'white', borderRadius: '20px', border: '1px solid #f1f5f9', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
                    <h3 style={{ marginBottom: '25px', color: '#1e293b', fontSize: '1.2rem', fontWeight: '800' }}>Subject Completion Analytics</h3>
                    <ResponsiveContainer width="100%" height={280}>
                        <AreaChart data={data.growthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorQuiz" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="colorVideo" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="colorDoc" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis 
                                dataKey="subject" 
                                tick={{ fontSize: 12, fontWeight: '600', fill: '#94a3b8' }} 
                                axisLine={false}
                                tickLine={false}
                                dy={10}
                            />
                            <YAxis 
                                unit="%" 
                                domain={[0, 100]} 
                                tick={{ fontSize: 12, fontWeight: '600', fill: '#94a3b8' }} 
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip 
                                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', fontWeight: '600', color: '#1e293b', padding: '12px 20px' }}
                                itemStyle={{ fontWeight: '700' }}
                                formatter={(value) => [`${value}%`]} 
                            />
                            <Legend iconType="circle" wrapperStyle={{ paddingTop: '15px', fontSize: '13px', fontWeight: '700', color: '#475569' }} />
                            
                            <Area type="monotone" dataKey="quiz" name="Quiz Scores" stroke="#10b981" fillOpacity={1} fill="url(#colorQuiz)" strokeWidth={3} activeDot={{ r: 6, strokeWidth: 0, fill: '#10b981' }} />
                            <Area type="monotone" dataKey="video" name="Video Progress" stroke="#3b82f6" fillOpacity={1} fill="url(#colorVideo)" strokeWidth={3} activeDot={{ r: 6, strokeWidth: 0, fill: '#3b82f6' }} />
                            <Area type="monotone" dataKey="doc" name="Reading Progress" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorDoc)" strokeWidth={3} activeDot={{ r: 6, strokeWidth: 0, fill: '#8b5cf6' }} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* RECENT FEED */}
                <div className="s-glass-panel" style={{ background: 'white', borderRadius: '20px', border: '1px solid #f1f5f9', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
                    <h3 style={{ marginBottom: '20px', color: '#1e293b', fontSize: '1.2rem', fontWeight: '800' }}>Recently Added</h3>
                    <div style={{ maxHeight: '300px', overflowY: 'auto', paddingRight: '10px' }}>
                        {data.recentContent.length > 0 ? data.recentContent.map((item, i) => (
                            <div key={i} className="s-feed-item">
                                {/* Title of the content */}
        <div className="s-feed-title">{item.title}</div>
        
        {/* Type Tag and Subject Name */}
        <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center' }}>
            <span className="s-type-tag">{item.type}</span> 
            <span style={{ fontWeight: '500' }}>{item.subject}</span>
        </div>
                            </div>
                        )) : (
                            <p className="t-no-data">No new materials uploaded yet.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* NEW WIDGETS ROW */}
            <div className="s-features-grid">
                
                {/* 1. Goal Tracker */}
                <div className="s-feature-card">
                    <h3>🎯 Weekly Study Goal</h3>
                    <p style={{ color: '#64748b', fontSize: '0.85rem', margin: 0 }}>Target: Complete 5 materials this week</p>
                    
                    <div className="s-goal-circle-wrap">
                        <div className="s-goal-circle" style={{ '--progress': `${goalProgress * 3.6}deg` }}>
                            <span className="s-goal-text">{goalProgress}%</span>
                        </div>
                    </div>
                    
                    <button className="s-btn-update-goal" onClick={handleUpdateGoal}>
                        {goalProgress >= 100 ? 'Goal Met! 🎉' : 'Update Progress +'}
                    </button>
                </div>

                {/* 2. Upcoming Deadlines */}
                <div className="s-feature-card">
                    <h3>📅 Upcoming Deadlines</h3>
                    <ul className="s-task-list">
                        <li className="s-task-item">
                            <span className="s-task-title">Math Mid-term Quiz</span>
                            <span className="s-task-tag urgent">Tomorrow</span>
                        </li>
                        <li className="s-task-item">
                            <span className="s-task-title">Physics Lab Report</span>
                            <span className="s-task-tag soon">In 2 days</span>
                        </li>
                        <li className="s-task-item">
                            <span className="s-task-title">Biology Zoom Class</span>
                            <span className="s-task-tag soon">Thursday</span>
                        </li>
                    </ul>
                </div>

                {/* 3. Daily Inspiration & Quick Links */}
                <div className="s-feature-card">
                    <h3>💡 Daily Inspiration</h3>
                    <p className="s-quote-text">
                        "Success is the sum of small efforts, repeated day in and day out."
                    </p>
                    <p className="s-quote-author">- Robert Collier</p>
                    
                    <h4 style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '10px' }}>Quick Links</h4>
                    <div className="s-quick-links">
                        <a href="#/messages" className="s-quick-btn">💬 Forum</a>
                        <a href="#/live" className="s-quick-btn">🎥 Zoom</a>
                        <a href="#/progress" className="s-quick-btn">📈 Analytics</a>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default DashboardHome;