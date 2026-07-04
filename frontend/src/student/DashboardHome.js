import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import '../styles/Students.css';

const DashboardHome = ({ user }) => {
    const [data, setData] = useState(null);

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

    if (!data) return (
        <div className="t-empty-state" style={{ height: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p>Gathering your academic overview...</p>
        </div>
    );

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
                        <LineChart data={data.growthData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis 
                                dataKey="subject" 
                                tick={{ fontSize: 11, fontWeight: '700', fill: '#64748b' }} 
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis 
                                unit="%" 
                                domain={[0, 100]} 
                                tick={{ fontSize: 11, fill: '#64748b' }} 
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip 
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', fontWeight: '600', color: '#1e293b' }}
                                formatter={(value) => [`${value}%`]} 
                            />
                            <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '12px', fontWeight: '700', color: '#475569' }} />
                            
                            <Line type="monotone" dataKey="quiz" name="Quiz Scores" stroke="#10b981" strokeWidth={4} dot={{ r: 0 }} activeDot={{ r: 6, strokeWidth: 0 }} />
                            <Line type="monotone" dataKey="video" name="Video Progress" stroke="#3b82f6" strokeWidth={4} dot={{ r: 0 }} activeDot={{ r: 6, strokeWidth: 0 }} />
                            <Line type="monotone" dataKey="doc" name="Reading Progress" stroke="#8b5cf6" strokeWidth={4} dot={{ r: 0 }} activeDot={{ r: 6, strokeWidth: 0 }} />
                        </LineChart>
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
        </div>
    );
};

export default DashboardHome;