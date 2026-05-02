import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const StudentNotifications = ({ user }) => {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const dropdownRef = useRef(null);

    useEffect(() => {
        fetchNotifications();
        
        // Polling every 30 seconds for new notifications
        const interval = setInterval(() => {
            fetchNotifications();
        }, 30000);

        // Close dropdown when clicking outside
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        
        return () => {
            clearInterval(interval);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [user.studentClass]);

    const fetchNotifications = async () => {
        if (!user || !user.studentClass) return;
        try {
            const response = await axios.get(`http://localhost:8080/api/notifications?targetClass=${encodeURIComponent(user.studentClass)}`);
            const fetchedData = response.data;
            
            // Just for demonstration, we consider all fetched items as "unread" until dropdown is opened
            // In a real app, you'd track read state in the DB
            if (fetchedData.length > notifications.length) {
                setUnreadCount(fetchedData.length - notifications.length);
            }
            setNotifications(fetchedData);
        } catch (error) {
            console.error("Error fetching notifications", error);
        }
    };

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            setUnreadCount(0); // Mark as read when opening
        }
    };

    const getIconForType = (type) => {
        switch (type) {
            case 'Video': return '🎥';
            case 'Document': return '📄';
            case 'Quiz': return '📝';
            case 'Live Session': return '🔴';
            default: return '📌';
        }
    };

    return (
        <div className="notification-container" ref={dropdownRef} style={{ position: 'relative' }}>
            <button 
                onClick={toggleDropdown} 
                style={{
                    background: 'transparent',
                    border: 'none',
                    fontSize: '24px',
                    cursor: 'pointer',
                    position: 'relative'
                }}
            >
                🔔
                {unreadCount > 0 && (
                    <span style={{
                        position: 'absolute',
                        top: '-5px',
                        right: '-5px',
                        background: '#e74c3c',
                        color: 'white',
                        borderRadius: '50%',
                        padding: '2px 6px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        border: '2px solid white'
                    }}>
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div style={{
                    position: 'absolute',
                    top: '40px',
                    right: '0',
                    width: '320px',
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '12px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                    border: '1px solid rgba(255,255,255,0.4)',
                    zIndex: 1000,
                    overflow: 'hidden'
                }}>
                    <div style={{
                        padding: '15px',
                        borderBottom: '1px solid #eee',
                        background: '#f8fafc',
                        fontWeight: 'bold',
                        color: '#1e293b'
                    }}>
                        Notifications
                    </div>
                    
                    <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                        {notifications.length === 0 ? (
                            <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
                                No new notifications
                            </div>
                        ) : (
                            notifications.map((notif, index) => (
                                <div key={notif.id || index} style={{
                                    padding: '15px',
                                    borderBottom: '1px solid #f1f5f9',
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: '10px',
                                    transition: 'background 0.2s',
                                    cursor: 'pointer'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                    <div style={{ fontSize: '20px' }}>
                                        {getIconForType(notif.contentType)}
                                    </div>
                                    <div>
                                        <p style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#334155' }}>
                                            <strong>New {notif.contentType}:</strong> {notif.title}
                                        </p>
                                        <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                                            Subject: <span style={{textTransform: 'capitalize'}}>{notif.subject}</span>
                                        </p>
                                        <p style={{ margin: '5px 0 0 0', fontSize: '11px', color: '#94a3b8' }}>
                                            {new Date(notif.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentNotifications;
