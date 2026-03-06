import React, { useState, useEffect } from 'react';
import axios from 'axios';

const StudentVideos = ({ subjectName, user }) => {
    const [contentList, setContentList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    const [userAnswers, setUserAnswers] = useState({});
    const [savedAnswers, setSavedAnswers] = useState({}); // Stores answers fetched from DB
    const [revealedAnswers, setRevealedAnswers] = useState({});

    // 1. Fetch the list of videos
    useEffect(() => {
        fetchVideos();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [subjectName]);

    // 2. Clear states and fetch saved answers when a specific video is opened
    useEffect(() => {
        setUserAnswers({});
        setRevealedAnswers({});
        setSavedAnswers({});
        if (selectedItem && user) {
            fetchSavedAnswers();
        }
    }, [selectedItem]);

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

    // 3. NEW: Fetch answers this student already submitted for this video
    const fetchSavedAnswers = async () => {
        try {
            const response = await axios.get(`http://localhost:8080/api/answers/video?studentId=${user.id}&videoId=${selectedItem.id}`);
            setSavedAnswers(response.data);
            
            // Automatically reveal the teacher's answers for questions they already finished
            const alreadyRevealed = {};
            Object.keys(response.data).forEach(key => {
                alreadyRevealed[key] = true;
            });
            setRevealedAnswers(alreadyRevealed);
        } catch (error) {
            console.error("Error fetching saved answers", error);
        }
    };

    // 4. NEW: Permanently save the answer to the Database
    const handleSaveAndReveal = async (idx) => {
        const answerText = userAnswers[idx];
        if (!answerText || answerText.trim() === '') {
            alert("Please type an answer before submitting!");
            return;
        }

        if (!window.confirm("Are you sure? Once submitted, your answer cannot be changed.")) return;

        try {
            await axios.post('http://localhost:8080/api/answers/video', {
                studentId: user.id,
                videoId: selectedItem.id,
                questionIndex: idx,
                answer: answerText
            });

            // Lock the text box locally and reveal the teacher's answer
            setSavedAnswers(prev => ({ ...prev, [idx]: answerText }));
            setRevealedAnswers(prev => ({ ...prev, [idx]: true }));
        } catch (error) {
            console.error("Error saving answer:", error);
            alert("Failed to save answer. Make sure the Java backend is running.");
        }
    };

    const getYouTubeEmbedUrl = (url) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
    };

    if (selectedItem) {
        return (
            <div style={{ padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px', border: '1px solid #ddd' }}>
                <button 
                    onClick={() => setSelectedItem(null)} 
                    style={{ marginBottom: '20px', padding: '6px 12px', backgroundColor: '#bdc3c7', color: '#2c3e50', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                    Close Video
                </button>
                
                <h3 style={{ margin: '0 0 20px 0', color: '#34495e' }}>{selectedItem.title}</h3>
                
                <iframe 
                    width="100%" height="450" 
                    src={getYouTubeEmbedUrl(selectedItem.videoUrl)} 
                    title="YouTube video player" frameBorder="0" allowFullScreen 
                    style={{ borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
                </iframe>
                
                <h4 style={{ marginTop: '30px', borderBottom: '2px solid #ddd', paddingBottom: '10px' }}>Interactive Study Questions:</h4>
                
                {selectedItem.questions?.map((q, idx) => {
                    const isSaved = savedAnswers[idx] !== undefined;

                    return (
                        <div key={idx} style={{ backgroundColor: 'white', padding: '20px', marginBottom: '15px', borderLeft: isSaved ? '4px solid #27ae60' : '4px solid #3498db', borderRadius: '4px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                            <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#2c3e50' }}>{idx + 1}. {q.question}</p>
                            
                            {/* Textbox - Automatically disables if they already saved an answer */}
                            <textarea
                                value={isSaved ? savedAnswers[idx] : (userAnswers[idx] || '')}
                                onChange={(e) => setUserAnswers({ ...userAnswers, [idx]: e.target.value })}
                                disabled={isSaved}
                                placeholder={isSaved ? "" : "Type your final answer here..."}
                                style={{ 
                                    width: '100%', padding: '10px', borderRadius: '4px', marginBottom: '10px', minHeight: '60px', fontFamily: 'inherit', resize: 'vertical',
                                    border: isSaved ? '1px solid #transparent' : '1px solid #bdc3c7',
                                    backgroundColor: isSaved ? '#f0f3f4' : 'white',
                                    color: isSaved ? '#7f8c8d' : 'black'
                                }}
                            />
                            
                            {!isSaved ? (
                                <button
                                    onClick={() => handleSaveAndReveal(idx)}
                                    style={{ padding: '8px 16px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                                >
                                    Submit & Compare
                                </button>
                            ) : (
                                <p style={{ color: '#27ae60', margin: 0, fontWeight: 'bold', fontSize: '14px' }}>✅ Answer Submitted Permanently</p>
                            )}

                            {revealedAnswers[idx] && (
                                <div style={{ marginTop: '15px', padding: '15px', backgroundColor: '#ebf5fb', borderLeft: '4px solid #2980b9', borderRadius: '4px' }}>
                                    <p style={{ margin: '0 0 5px 0', fontWeight: 'bold', color: '#2980b9' }}>Teacher's Expected Answer:</p>
                                    <p style={{ margin: 0, color: '#34495e', fontSize: '15px' }}>{q.answer}</p>
                                    <p style={{ margin: '10px 0 0 0', fontSize: '12px', color: '#7f8c8d', fontStyle: 'italic' }}>Review your saved answer above. Did you capture the same general meaning?</p>
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px' }}>
            {contentList.map((item, index) => (
                <div key={index} onClick={() => setSelectedItem(item)} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '15px', backgroundColor: '#fff', cursor: 'pointer', transition: 'box-shadow 0.2s' }}
                     onMouseOver={(e) => e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)'}
                     onMouseOut={(e) => e.currentTarget.style.boxShadow = 'none'}>
                    <h4 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>{item.title}</h4>
                    <span style={{ fontSize: '24px' }}>▶️</span>
                    <p style={{ margin: '10px 0 0 0', fontSize: '13px', color: '#3498db', fontWeight: 'bold' }}>Click to watch</p>
                </div>
            ))}
        </div>
    );
};

export default StudentVideos;