import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const StudentVideos = ({ subjectName, user }) => {
    const [contentList, setContentList] = useState([]);
    const [videoProgress, setVideoProgress] = useState({}); 
    const [loading, setLoading] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    const [userAnswers, setUserAnswers] = useState({});
    const [savedAnswers, setSavedAnswers] = useState({}); 
    const [revealedAnswers, setRevealedAnswers] = useState({});
    
    // --- Native YouTube Tracking States ---
    const [maxPlayed, setMaxPlayed] = useState(0); // Tracks Percentage
    const [maxPlayedSeconds, setMaxPlayedSeconds] = useState(0); // NEW: Tracks actual seconds!
    const playerRef = useRef(null);
    const intervalRef = useRef(null);

    useEffect(() => {
        fetchVideos();
        if (user) fetchAllProgress();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [subjectName]);

    useEffect(() => {
        setUserAnswers({});
        setRevealedAnswers({});
        setSavedAnswers({});
        setMaxPlayed(0); 
        setMaxPlayedSeconds(0); // Reset seconds
        if (selectedItem && user) {
            fetchSavedAnswers();
        }
    }, [selectedItem]);

    // ==========================================
    // NATIVE YOUTUBE API TRACKER
    // ==========================================
    useEffect(() => {
        if (!selectedItem) return;

        const videoId = getYouTubeId(selectedItem.videoUrl);
        if (!videoId) return;

        const initPlayer = () => {
            if (playerRef.current && playerRef.current.destroy) {
                playerRef.current.destroy();
            }

            playerRef.current = new window.YT.Player('youtube-player-container', {
                height: '450',
                width: '100%',
                videoId: videoId,
                playerVars: { 'rel': 0 },
                events: {
                    'onStateChange': (event) => {
                        if (event.data === window.YT.PlayerState.PLAYING) {
                            intervalRef.current = setInterval(() => {
                                if (playerRef.current && playerRef.current.getCurrentTime) {
                                    const currentTime = playerRef.current.getCurrentTime();
                                    const duration = playerRef.current.getDuration();
                                    
                                    // NEW: Track the exact seconds watched
                                    setMaxPlayedSeconds(prev => Math.max(prev, currentTime));

                                    if (duration > 0) {
                                        const pct = (currentTime / duration) * 100;
                                        setMaxPlayed(prev => Math.max(prev, pct));
                                    }
                                }
                            }, 1000);
                        } else {
                            clearInterval(intervalRef.current);
                        }
                    }
                }
            });
        };

        if (!window.YT) {
            const tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
            
            window.onYouTubeIframeAPIReady = () => initPlayer();
        } else if (window.YT && window.YT.Player) {
            setTimeout(initPlayer, 100);
        }

        return () => {
            clearInterval(intervalRef.current);
            if (playerRef.current && playerRef.current.destroy) {
                try { playerRef.current.destroy(); } catch(e) {}
            }
        };
    }, [selectedItem]);

    const getYouTubeId = (url) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    // --- Helper to format seconds into MM:SS ---
    const formatTime = (totalSeconds) => {
        if (!totalSeconds) return "0:00";
        const m = Math.floor(totalSeconds / 60);
        const s = Math.floor(totalSeconds % 60);
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const fetchVideos = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`http://localhost:8080/api/contents/video?subject=${encodeURIComponent(subjectName)}`);
            setContentList(response.data);
        } catch (error) {
            console.error("Error fetching videos:", error);
            setContentList([]);
        }
        setLoading(false);
    };

    const fetchAllProgress = async () => {
        try {
            const response = await axios.get(`http://localhost:8080/api/progress/video?studentId=${user.id}`);
            setVideoProgress(response.data); 
        } catch (error) {
            console.error("Error fetching video progress:", error);
        }
    };

    const fetchSavedAnswers = async () => {
        try {
            const response = await axios.get(`http://localhost:8080/api/answers/video?studentId=${user.id}&videoId=${selectedItem.id}`);
            setSavedAnswers(response.data);
            
            const alreadyRevealed = {};
            Object.keys(response.data).forEach(key => { alreadyRevealed[key] = true; });
            setRevealedAnswers(alreadyRevealed);
        } catch (error) {
            console.error("Error fetching saved answers", error);
        }
    };

    const handleSaveAndReveal = async (idx) => {
        const answerText = userAnswers[idx];
        if (!answerText || answerText.trim() === '') {
            alert("Please type an answer before submitting!");
            return;
        }
        if (!window.confirm("Are you sure? Once submitted, your answer cannot be changed.")) return;

        try {
            await axios.post('http://localhost:8080/api/answers/video', {
                studentId: user.id, videoId: selectedItem.id, questionIndex: idx, answer: answerText
            });
            setSavedAnswers(prev => ({ ...prev, [idx]: answerText }));
            setRevealedAnswers(prev => ({ ...prev, [idx]: true }));
        } catch (error) {
            alert("Failed to save answer. Make sure the Java backend is running.");
        }
    };

    const handleCloseVideo = async () => {
        const answeredCount = Object.keys(savedAnswers).length;
        const percentage = Math.round(maxPlayed);
        const seconds = Math.round(maxPlayedSeconds); // NEW
        const nowStr = new Date().toISOString().slice(0, 19).replace('T', ' ');

        setVideoProgress(prev => ({
            ...prev,
            [selectedItem.id]: {
                watchedPercentage: Math.max(percentage, prev[selectedItem.id]?.watchedPercentage || 0),
                watchedSeconds: Math.max(seconds, prev[selectedItem.id]?.watchedSeconds || 0), // NEW
                answeredCount: answeredCount
            }
        }));

        try {
            await axios.post('http://localhost:8080/api/progress/video', {
                studentId: user.id,
                videoId: selectedItem.id,
                watchedPercentage: percentage,
                watchedSeconds: seconds, // NEW
                answeredCount: answeredCount,
                lastAccessed: nowStr
            });
        } catch (error) {
            console.error("Error saving progress:", error);
        }
        setSelectedItem(null);
    };

    if (selectedItem) {
        return (
            <div style={{ padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px', border: '1px solid #ddd' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ margin: 0, color: '#34495e' }}>{selectedItem.title}</h3>
                    <button 
                        onClick={handleCloseVideo} 
                        style={{ padding: '8px 15px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                        Close & Save Progress
                    </button>
                </div>
                
                <div style={{ borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', backgroundColor: 'black' }}>
                    <div id="youtube-player-container"></div>
                </div>
                
                <h4 style={{ marginTop: '30px', borderBottom: '2px solid #ddd', paddingBottom: '10px' }}>Interactive Study Questions:</h4>
                
                {selectedItem.questions?.map((q, idx) => {
                    const isSaved = savedAnswers[idx] !== undefined;

                    return (
                        <div key={idx} style={{ backgroundColor: 'white', padding: '20px', marginBottom: '15px', borderLeft: isSaved ? '4px solid #27ae60' : '4px solid #3498db', borderRadius: '4px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                            <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#2c3e50' }}>{idx + 1}. {q.question}</p>
                            
                            <textarea
                                value={isSaved ? savedAnswers[idx] : (userAnswers[idx] || '')}
                                onChange={(e) => setUserAnswers({ ...userAnswers, [idx]: e.target.value })}
                                disabled={isSaved}
                                placeholder={isSaved ? "" : "Type your final answer here..."}
                                style={{ 
                                    width: '100%', padding: '10px', borderRadius: '4px', marginBottom: '10px', minHeight: '60px', fontFamily: 'inherit', resize: 'vertical',
                                    border: isSaved ? '1px solid transparent' : '1px solid #bdc3c7',
                                    backgroundColor: isSaved ? '#f0f3f4' : 'white',
                                    color: isSaved ? '#7f8c8d' : 'black', boxSizing: 'border-box'
                                }}
                            />
                            
                            {!isSaved ? (
                                <button
                                    onClick={() => handleSaveAndReveal(idx)}
                                    style={{ padding: '8px 16px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                                    Submit & Compare
                                </button>
                            ) : (
                                <p style={{ color: '#27ae60', margin: 0, fontWeight: 'bold', fontSize: '14px' }}>✅ Answer Submitted Permanently</p>
                            )}

                            {revealedAnswers[idx] && (
                                <div style={{ marginTop: '15px', padding: '15px', backgroundColor: '#ebf5fb', borderLeft: '4px solid #2980b9', borderRadius: '4px' }}>
                                    <p style={{ margin: '0 0 5px 0', fontWeight: 'bold', color: '#2980b9' }}>Teacher's Expected Answer:</p>
                                    <p style={{ margin: 0, color: '#34495e', fontSize: '15px' }}>{q.answer}</p>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    }

    return loading ? <p>Loading Videos...</p> : contentList.length === 0 ? (
        <div style={{ padding: '20px', backgroundColor: '#f9f9f9', textAlign: 'center', borderRadius: '4px', border: '1px dashed #ccc' }}><p style={{ color: '#7f8c8d' }}>No videos have been uploaded yet.</p></div>
    ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '15px' }}>
            {contentList.map((item, index) => {
                const progress = videoProgress[item.id] || { watchedPercentage: 0, watchedSeconds: 0, answeredCount: 0 };
                const totalQuestions = item.questions ? item.questions.length : 0;
                const isFullyComplete = progress.watchedPercentage >= 90 && progress.answeredCount === totalQuestions;

                return (
                    <div key={index} onClick={() => setSelectedItem(item)} style={{ border: isFullyComplete ? '2px solid #27ae60' : '1px solid #ddd', borderRadius: '8px', padding: '15px', backgroundColor: '#fff', cursor: 'pointer', transition: 'box-shadow 0.2s' }}
                         onMouseOver={(e) => e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)'}
                         onMouseOut={(e) => e.currentTarget.style.boxShadow = 'none'}>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <h4 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>{item.title}</h4>
                            <span style={{ fontSize: '24px' }}>{isFullyComplete ? '✅' : '▶️'}</span>
                        </div>
                        
                        <div style={{ margin: '15px 0', fontSize: '13px', color: '#7f8c8d', backgroundColor: '#fdfefe', padding: '10px', borderRadius: '6px', border: '1px solid #ecf0f1' }}>
                            
                            {/* NEW: Duration Display */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', paddingBottom: '8px', borderBottom: '1px dashed #ddd' }}>
                                <strong>Watch Time:</strong> 
                                <span style={{ color: '#34495e', fontWeight: 'bold' }}>{formatTime(progress.watchedSeconds)}</span>
                            </div>

                            <div style={{ marginBottom: '8px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                                    <strong>Completion:</strong> <span>{progress.watchedPercentage}%</span>
                                </div>
                                <div style={{ width: '100%', backgroundColor: '#eee', height: '6px', borderRadius: '3px' }}>
                                    <div style={{ width: `${progress.watchedPercentage}%`, backgroundColor: progress.watchedPercentage >= 90 ? '#27ae60' : '#3498db', height: '100%', borderRadius: '3px', transition: 'width 0.5s' }}></div>
                                </div>
                            </div>
                            
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <strong>Questions:</strong> <span>{progress.answeredCount} / {totalQuestions}</span>
                            </div>
                        </div>

                        <p style={{ margin: 0, fontSize: '13px', color: isFullyComplete ? '#27ae60' : '#3498db', fontWeight: 'bold' }}>
                            {isFullyComplete ? "Completed" : "Click to continue"}
                        </p>
                    </div>
                );
            })}
        </div>
    );
};

export default StudentVideos;