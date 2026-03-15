import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const StudentProgress = ({ user }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSubject, setSelectedSubject] = useState('All');

    useEffect(() => {
        if (user) {
            fetchSummary();
        }
    }, [user]);

    const fetchSummary = async () => {
        try {
            const response = await axios.get(`http://localhost:8080/api/progress/summary?studentId=${user.id}`);
            setData(response.data);
        } catch (error) {
            console.error("Error fetching progress summary:", error);
        }
        setLoading(false);
    };

    if (loading) return <p>Loading your analytics...</p>;

    if (data.length === 0) return (
        <div style={{ padding: '30px', textAlign: 'center', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
            <h3 style={{ color: '#7f8c8d' }}>No subjects found.</h3>
            <p>Enroll in a subject to start tracking your progress!</p>
        </div>
    );

    const subjectsList = data.map(d => d.subject);
    const activeSubjectData = selectedSubject === 'All' ? null : data.find(d => d.subject === selectedSubject);

    // Data for the detailed single-subject view
    const singleSubjectChartData = activeSubjectData ? [
        { name: 'Quizzes', percentage: activeSubjectData.quizPercentage, earned: activeSubjectData.quizEarned, total: activeSubjectData.quizTotal, type: 'quiz', fill: '#27ae60' },
        { name: 'Videos', percentage: activeSubjectData.videoAvg, count: activeSubjectData.videoCount, type: 'video', fill: '#3498db' },
        { name: 'Documents', percentage: activeSubjectData.docPercentage, completed: activeSubjectData.docCompleted, total: activeSubjectData.docCount, type: 'doc', fill: '#9b59b6' }
    ] : [];

    // --- REUSABLE CUSTOM TOOLTIP ---
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const item = payload[0].payload;
            return (
                <div style={{ backgroundColor: '#fff', padding: '12px', border: '1px solid #bdc3c7', borderRadius: '4px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                    <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', color: '#2c3e50' }}>{label}</p>
                    <p style={{ margin: '0 0 4px 0', color: payload[0].fill, fontWeight: 'bold' }}>
                        Completion: {payload[0].value}%
                    </p>
                    {/* SHOW ACTUAL FRACTIONS BASED ON DATA TYPE */}
                    {(item.quizTotal !== undefined || item.type === 'quiz') && (
                        <p style={{ margin: 0, fontSize: '13px', color: '#7f8c8d' }}>
                            Marks: {item.quizEarned ?? item.earned} / {item.quizTotal ?? item.total}
                        </p>
                    )}
                    {(item.videoCount !== undefined || item.type === 'video') && (
                        <p style={{ margin: 0, fontSize: '13px', color: '#7f8c8d' }}>
                            Videos: {item.videoCount ?? item.count} trackable
                        </p>
                    )}
                    {(item.docCount !== undefined || item.type === 'doc') && (
                        <p style={{ margin: 0, fontSize: '13px', color: '#7f8c8d' }}>
                            Read: {item.docCompleted ?? item.completed} / {item.docCount ?? item.total}
                        </p>
                    )}
                </div>
            );
        }
        return null;
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                    <h2 style={{ color: '#2c3e50', margin: '0 0 5px 0' }}>My Progress Dashboard</h2>
                    <p style={{ margin: 0, color: '#7f8c8d' }}>Performance based on actual marks and completions.</p>
                </div>
                
                <div>
                    <label style={{ fontWeight: 'bold', marginRight: '10px', color: '#34495e' }}>Subject Filter:</label>
                    <select 
                        value={selectedSubject} 
                        onChange={(e) => setSelectedSubject(e.target.value)}
                        style={{ padding: '10px', borderRadius: '6px', border: '1px solid #bdc3c7', fontSize: '15px', backgroundColor: 'white' }}
                    >
                        <option value="All">🌐 All Subjects (Overview)</option>
                        {subjectsList.map(sub => <option key={sub} value={sub}>📘 {sub}</option>)}
                    </select>
                </div>
            </div>

            {/* DETAIL VIEW: Single Subject */}
            {selectedSubject !== 'All' && activeSubjectData && (
                <div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                        <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', borderLeft: '5px solid #27ae60' }}>
                            <h4 style={{ margin: '0 0 10px 0', color: '#7f8c8d', fontSize: '12px', textTransform: 'uppercase' }}>Actual Quiz Marks</h4>
                            <h1 style={{ margin: 0, color: '#2c3e50' }}>{activeSubjectData.quizPercentage}%</h1>
                            <p style={{ margin: '10px 0 0 0', color: '#27ae60', fontWeight: 'bold' }}>
                                {activeSubjectData.quizEarned} / {activeSubjectData.quizTotal} Total Marks
                            </p>
                        </div>
                        {/* Repeat for Video and Docs... */}
                        <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', borderLeft: '5px solid #3498db' }}>
                            <h4 style={{ margin: '0 0 10px 0', color: '#7f8c8d', fontSize: '12px', textTransform: 'uppercase' }}>Watch Time Avg</h4>
                            <h1 style={{ margin: 0, color: '#2c3e50' }}>{activeSubjectData.videoAvg}%</h1>
                            <p style={{ margin: '10px 0 0 0', color: '#3498db', fontWeight: 'bold' }}>Across {activeSubjectData.videoCount} videos</p>
                        </div>
                        <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', borderLeft: '5px solid #9b59b6' }}>
                            <h4 style={{ margin: '0 0 10px 0', color: '#7f8c8d', fontSize: '12px', textTransform: 'uppercase' }}>Readings Completed</h4>
                            <h1 style={{ margin: 0, color: '#2c3e50' }}>{activeSubjectData.docPercentage}%</h1>
                            <p style={{ margin: '10px 0 0 0', color: '#9b59b6', fontWeight: 'bold' }}>{activeSubjectData.docCompleted} / {activeSubjectData.docCount} Read</p>
                        </div>
                    </div>

                    <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                        <h3 style={{ margin: '0 0 20px 0', color: '#34495e', textAlign: 'center' }}>Detailed Breakdown: {selectedSubject}</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={singleSubjectChartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" />
                                <YAxis domain={[0, 100]} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="percentage" radius={[6, 6, 0, 0]}>
                                    {singleSubjectChartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* OVERVIEW VIEW: All Subjects */}
            {selectedSubject === 'All' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px' }}>
                    <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                        <h3 style={{ textAlign: 'center', color: '#27ae60', marginBottom: '20px' }}>Quiz Performance (Actual Marks)</h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="subject" />
                                <YAxis domain={[0, 100]} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="quizPercentage" fill="#27ae60" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    {/* ... (Keep your other two overview charts similar to the one above) ... */}
                    <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                        <h3 style={{ textAlign: 'center', color: '#3498db', marginBottom: '20px' }}>Avg. Video Completion (%)</h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="subject" />
                                <YAxis domain={[0, 100]} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="videoAvg" fill="#3498db" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                        <h3 style={{ textAlign: 'center', color: '#9b59b6', marginBottom: '20px' }}>Document Readings (%)</h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="subject" />
                                <YAxis domain={[0, 100]} tick={{fontSize: 12}} />
                                <Tooltip content={<CustomTooltip />} cursor={{fill: '#f4f6f7'}} />
                                <Bar dataKey="docPercentage" name="Docs Read" fill="#9b59b6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentProgress;