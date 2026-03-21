import React, { useState, useEffect } from 'react';
import axios from 'axios';

const StudentLiveClasses = ({ user }) => {
    const [meetings, setMeetings] = useState([]);
    const [loading, setLoading] = useState(true);

    const mySubjects = ['Mathematics', 'Science', 'History']; 

    useEffect(() => {
        const fetchAllMeetings = async () => {
            try {
                const requests = mySubjects.map(sub => 
                    axios.get(`http://localhost:8080/api/zoom?subject=${encodeURIComponent(sub)}`)
                );
                const results = await Promise.all(requests);
                const allMeetings = results.flatMap(res => res.data);
                allMeetings.sort((a, b) => new Date(a.meetingDate) - new Date(b.meetingDate));
                setMeetings(allMeetings);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchAllMeetings();
    }, []);

    // LOGIC: Check if the current time is within 2 hours of the start time
    const isLiveNow = (dateStr, startTimeStr, endTimeStr) => {
    const now = new Date();
    
    // Create actual Date objects for the start and end of the class
    const start = new Date(`${dateStr}T${startTimeStr}`);
    const end = new Date(`${dateStr}T${endTimeStr}`);

    // The class is ONLY live if the current time is between those two markers
    return now >= start && now <= end;
    };

    return (
        <div className="s-dash-container">
            <h2 style={{ color: '#1e293b', fontWeight: '800' }}>🎥 Live Classrooms</h2>
            
            <div className="s-live-grid">
                {meetings.map((meeting) => {
                    const active = isLiveNow(meeting.meetingDate, meeting.meetingTime);
                    
                    return (
                        <div key={meeting.id} className="s-live-card">
                            {/* Visual Logic: Show Pulsing dot if Live */}
                            <div className="s-live-badge">
                                {active && <span className="t-pulse-dot"></span>}
                                {active ? "Live Now" : meeting.subject}
                            </div>
                            
                            <h3 style={{ color: '#1e293b' }}>{meeting.topic}</h3>
                            <p style={{ color: '#94a3b8' }}>{meeting.teacher}</p>
                            
                            <div className="s-live-info-box">
                                <span>📅 {meeting.meetingDate}</span>
                                <span>⏰ {meeting.meetingTime}</span>
                            </div>

                            <a 
                                href={meeting.meetingLink} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="s-btn-join-live"
                                style={{ 
                                    background: active 
                                        ? 'linear-gradient(90deg, #2ecc71 0%, #27ae60 100%)' 
                                        : 'linear-gradient(90deg, #3498db 0%, #2980b9 100%)'
                                }}
                            >
                                {active ? "🚀 Join Active Class" : "Register / Link"}
                            </a>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default StudentLiveClasses;