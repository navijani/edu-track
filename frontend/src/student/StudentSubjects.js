import React, { useState, useEffect } from 'react';
import axios from 'axios';

const StudentSubjects = ({ onSelectSubject }) => {
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSubjects();
    }, []);

    const fetchSubjects = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/subjects'); 
            setSubjects(response.data);
        } catch (error) {
            console.error("Error fetching subjects:", error);
        }
        setLoading(false);
    };

    if (loading) return <div className="t-empty-state"><p>Loading your curriculum...</p></div>;

    return (
        <div className="s-dash-container">
            <h2 style={{ color: '#1e293b', marginBottom: '5px' }}>My Enrolled Subjects</h2>
            <p style={{ color: '#64748b', marginBottom: '30px' }}>Select a subject to view its learning materials and track progress.</p>
            
            {subjects.length === 0 ? (
                <div className="s-glass-panel" style={{ textAlign: 'center' }}>
                    <p style={{ color: '#94a3b8' }}>No subjects available right now. Please check with your coordinator.</p>
                </div>
            ) : (
                <div className="s-subjects-grid">
                    {subjects.map((subject, index) => (
                        <div 
                            key={index} 
                            onClick={() => onSelectSubject(subject)}
                            className="s-subject-card"
                        >
                            <div className="s-subject-icon">📚</div>
                            
                            <span className="s-subject-code">{subject.code}</span>
                            <h3 className="s-subject-title">{subject.title}</h3> 
                            
                            <div style={{ marginTop: '15px', fontSize: '12px', color: '#3498db', fontWeight: 'bold' }}>
                                View Materials →
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default StudentSubjects;