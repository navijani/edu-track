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
    
    const [actualWatchedSeconds, setActualWatchedSeconds] = useState(0); 
    const playerRef = useRef(null);
    const intervalRef = useRef(null);
    const lastTimeRef = useRef(0);

    useEffect(() => {
        fetchVideos();
        if (user) fetchAllProgress();
    }, [subjectName]);

    useEffect(() => {
        setUserAnswers({});
        setRevealedAnswers({});
        setSavedAnswers({});
        
        const existingProgress = videoProgress[selectedItem?.id];
        setActualWatchedSeconds(existingProgress?.watchedSeconds || 0);

        if (selectedItem && user) fetchSavedAnswers();
    }, [selectedItem]);

    useEffect(() => {
        if (!selectedItem) return;
        const videoId = getYouTubeId(selectedItem.videoUrl);
        if (!videoId) return;

        const initPlayer = () => {
            if (playerRef.current && playerRef.current.destroy) playerRef.current.destroy();
            playerRef.current = new window.YT.Player('youtube-player-container', {
                height: '450', width: '100%', videoId: videoId,
                playerVars: { 'rel': 0 },
                events: {
                    'onStateChange': (event) => {
                        if (event.data === window.YT.PlayerState.PLAYING) {
                            if (playerRef.current?.getCurrentTime) lastTimeRef.current = playerRef.current.getCurrentTime();
                            intervalRef.current = setInterval(() => {
                                if (playerRef.current?.getCurrentTime) {
                                    const currentTime = playerRef.current.getCurrentTime();
                                    const delta = currentTime - lastTimeRef.current;
                                    if (delta > 0 && delta <= 4) setActualWatchedSeconds(prev => prev + delta);
                                    lastTimeRef.current = currentTime;
                                }
                            }, 1000);
                        } else clearInterval(intervalRef.current);
                    }
                }
            });
        };

        if (!window.YT) {
            const tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";
            document.getElementsByTagName('script')[0].parentNode.insertBefore(tag, document.getElementsByTagName('script')[0]);
            window.onYouTubeIframeAPIReady = () => initPlayer();
        } else if (window.YT?.Player) {
            setTimeout(initPlayer, 100);
        }

        return () => {
            clearInterval(intervalRef.current);
            if (playerRef.current?.destroy) try { playerRef.current.destroy(); } catch(e) {}
        };
    }, [selectedItem]);

    const getYouTubeId = (url) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const formatTime = (totalSeconds) => {
        const m = Math.floor(totalSeconds / 60);
        const s = Math.floor(totalSeconds % 60);
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const fetchVideos = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`http://localhost:8080/api/contents/video?subject=${encodeURIComponent(subjectName)}&targetClass=${encodeURIComponent(user.studentClass)}`);
            setContentList(response.data);
        } catch (error) { setContentList([]); }
        setLoading(false);
    };

    const fetchAllProgress = async () => {
        try {
            const response = await axios.get(`http://localhost:8080/api/progress/video?studentId=${user.id}`);
            setVideoProgress(response.data); 
        } catch (error) {}
    };

    const fetchSavedAnswers = async () => {
        try {
            const response = await axios.get(`http://localhost:8080/api/answers/video?studentId=${user.id}&videoId=${selectedItem.id}`);
            setSavedAnswers(response.data);
            const alreadyRevealed = {};
            Object.keys(response.data).forEach(key => { alreadyRevealed[key] = true; });
            setRevealedAnswers(alreadyRevealed);
        } catch (error) {}
    };

    const handleSaveAndReveal = async (idx) => {
        const answerText = userAnswers[idx];
        if (!answerText?.trim()) return alert("Type your answer first!");
        if (!window.confirm("Submit answer permanently?")) return;

        try {
            await axios.post('http://localhost:8080/api/answers/video', {
                studentId: user.id, videoId: selectedItem.id, questionIndex: idx, answer: answerText
            });
            setSavedAnswers(prev => ({ ...prev, [idx]: answerText }));
            setRevealedAnswers(prev => ({ ...prev, [idx]: true }));
        } catch (error) { alert("Error saving answer."); }
    };

    const handleCloseVideo = async () => {
        const answeredCount = Object.keys(savedAnswers).length;
        const seconds = Math.round(actualWatchedSeconds); 
        let percentage = videoProgress[selectedItem.id]?.watchedPercentage || 0;
        
        if (playerRef.current?.getDuration) {
            const duration = playerRef.current.getDuration();
            if (duration > 0) percentage = Math.min(100, Math.max(percentage, Math.round((seconds / duration) * 100)));
        }

        try {
            await axios.post('http://localhost:8080/api/progress/video', {
                studentId: user.id, videoId: selectedItem.id, watchedPercentage: percentage, 
                watchedSeconds: seconds, answeredCount, lastAccessed: new Date().toISOString()
            });
            fetchAllProgress();
        } catch (error) {}
        setSelectedItem(null);
    };

    if (selectedItem) {
        return (
            <div className="s-video-viewer-container animated-fade-in">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px' }}>
                    <h2 style={{ margin: 0, color: '#1e293b' }}>{selectedItem.title}</h2>
                    <button onClick={handleCloseVideo} className="s-btn-logout" style={{ width: 'auto', padding: '10px 20px' }}>
                        Finish & Save
                    </button>
                </div>
                
                <div className="s-video-frame-wrapper">
                    <div id="youtube-player-container"></div>
                </div>
                
                <h3 className="t-section-header" style={{ color: '#3498db' }}>Interactive Study Guide</h3>
                
                {selectedItem.questions?.map((q, idx) => {
                    const isSaved = savedAnswers[idx] !== undefined;
                    return (
                        <div key={idx} className={`s-video-q-box ${isSaved ? 'saved' : ''}`}>
                            <p style={{ fontWeight: '700', color: '#1e293b', marginBottom: '15px' }}>{idx + 1}. {q.question}</p>
                            <textarea
                                value={isSaved ? savedAnswers[idx] : (userAnswers[idx] || '')}
                                onChange={(e) => setUserAnswers({ ...userAnswers, [idx]: e.target.value })}
                                disabled={isSaved}
                                className="t-adddoc-input"
                                style={{ minHeight: '70px', marginBottom: '15px' }}
                                placeholder="Write your notes here..."
                            />
                            {!isSaved ? (
                                <button onClick={() => handleSaveAndReveal(idx)} className="s-pill-btn active-videos">
                                    Submit Answer
                                </button>
                            ) : (
                                <span style={{ color: '#10b981', fontWeight: '800', fontSize: '14px' }}>✅ Answer Logged</span>
                            )}
                            {revealedAnswers[idx] && (
                                <div className="s-video-teacher-ans">
                                    <strong style={{ color: '#3498db', display: 'block', marginBottom: '5px' }}>Reference Answer:</strong>
                                    {q.answer}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    }

    return loading ? <p className="t-empty-state">Loading Cinema...</p> : (
        <div className="s-video-grid">
            {contentList.map((item, index) => {
                const progress = videoProgress[item.id] || { watchedPercentage: 0, watchedSeconds: 0, answeredCount: 0 };
                const totalQ = item.questions?.length || 0;
                const isDone = progress.watchedPercentage >= 90 && progress.answeredCount === totalQ;

                return (
                    <div key={index} onClick={() => setSelectedItem(item)} className={`s-video-card ${isDone ? 'completed' : ''}`}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <h4 style={{ margin: 0, color: '#496da5' }}>{item.title}</h4>
                            <span style={{ fontSize: '20px' }}>{isDone ? '✅' : '▶️'}</span>
                        </div>
                        
                        <div className="s-video-dropdown-area" style={{ marginTop: '15px', padding: '10px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                                <span>Watched:</span>
                                <strong>{formatTime(progress.watchedSeconds)}</strong>
                            </div>
                            <div className="t-progress-bar-bg" style={{ margin: '8px 0' }}>
                                <div className="t-progress-bar-fill" style={{ 
                                    width: `${progress.watchedPercentage}%`, 
                                    backgroundColor: progress.watchedPercentage >= 90 ? '#1040b9' : '#3498db' 
                                }}></div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b' }}>
                                <span>Progress: {progress.watchedPercentage}%</span>
                                <span>{progress.answeredCount}/{totalQ} Questions</span>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default StudentVideos;