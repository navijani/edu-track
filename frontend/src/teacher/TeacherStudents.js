import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TeacherStudents = ({ user }) => {
    const [students, setStudents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [studentDetails, setStudentDetails] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const res = await axios.get('http://localhost:8080/api/teacher/students');
                setStudents(res.data);
            } catch (err) { console.error(err); }
        };
        fetchStudents();
    }, []);

    useEffect(() => {
        const fetchDetails = async () => {
            if (!selectedStudent || !user.subject) return;
            setLoadingDetails(true);
            try {
                const res = await axios.get(`http://localhost:8080/api/teacher/students?studentId=${selectedStudent.id}&subject=${encodeURIComponent(user.subject)}`);
                setStudentDetails(res.data);
            } catch (err) { console.error(err); }
            setLoadingDetails(false);
        };
        fetchDetails();
    }, [selectedStudent, user.subject]);

    const filteredStudents = students.filter(student => 
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        student.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="t-students-container">
            {/* LEFT SIDE: Student List */}
            <div className="t-students-left">
                <div className="t-header-mini">
                    <h2 style={{ color: '#1e293b', marginBottom: '10px' }}>My Students</h2>
                    <input 
                        type="text" 
                        placeholder="🔍 Search name or email..." 
                        className="t-students-search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="t-student-list-scroll">
                    {filteredStudents.map((student) => (
                        <div 
                            key={student.id} 
                            onClick={() => setSelectedStudent(student)}
                            className={`t-student-card ${selectedStudent?.id === student.id ? 'active' : ''}`}
                        >
                            <div className="t-student-avatar">
                                {student.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="t-student-info">
                                <h4 style={{ margin: 0, fontSize: '15px' }}>{student.name}</h4>
                                <p style={{ margin: 0, color: '#64748b', fontSize: '12px' }}>{student.email}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* RIGHT SIDE: Student Details */}
            <div className="t-students-right">
                {!selectedStudent ? (
                    <div className="t-empty-state" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ fontSize: '1.2rem', color: '#94a3b8' }}>
                                Select a student to view their <strong>{user.subject}</strong> performance.</p>
                        </div>
                    </div>
                ) : loadingDetails ? (
                    <div className="t-empty-state"><p>Loading analytics...</p></div>
                ) : (
                    <div className="t-student-details-inner">
                        <div className="t-details-header" style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '30px' }}>
                            <div className="t-student-avatar" style={{ width: '70px', height: '70px', fontSize: '1.8rem' }}>
                                {selectedStudent.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h2 style={{ margin: 0 ,color:'#7d44c0'}}>{selectedStudent.name}</h2>
                                <p style={{ color: '#64748b' }}>Student ID: {selectedStudent.id} | {selectedStudent.email}</p>
                            </div>
                        </div>

                        <h3 className="t-section-title" style={{ borderBottom: '3px solid #c9d5e6', paddingBottom: '20px',color:'#444ac0',alignContent:'center' }}>
                            {user.subject} Performance Overview
                        </h3>

                        {/* QUIZZES */}
                        <div className="t-detail-section">
                            <h4 className="t-section-header" style={{ color: '#10b981' }}>📝 Quiz Scores</h4>
                            {studentDetails?.quizzes?.length === 0 ? <p className="t-no-data">No quiz data available.</p> : (
                                studentDetails?.quizzes?.map((q, i) => (
                                    <div key={i} className="t-progress-card">
                                        <span className="t-progress-title">{q.title}</span>
                                        <div className="t-score-badge green">{q.score} / {q.total}</div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* VIDEOS */}
                        <div className="t-detail-section">
                            <h4 className="t-section-header" style={{ color: '#3498db' }}>▶️ Video Watch Progress</h4>
                            {studentDetails?.videos?.length === 0 ? <p className="t-no-data">No videos watched yet.</p> : (
                                studentDetails?.videos?.map((v, i) => (
                                    <div key={i} className="t-progress-card">
                                        <span className="t-progress-title">{v.title}</span>
                                        <div className="t-progress-container">
                                            <div className="t-progress-bar-bg">
                                                <div className="t-progress-bar-fill" style={{ width: `${v.progress}%`, backgroundColor: '#3498db' }}></div>
                                            </div>
                                            <span style={{ fontWeight: 'bold', fontSize: '12px' }}>{v.progress}%</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* DOCUMENTS */}
                        <div className="t-detail-section">
                            <h4 className="t-section-header" style={{ color: '#a855f7' }}>📄 Reading Progress</h4>
                            {studentDetails?.documents?.length === 0 ? <p className="t-no-data">No documents accessed.</p> : (
                                studentDetails?.documents?.map((d, i) => (
                                    <div key={i} className="t-progress-card">
                                        <span className="t-progress-title">{d.title}</span>
                                        <div className="t-progress-container">
                                            <div className="t-progress-bar-bg">
                                                <div className="t-progress-bar-fill" style={{ width: `${d.progress}%`, backgroundColor: '#a855f7' }}></div>
                                            </div>
                                            <span style={{ fontWeight: 'bold', fontSize: '12px' }}>{d.progress}%</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TeacherStudents;