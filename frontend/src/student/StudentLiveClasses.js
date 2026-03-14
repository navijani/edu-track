import React, { useState, useEffect } from 'react';
import axios from 'axios';

const StudentLiveClasses = ({ user }) => {
    const [meetings, setMeetings] = useState([]);
    const [loading, setLoading] = useState(true);

    // Example subjects - in a real app, you'd get these from user.enrolledSubjects
    const mySubjects = ['Mathematics', 'Science', 'History']; 

    useEffect(() => {
        const fetchAllMeetings = async () => {
            try {
                // We fetch meetings for each subject the student has
                const requests = mySubjects.map(sub => 
                    axios.get(`http://localhost:8080/api/zoom?subject=${sub}`)
                );
                
                const results = await Promise.all(requests);
                const allMeetings = results.flatMap(res => res.data);
                
                // Sort by date and time
                allMeetings.sort((a, b) => new Date(a.meetingDate) - new Date(b.meetingDate));
                
                setMeetings(allMeetings);
            } catch (err) {
                console.error("Error fetching live classes:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchAllMeetings();
    }, []);

    return (
        <div style={{ padding: '10px' }}>
            <div style={{ marginBottom: '20px' }}>
                <h2 style={{ color: '#2c3e50', margin: 0 }}>🎥 Live Classes</h2>
                <p style={{ color: '#7f8c8d' }}>Join your teacher's live Zoom sessions below.</p>
            </div>

            {loading ? (
                <p>Loading classes...</p>
            ) : meetings.length === 0 ? (
                <div style={styles.emptyState}>
                    <p>No live classes scheduled for your subjects right now.</p>
                </div>
            ) : (
                <div style={styles.grid}>
                    {meetings.map((meeting) => (
                        <div key={meeting.id} style={styles.card}>
                            <div style={styles.badge}>{meeting.subject}</div>
                            <h3 style={styles.topic}>{meeting.topic}</h3>
                            <p style={styles.teacher}>with {meeting.teacher}</p>
                            
                            <div style={styles.infoRow}>
                                <span>📅 {meeting.meetingDate}</span>
                                <span>⏰ {meeting.meetingTime}</span>
                            </div>

                            <a 
                                href={meeting.meetingLink} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                style={styles.joinBtn}
                            >
                                Join Now
                            </a>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const styles = {
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '20px'
    },
    card: {
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        position: 'relative',
        borderTop: '5px solid #3498db'
    },
    badge: {
        position: 'absolute',
        top: '10px',
        right: '15px',
        backgroundColor: '#e8f4fd',
        color: '#3498db',
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '12px',
        fontWeight: 'bold'
    },
    topic: { margin: '10px 0 5px 0', color: '#2c3e50' },
    teacher: { margin: '0 0 15px 0', color: '#95a5a6', fontSize: '14px' },
    infoRow: { 
        display: 'flex', 
        justifyContent: 'space-between', 
        fontSize: '14px', 
        color: '#34495e',
        marginBottom: '20px',
        padding: '10px 0',
        borderTop: '1px solid #f1f1f1'
    },
    joinBtn: {
        display: 'block',
        textAlign: 'center',
        backgroundColor: '#27ae60',
        color: 'white',
        textDecoration: 'none',
        padding: '10px',
        borderRadius: '6px',
        fontWeight: 'bold',
        transition: 'background 0.3s'
    },
    emptyState: {
        textAlign: 'center',
        padding: '50px',
        backgroundColor: 'white',
        borderRadius: '12px',
        color: '#95a5a6'
    }
};

export default StudentLiveClasses;