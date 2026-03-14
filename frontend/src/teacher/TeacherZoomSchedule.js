import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const TeacherZoomSchedule = ({ user }) => {
    const [topic, setTopic] = useState('');
    const [meetingLink, setMeetingLink] = useState('');
    const [meetingDate, setMeetingDate] = useState('');
    const [meetingTime, setMeetingTime] = useState('');
    const [scheduledMeetings, setScheduledMeetings] = useState([]);

    // Wrap fetchMeetings in useCallback to prevent unnecessary re-renders
    const fetchMeetings = useCallback(async () => {
        try {
            const res = await axios.get(`http://localhost:8080/api/zoom?subject=${user.subject}`);
            setScheduledMeetings(res.data);
        } catch (err) { console.error(err); }
    }, [user.subject]);

    useEffect(() => {
        fetchMeetings();
    }, [fetchMeetings]);

    const handleSchedule = async (e) => {
        e.preventDefault();
        const data = {
            topic, meetingLink, meetingDate, meetingTime,
            subject: user.subject, teacher: user.name
        };

        try {
            const res = await axios.post('http://localhost:8080/api/zoom', data);
            if (res.data.success) {
                alert('Meeting Scheduled!');
                setTopic(''); setMeetingLink(''); setMeetingDate(''); setMeetingTime('');
                fetchMeetings(); // Refresh list
            }
        } catch (err) { alert('Error scheduling meeting'); }
    };

    const deleteMeeting = async (id) => {
        if (!window.confirm("Are you sure you want to cancel this meeting?")) return;

        try {
            const res = await axios.delete(`http://localhost:8080/api/zoom?id=${id}`);
            if (res.data.success) {
                fetchMeetings(); // Refresh the list
            }
        } catch (err) {
            alert("Error deleting meeting");
        }
    };
    return (
        <div style={styles.container}>
            {/* LEFT SIDE: FORM */}
            <div style={styles.leftPanel}>
                <div className="admin-card" style={{ height: '100%', margin: 0 }}>
                    <h2>Schedule Zoom Meeting</h2>
                    <p style={{ color: '#7f8c8d', fontSize: '14px' }}>Target Subject: <strong>{user.subject}</strong></p>

                    <form onSubmit={handleSchedule} style={styles.form}>
                        <div style={styles.formGroup}>
                            <label>Meeting Topic:</label>
                            <input
                                type="text" required value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                placeholder="e.g., Chapter 5 Revision"
                                style={styles.input}
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label>Zoom Join Link:</label>
                            <input
                                type="url" required value={meetingLink}
                                onChange={(e) => setMeetingLink(e.target.value)}
                                placeholder="https://zoom.us/j/..."
                                style={styles.input}
                            />
                        </div>

                        <div style={styles.row}>
                            <div style={styles.formGroup}>
                                <label>Date:</label>
                                <input type="date" required value={meetingDate} onChange={(e) => setMeetingDate(e.target.value)} style={styles.input} />
                            </div>
                            <div style={styles.formGroup}>
                                <label>Time:</label>
                                <input type="time" required value={meetingTime} onChange={(e) => setMeetingTime(e.target.value)} style={styles.input} />
                            </div>
                        </div>

                        <button type="submit" style={styles.button}>🚀 Schedule Meeting Now</button>
                    </form>
                </div>
            </div>

            {/* RIGHT SIDE: UPCOMING LIST */}
            <div style={styles.rightPanel}>
                <div className="admin-card" style={{ height: '100%', margin: 0, overflowY: 'auto' }}>
                    <h3 style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between' }}>
                        Upcoming Meetings
                        <span style={styles.badge}>{scheduledMeetings.length}</span>
                    </h3>

                    {scheduledMeetings.length === 0 ? (
                        <div style={styles.emptyState}>
                            <p>No meetings scheduled for {user.subject} yet.</p>
                        </div>
                    ) : (
                        <div style={styles.meetingList}>
                            {scheduledMeetings.map((meeting) => (
                                <div key={meeting.id} style={styles.meetingCard}>
                                    <div style={styles.cardHeader}>
                                        <span style={styles.topicText}>{meeting.topic}</span>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <a href={meeting.meetingLink} target="_blank" rel="noopener noreferrer" style={styles.joinBtn}>Join</a>
                                            <button
                                                onClick={() => deleteMeeting(meeting.id)}
                                                style={styles.deleteBtn}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div style={styles.cardFooter}>
                                        <span>📅 {meeting.meetingDate}</span>
                                        <span>⏰ {meeting.meetingTime}</span>
                                        {/* Visual cue for expiry */}
                                        <span style={{ color: '#e74c3c', fontSize: '11px', marginLeft: 'auto' }}>
                                            ⏳ Auto-expires 2hrs after start
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Updated Styles for Side-by-Side Layout
const styles = {

    deleteBtn: {
    padding: '5px 12px',
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    fontSize: '12px',
    fontWeight: 'bold',
    cursor: 'pointer'
},

    container: {
        display: 'flex',
        gap: '25px',
        alignItems: 'stretch',
        height: 'calc(100vh - 150px)' // Adjust based on your header height
    },
    leftPanel: { flex: '1' },
    rightPanel: { flex: '1' },
    form: { display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' },
    formGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
    row: { display: 'flex', gap: '15px' },
    input: { padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' },
    button: {
        padding: '12px', backgroundColor: '#3498db', color: 'white',
        border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px'
    },
    meetingList: { display: 'flex', flexDirection: 'column', gap: '15px' },
    meetingCard: {
        padding: '15px', borderRadius: '10px', backgroundColor: '#f8f9fa',
        border: '1px solid #e9ecef', transition: 'transform 0.2s'
    },
    cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' },
    topicText: { fontWeight: 'bold', color: '#2c3e50', fontSize: '16px' },
    joinBtn: {
        padding: '5px 12px', backgroundColor: '#2ecc71', color: 'white',
        textDecoration: 'none', borderRadius: '5px', fontSize: '12px', fontWeight: 'bold'
    },
    cardFooter: { display: 'flex', gap: '20px', fontSize: '13px', color: '#7f8c8d' },
    badge: {
        backgroundColor: '#3498db', color: 'white', padding: '2px 10px',
        borderRadius: '20px', fontSize: '14px'
    },
    emptyState: { textAlign: 'center', padding: '40px', color: '#bdc3c7' }

    
};


export default TeacherZoomSchedule;