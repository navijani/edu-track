import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import '../styles/Teacher.css';

const TeacherZoomSchedule = ({ user }) => {
    const [topic, setTopic] = useState('');
    const [meetingLink, setMeetingLink] = useState('');
    const [meetingDate, setMeetingDate] = useState('');
    const [meetingTime, setMeetingTime] = useState('');
    const [scheduledMeetings, setScheduledMeetings] = useState([]);
    const [endTime, setEndTime] = useState('');

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
            topic, meetingLink, meetingDate, meetingTime, endTime,
            subject: user.subject, teacher: user.name, teacherId: user.id
        };

        try {
            const res = await axios.post('http://localhost:8080/api/zoom', data);
            if (res.data.success) {
                setTopic(''); setMeetingLink(''); setMeetingDate(''); setMeetingTime(''); setEndTime('');
                fetchMeetings();
            }
        } catch (err) { alert('Error scheduling meeting'); }
    };

    const deleteMeeting = async (id) => {
        if (!window.confirm("Cancel this meeting?")) return;
        try {
            const res = await axios.delete(`http://localhost:8080/api/zoom?id=${id}`);
            if (res.data.success) fetchMeetings();
        } catch (err) { alert("Error deleting meeting"); }
    };

    return (
        <div className="t-zoom-container">
            {/* LEFT SIDE: SCHEDULER */}
            <div className="t-zoom-left">
                <h2 style={{ color: '#1e293b', marginBottom: '5px' }}>Schedule Zoom</h2>
                <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '25px' }}>
                    Setup a live session for <strong>{user.subject}</strong>
                </p>

                <form onSubmit={handleSchedule}>
                    <label className="t-q-label">Meeting Topic</label>
                    <input
                        type="text" required value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="e.g., Live Q&A Session"
                        className="t-zoom-input"
                    />

                    <label className="t-q-label">Zoom Invite Link</label>
                    <input
                        type="url" required value={meetingLink}
                        onChange={(e) => setMeetingLink(e.target.value)}
                        placeholder="https://zoom.us/j/..."
                        className="t-zoom-input"
                    />

                    <div style={{ display: 'flex', gap: '15px' }}>
                        <div style={{ flex: 1 }}>
                            <label className="t-q-label">Date</label>
                            <input type="date" required className="t-zoom-input" value={meetingDate} onChange={(e) => setMeetingDate(e.target.value)} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label className="t-q-label">Time</label>
                            <input type="time" required className="t-zoom-input" value={meetingTime} onChange={(e) => setMeetingTime(e.target.value)} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label className="t-q-label">End Time</label>
                            <input type="time" required className="t-zoom-input" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
                        </div>
                    </div>

                    <button type="submit" className="t-btn-zoom-schedule">
                        🚀 Schedule Meeting Now
                    </button>
                </form>
            </div>

            {/* RIGHT SIDE: FEED */}
            <div className="t-zoom-right">
                <h3 style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    Upcoming Sessions
                    <span className="t-badge-count">{scheduledMeetings.length}</span>
                </h3>

                {scheduledMeetings.length === 0 ? (
                    <div className="t-empty-state" style={{ background: 'white', padding: '40px', borderRadius: '15px' }}>
                        <p>No live sessions planned yet.</p>
                    </div>
                ) : (
                    scheduledMeetings.map((meeting) => (
                        <div key={meeting.id} className="t-zoom-card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <span className="t-pulse-dot"></span>
                                        <span style={{ fontWeight: '800', fontSize: '1.1rem', color: '#1e293b' }}>{meeting.topic}</span>
                                    </div>
                                    <div style={{ marginTop: '10px', color: '#64748b', fontSize: '14px' }}>
                                        <span>📅 {meeting.meetingDate}</span>
                                        <span style={{ marginLeft: '15px' }}>⏰ {meeting.meetingTime} - {meeting.endTime || '??'}</span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <a href={meeting.meetingLink} target="_blank" rel="noopener noreferrer" className="t-btn-glass-purple" style={{ padding: '8px 15px', fontSize: '12px' }}>
                                        Join
                                    </a>
                                    <button onClick={() => deleteMeeting(meeting.id)} className="t-btn-delete-small">
                                        ✕
                                    </button>
                                </div>
                            </div>
                            <div style={{ marginTop: '15px', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                                <span style={{ color: '#94a3b8', fontSize: '11px', fontStyle: 'italic' }}>
                                    Link automatically shared with all {user.subject} students.
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default TeacherZoomSchedule;