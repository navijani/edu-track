import React, { useState, useEffect } from 'react';
import axios from 'axios';

const StudentLiveClasses = ({ user }) => {
    const [meetings, setMeetings] = useState([]);
    const [loading, setLoading] = useState(true);
    // Use a state to force re-render for the "Live" timer logic
    const [now, setNow] = useState(new Date());

    
    useEffect(() => {
        const fetchAllMeetings = async () => {
            try {
                // Fetch all subjects since user.enrolledSubjects is not provided by backend
                const subRes = await axios.get('http://localhost:8080/api/subjects');
                const studentSubjects = subRes.data.map(sub => sub.title);

                const requests = studentSubjects.map(sub => 
                    axios.get(`http://localhost:8080/api/zoom?subject=${encodeURIComponent(sub)}`)
                );
                const results = await Promise.all(requests);
                const allMeetings = results.flatMap(res => res.data);
                setMeetings(allMeetings);

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

        // Refresh the 'Live Now' status every 60 seconds
        const timer = setInterval(() => setNow(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    // LOGIC: Check if the current time is between start and end markers
    const isLiveNow = (dateStr, startTimeStr, endTimeStr) => {
        if (!startTimeStr || !endTimeStr) return false;
        
        const start = new Date(`${dateStr}T${startTimeStr}`);
        const end = new Date(`${dateStr}T${endTimeStr}`);

        return now >= start && now <= end;
    };

    return (
        <div className="s-dash-container">
            <div style={{ marginBottom: '30px' }}>
                <h2 style={{ color: '#1e293b', fontWeight: '800', margin: 0 }}>🎥 Live Classrooms</h2>
                <p style={{ color: '#64748b', marginTop: '5px' }}>Join your teacher's live Zoom sessions below.</p>
            </div>

            {loading ? (
                <div className="t-empty-state" style={{ background: 'white', padding: '40px', borderRadius: '15px' }}>
                    <p>Syncing your schedule...</p>
                </div>
            ) : meetings.length === 0 ? (
                /* EMPTY STATE: Shown when no meetings exist in the DB for student's subjects */
                <div className="t-empty-state" style={{ background: 'white', padding: '60px', borderRadius: '20px', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                    <div style={{ fontSize: '50px', marginBottom: '20px' }}>📅</div>
                    <h3 style={{ color: '#1e293b', margin: '0 0 10px 0' }}>No Sessions Planned</h3>
                    <p style={{ color: '#94a3b8', margin: 0 }}>There are no live classes scheduled for your subjects at the moment.</p>
                </div>
            ) : (
                <div className="s-live-grid">
                    {meetings.map((meeting) => {
                        // Check if current time is within meeting window
                        const active = isLiveNow(meeting.meetingDate, meeting.meetingTime, meeting.endTime);
                        
                        return (
                            <div key={meeting.id} className="s-live-card">
                                {/* Visual Logic: Show Pulsing dot if Live */}
                                <div className="s-live-badge" style={{ 
                                    backgroundColor: active ? '#f0fdf4' : '#e8f4fd', 
                                    color: active ? '#22c55e' : '#3498db' 
                                }}>
                                    {active && <span className="t-pulse-dot"></span>}
                                    {active ? "Live Now" : meeting.subject}
                                </div>
                                
                                <h3 style={{ color: '#1e293b', marginTop: '15px' }}>{meeting.topic}</h3>
                                <p style={{ color: '#94a3b8', fontSize: '14px' }}>Instructor: {meeting.teacher}</p>
                                
                                <div className="s-live-info-box">
                                    <span style={{ fontWeight: '600' }}>📅 {meeting.meetingDate}</span>
                                    <span style={{ fontWeight: '600' }}>⏰ {meeting.meetingTime} - {meeting.endTime || '??'}</span>
                                </div>

                                <a 
                                    href={meeting.meetingLink} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="s-btn-join-live"
                                    style={{ 
                                        background: active 
                                            ? 'linear-gradient(90deg, #2ecc71 0%, #27ae60 100%)' 
                                            : 'linear-gradient(90deg, #3498db 0%, #2980b9 100%)',
                                        boxShadow: active ? '0 4px 15px rgba(46, 204, 113, 0.3)' : '0 4px 15px rgba(52, 152, 219, 0.2)'
                                    }}
                                >
                                    {active ? "🚀 Join Active Class" : "View Link / Schedule"}
                                </a>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default StudentLiveClasses;