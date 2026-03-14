import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const DashboardHome = ({ user }) => {
    const [data, setData] = useState(null);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const res = await axios.get(`http://localhost:8080/api/student/dashboard?studentId=${user.id}`);
                setData(res.data);
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            }
        };
        fetchDashboard();
    }, [user.id]);

    if (!data) return <p>Loading Overview...</p>;

    return (
        <div>
            <h2 style={{ marginBottom: '5px' }}>Welcome back, {user.name.split(' ')[0]}! </h2>
            <p style={{ color: '#7f8c8d', marginBottom: '30px' }}>Here is what's happening with your studies today.</p>

            {/* QUICK STATS */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
                <div style={statCardStyle('#3498db')}>
                    <h3>{data.totalSubjects}</h3>
                    <p>Enrolled Subjects</p>
                </div>
                <div style={statCardStyle('#2ecc71')}>
                    <h3>{data.avgQuizScore}%</h3>
                    <p>Average Quiz Score</p>
                </div>
                <div style={statCardStyle('#9b59b6')}>
                    <h3>{data.recentContent.length}</h3>
                    <p>New Materials</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
                
                {/* 3-LINE GRAPH: Subject Progress */}
                <div style={panelStyle}>
                    <h3 style={{ marginBottom: '20px' }}>Overall Completion by Subject</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={data.growthData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="subject" tick={{ fontSize: 12, fontWeight: 'bold' }} />
                            <YAxis unit="%" domain={[0, 100]} tick={{ fontSize: 12 }} />
                            <Tooltip formatter={(value) => `${value}%`} />
                            <Legend wrapperStyle={{ paddingTop: '10px' }} />
                            
                            {/* THREE ACTUAL DATA LINES */}
                            <Line type="monotone" dataKey="quiz" name="Quiz Scores" stroke="#27ae60" strokeWidth={3} activeDot={{ r: 6 }} />
                            <Line type="monotone" dataKey="video" name="Video Watch %" stroke="#3498db" strokeWidth={3} activeDot={{ r: 6 }} />
                            <Line type="monotone" dataKey="doc" name="Docs Read %" stroke="#9b59b6" strokeWidth={3} activeDot={{ r: 6 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* RECENTLY ADDED FEED */}
                <div style={panelStyle}>
                    <h3 style={{ marginBottom: '20px' }}>Recently Added</h3>
                    {data.recentContent.length > 0 ? data.recentContent.map((item, i) => (
                        <div key={i} style={{ padding: '12px 0', borderBottom: i === data.recentContent.length - 1 ? 'none' : '1px solid #eee' }}>
                            <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#2c3e50' }}>{item.title}</div>
                            <div style={{ fontSize: '12px', color: '#7f8c8d', marginTop: '4px' }}>
                                <span style={{ padding: '2px 6px', backgroundColor: '#ecf0f1', borderRadius: '4px', marginRight: '6px' }}>{item.type}</span> 
                                {item.subject}
                            </div>
                        </div>
                    )) : (
                        <p style={{ color: '#7f8c8d', fontSize: '14px' }}>No recent materials found.</p>
                    )}
                </div>

            </div>
        </div>
    );
};

const statCardStyle = (color) => ({
    flex: 1, backgroundColor: 'white', padding: '20px', borderRadius: '12px', 
    boxShadow: '0 4px 6px rgba(0,0,0,0.05)', borderLeft: `6px solid ${color}`
});

const panelStyle = {
    backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
};

export default DashboardHome;