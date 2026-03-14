import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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

    if (!stats) return <div style={{ padding: '20px' }}>Loading Dashboard...</div>;

    // Format data for the chart
    const chartData = [
        { name: 'Videos', count: stats.totalVideos, fill: '#3498db' },
        { name: 'Documents', count: stats.totalDocs, fill: '#9b59b6' },
        { name: 'Quizzes', count: stats.totalQuizzes, fill: '#e67e22' }
    ];

    const totalMaterials = stats.totalVideos + stats.totalDocs + stats.totalQuizzes;

    return (
        <div style={{ padding: '10px' }}>
            <div style={{ marginBottom: '30px' }}>
                <h2 style={{ margin: '0 0 5px 0', color: '#2c3e50' }}>Welcome back, Teacher {user.name}! 👋</h2>
                <p style={{ color: '#7f8c8d', margin: 0 }}>Here is the current overview for your <strong>{user.subject}</strong> classes.</p>
            </div>

            {/* Quick Stat Cards */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', flexWrap: 'wrap' }}>
                <div style={styles.card('#2ecc71')}>
                    <h3 style={styles.cardNumber}>{stats.totalStudents}</h3>
                    <p style={styles.cardLabel}>Total Students</p>
                </div>
                <div style={styles.card('#3498db')}>
                    <h3 style={styles.cardNumber}>{totalMaterials}</h3>
                    <p style={styles.cardLabel}>Uploaded Materials</p>
                </div>
                <div style={styles.card('#e74c3c')}>
                    <h3 style={styles.cardNumber}>{stats.upcomingMeetings.length}</h3>
                    <p style={styles.cardLabel}>Upcoming Live Classes</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
                
                {/* Chart Section */}
                <div style={styles.panel}>
                    <h3 style={{ marginTop: 0, color: '#2c3e50' }}>Content Breakdown ({user.subject})</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" />
                            <YAxis allowDecimals={false} />
                            <Tooltip cursor={{ fill: 'transparent' }} />
                            <Bar dataKey="count" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Upcoming Classes Section */}
                <div style={styles.panel}>
                    <h3 style={{ marginTop: 0, color: '#2c3e50' }}>📅 Next Classes</h3>
                    {stats.upcomingMeetings.length === 0 ? (
                        <p style={{ color: '#95a5a6', fontSize: '14px', fontStyle: 'italic' }}>No upcoming classes scheduled.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {stats.upcomingMeetings.map((meeting, i) => (
                                <div key={i} style={{ borderLeft: '3px solid #e74c3c', paddingLeft: '15px', backgroundColor: '#fdf3f2', padding: '10px 15px', borderRadius: '0 8px 8px 0' }}>
                                    <h4 style={{ margin: '0 0 5px 0', color: '#c0392b' }}>{meeting.topic}</h4>
                                    <p style={{ margin: 0, fontSize: '13px', color: '#7f8c8d' }}>
                                        {meeting.date} at {meeting.time}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

const styles = {
    card: (color) => ({
        flex: '1', minWidth: '200px', backgroundColor: 'white', padding: '25px 20px', 
        borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', 
        borderBottom: `5px solid ${color}`, textAlign: 'center'
    }),
    cardNumber: { margin: '0 0 5px 0', fontSize: '32px', color: '#2c3e50' },
    cardLabel: { margin: 0, color: '#7f8c8d', fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase' },
    panel: { backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #f1f1f1' }
};

export default TeacherDashboardHome;