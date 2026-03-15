import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TeacherStudents = ({ user }) => {
    const [students, setStudents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Split-screen states
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [studentDetails, setStudentDetails] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);

    // Load list on start
    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const res = await axios.get('http://localhost:8080/api/teacher/students');
                setStudents(res.data);
            } catch (err) { console.error(err); }
        };
        fetchStudents();
    }, []);

    // Load details when a student is clicked
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
        <div style={styles.container}>
            {/* LEFT SIDE: Student List */}
            <div style={styles.leftPanel}>
                <div style={styles.header}>
                    <h2 style={{ margin: '0 0 5px 0', color: '#2c3e50' }}>My Students</h2>
                    <input 
                        type="text" 
                        placeholder="🔍 Search name..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={styles.searchBar}
                    />
                </div>

                <div style={styles.listContainer}>
                    {filteredStudents.map((student) => (
                        <div 
                            key={student.id} 
                            onClick={() => setSelectedStudent(student)}
                            style={{
                                ...styles.card,
                                borderLeft: selectedStudent?.id === student.id ? '4px solid #3498db' : '4px solid transparent',
                                backgroundColor: selectedStudent?.id === student.id ? '#f4f9fd' : 'white'
                            }}
                        >
                            <div style={styles.avatar}>{student.name.charAt(0).toUpperCase()}</div>
                            <div style={styles.info}>
                                <h4 style={styles.name}>{student.name}</h4>
                                <p style={styles.email}>{student.email}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* RIGHT SIDE: Student Details */}
            <div style={styles.rightPanel}>
                {!selectedStudent ? (
                    <div style={styles.emptyState}>
                        <p>Select a student from the list to view their {user.subject} progress.</p>
                    </div>
                ) : loadingDetails ? (
                    <div style={styles.emptyState}><p>Loading records...</p></div>
                ) : (
                    <div style={styles.detailsContainer}>
                        <div style={styles.detailsHeader}>
                            <div style={{...styles.avatar, width: '60px', height: '60px', fontSize: '24px'}}>
                                {selectedStudent.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h2 style={{ margin: 0, color: '#2c3e50' }}>{selectedStudent.name}</h2>
                                <p style={{ color: '#7f8c8d', margin: 0 }}>ID: {selectedStudent.id} | {selectedStudent.email}</p>
                            </div>
                        </div>

                        <h3 style={{ borderBottom: '2px solid #eee', paddingBottom: '10px' }}>{user.subject} Overview</h3>

                        {/* QUIZZES */}
                        <div style={styles.section}>
                            <h4 style={{ color: '#e67e22' }}>📝 Quiz Scores</h4>
                            {studentDetails?.quizzes?.length === 0 ? <p style={styles.noData}>No quizzes attempted.</p> : (
                                studentDetails?.quizzes?.map((q, i) => (
                                    <div key={i} style={styles.progressRow}>
                                        <span style={{flex: 1}}>{q.title}</span>
                                        <strong>{q.score} / {q.total}</strong>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* VIDEOS */}
                        <div style={styles.section}>
                            <h4 style={{ color: '#3498db' }}>▶️ Video Progress</h4>
                            {studentDetails?.videos?.length === 0 ? <p style={styles.noData}>No videos watched.</p> : (
                                studentDetails?.videos?.map((v, i) => (
                                    <div key={i} style={styles.progressRow}>
                                        <span style={{flex: 1}}>{v.title}</span>
                                        <div style={styles.progressBarBg}>
                                            <div style={{...styles.progressBarFill, width: `${v.progress}%`, backgroundColor: '#3498db'}}></div>
                                        </div>
                                        <span style={{width: '40px', textAlign: 'right', fontSize: '12px'}}>{v.progress}%</span>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* DOCUMENTS */}
                        <div style={styles.section}>
                            <h4 style={{ color: '#9b59b6' }}>📄 Document Progress</h4>
                            {studentDetails?.documents?.length === 0 ? <p style={styles.noData}>No documents viewed.</p> : (
                                studentDetails?.documents?.map((d, i) => (
                                    <div key={i} style={styles.progressRow}>
                                        <span style={{flex: 1}}>{d.title}</span>
                                        <div style={styles.progressBarBg}>
                                            <div style={{...styles.progressBarFill, width: `${d.progress}%`, backgroundColor: '#9b59b6'}}></div>
                                        </div>
                                        <span style={{width: '40px', textAlign: 'right', fontSize: '12px'}}>{d.progress}%</span>
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

const styles = {
    container: { display: 'flex', gap: '25px', height: 'calc(100vh - 80px)', alignItems: 'flex-start' },
    leftPanel: { flex: '1', minWidth: '280px', maxWidth: '350px', display: 'flex', flexDirection: 'column', height: '100%' },
    header: { marginBottom: '15px' },
    searchBar: { padding: '10px 15px', borderRadius: '8px', border: '1px solid #ddd', width: '100%', fontSize: '14px', outline: 'none', boxSizing: 'border-box', marginTop: '10px' },
    listContainer: { overflowY: 'auto', flexGrow: 1, paddingRight: '5px' },
    card: { padding: '15px', borderRadius: '8px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '15px', border: '1px solid #eee', cursor: 'pointer', transition: 'background 0.2s' },
    avatar: { width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#34495e', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 'bold', flexShrink: 0 },
    info: { overflow: 'hidden' },
    name: { margin: '0 0 3px 0', color: '#2c3e50', fontSize: '15px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
    email: { margin: 0, color: '#7f8c8d', fontSize: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
    
    rightPanel: { flex: '2', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', height: '100%', overflowY: 'auto', border: '1px solid #e9ecef' },
    emptyState: { height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#95a5a6' },
    detailsContainer: { padding: '30px' },
    detailsHeader: { display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px' },
    section: { marginBottom: '30px', backgroundColor: '#fafbfc', padding: '15px', borderRadius: '8px', border: '1px solid #f1f1f1' },
    progressRow: { display: 'flex', alignItems: 'center', gap: '15px', fontSize: '14px', marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px solid #eee' },
    progressBarBg: { flex: 1, height: '8px', backgroundColor: '#ecf0f1', borderRadius: '4px', overflow: 'hidden' },
    progressBarFill: { height: '100%', borderRadius: '4px', transition: 'width 0.5s ease-out' },
    noData: { fontSize: '13px', color: '#bdc3c7', fontStyle: 'italic' }
};

export default TeacherStudents;