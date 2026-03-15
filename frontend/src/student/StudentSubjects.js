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
            // Adjust port to 8081 if you are still using that port!
            const response = await axios.get('http://localhost:8080/api/subjects'); 
            setSubjects(response.data);
        } catch (error) {
            console.error("Error fetching subjects:", error);
        }
        setLoading(false);
    };

    if (loading) return <p>Loading subjects...</p>;

    return (
        <div>
            <h2>My Enrolled Subjects</h2>
            <p style={{ color: '#7f8c8d', marginBottom: '20px' }}>Select a subject to view its learning materials.</p>
            
            {subjects.length === 0 ? (
                <div style={{ padding: '20px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #eee' }}>
                    <p style={{ color: '#95a5a6' }}>No subjects available right now.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
                    {subjects.map((subject, index) => (
                        <div 
                            key={index} 
                            onClick={() => onSelectSubject(subject)}
                            style={{ 
                                backgroundColor: '#3498db', 
                                color: 'white', 
                                padding: '30px 20px', 
                                borderRadius: '8px', 
                                textAlign: 'center',
                                cursor: 'pointer',
                                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                transition: 'transform 0.2s'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            <div style={{ fontSize: '40px', marginBottom: '10px' }}>📚</div>
                            
                            {/* --- THIS IS THE FIXED LINE --- */}
                            <h3 style={{ margin: 0 }}>{subject.code} - {subject.title}</h3> 
                            
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default StudentSubjects;