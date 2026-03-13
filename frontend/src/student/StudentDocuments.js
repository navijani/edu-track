import React, { useState, useEffect } from 'react';
import axios from 'axios';

const StudentDocuments = ({ subjectName, user }) => {
    const [contentList, setContentList] = useState([]);
    const [documentProgress, setDocumentProgress] = useState({}); 
    const [loading, setLoading] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    // Interactive Answer States
    const [userAnswers, setUserAnswers] = useState({});
    const [savedAnswers, setSavedAnswers] = useState({}); 
    const [revealedAnswers, setRevealedAnswers] = useState({});
    
    // Tracker for opening the document
    const [hasOpened, setHasOpened] = useState(false);

    useEffect(() => {
        fetchDocuments();
        if (user) fetchAllProgress();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [subjectName]);

    // Clear states when opening a new document
    useEffect(() => {
        setUserAnswers({});
        setRevealedAnswers({});
        setSavedAnswers({});
        setHasOpened(false); // Reset the tracker
        if (selectedItem && user) {
            fetchSavedAnswers();
        }
    }, [selectedItem]);

    const fetchDocuments = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`http://localhost:8080/api/contents/document?subject=${encodeURIComponent(subjectName)}`);
            setContentList(response.data);
        } catch (error) {
            console.error("Error fetching documents:", error);
            setContentList([]);
        }
        setLoading(false);
    };

    // --- NEW: Analytics & Progress Fetches ---
    const fetchAllProgress = async () => {
        try {
            const response = await axios.get(`http://localhost:8080/api/progress/document?studentId=${user.id}`);
            setDocumentProgress(response.data); 
        } catch (error) {
            console.error("Error fetching document progress:", error);
        }
    };

    const fetchSavedAnswers = async () => {
        try {
            const response = await axios.get(`http://localhost:8080/api/answers/document?studentId=${user.id}&documentId=${selectedItem.id}`);
            setSavedAnswers(response.data);
            
            const alreadyRevealed = {};
            Object.keys(response.data).forEach(key => { alreadyRevealed[key] = true; });
            setRevealedAnswers(alreadyRevealed);
        } catch (error) {
            console.error("Error fetching saved answers", error);
        }
    };

    // --- NEW: Save Answer Logic ---
    const handleSaveAndReveal = async (idx) => {
        const answerText = userAnswers[idx];
        if (!answerText || answerText.trim() === '') {
            alert("Please type an answer before submitting!");
            return;
        }

        if (!window.confirm("Are you sure? Once submitted, your answer cannot be changed.")) return;

        try {
            await axios.post('http://localhost:8080/api/answers/document', {
                studentId: user.id,
                documentId: selectedItem.id,
                questionIndex: idx,
                answer: answerText
            });

            setSavedAnswers(prev => ({ ...prev, [idx]: answerText }));
            setRevealedAnswers(prev => ({ ...prev, [idx]: true }));
        } catch (error) {
            console.error("Error saving answer:", error);
            alert("Failed to save answer. Make sure the Java backend is running.");
        }
    };

    // --- NEW: Save Overall Progress on Close ---
    const handleCloseDocument = async () => {
        const answeredCount = Object.keys(savedAnswers).length;
        // If they clicked the document link during this session, or had previously opened it, it's 100%
        const isOpened = hasOpened || (documentProgress[selectedItem.id]?.watchedPercentage === 100);
        const percentage = isOpened ? 100 : 0; 
        
        const nowStr = new Date().toISOString().slice(0, 19).replace('T', ' ');

        // Update local UI immediately
        setDocumentProgress(prev => ({
            ...prev,
            [selectedItem.id]: {
                watchedPercentage: percentage,
                answeredCount: answeredCount
            }
        }));

        try {
            await axios.post('http://localhost:8080/api/progress/document', {
                studentId: user.id,
                documentId: selectedItem.id,
                watchedPercentage: percentage,
                answeredCount: answeredCount,
                lastAccessed: nowStr
            });
        } catch (error) {
            console.error("Error saving document progress:", error);
        }

        setSelectedItem(null);
    };

    // ==========================================
    // RENDER: DOCUMENT IN PROGRESS
    // ==========================================
    if (selectedItem) {
        return (
            <div style={{ padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px', border: '1px solid #ddd' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ margin: 0, color: '#34495e' }}>{selectedItem.title}</h3>
                    <button 
                        onClick={handleCloseDocument} 
                        style={{ padding: '8px 15px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                        Close & Save Progress
                    </button>
                </div>
                
                <div style={{ padding: '30px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #ddd', textAlign: 'center', marginBottom: '30px' }}>
                    <p style={{ color: '#7f8c8d', marginBottom: '20px' }}>Click below to read the assigned material in a new tab.</p>
                    <a 
                        href={selectedItem.documentUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        onClick={() => setHasOpened(true)} // TRACKS THAT THEY OPENED IT!
                        style={{ display: 'inline-block', padding: '12px 25px', backgroundColor: '#9b59b6', color: 'white', textDecoration: 'none', borderRadius: '4px', fontWeight: 'bold', fontSize: '16px', transition: 'background-color 0.2s' }}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#8e44ad'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#9b59b6'}
                    >
                        📄 Open Full Document
                    </a>
                </div>
                
                <h4 style={{ borderBottom: '2px solid #ddd', paddingBottom: '10px' }}>Reading Check Questions:</h4>
                
                {selectedItem.questions?.map((q, idx) => {
                    const isSaved = savedAnswers[idx] !== undefined;

                    return (
                        <div key={idx} style={{ backgroundColor: 'white', padding: '20px', marginBottom: '15px', borderLeft: isSaved ? '4px solid #27ae60' : '4px solid #9b59b6', borderRadius: '4px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                            <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#2c3e50' }}>{idx + 1}. {q.question}</p>
                            
                            <textarea
                                value={isSaved ? savedAnswers[idx] : (userAnswers[idx] || '')}
                                onChange={(e) => setUserAnswers({ ...userAnswers, [idx]: e.target.value })}
                                disabled={isSaved}
                                placeholder={isSaved ? "" : "Type your answer based on the reading..."}
                                style={{ 
                                    width: '100%', padding: '10px', borderRadius: '4px', marginBottom: '10px', minHeight: '60px', fontFamily: 'inherit', resize: 'vertical',
                                    border: isSaved ? '1px solid transparent' : '1px solid #bdc3c7',
                                    backgroundColor: isSaved ? '#f0f3f4' : 'white',
                                    color: isSaved ? '#7f8c8d' : 'black',
                                    boxSizing: 'border-box'
                                }}
                            />
                            
                            {!isSaved ? (
                                <button
                                    onClick={() => handleSaveAndReveal(idx)}
                                    style={{ padding: '8px 16px', backgroundColor: '#9b59b6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                                >
                                    Submit & Compare
                                </button>
                            ) : (
                                <p style={{ color: '#27ae60', margin: 0, fontWeight: 'bold', fontSize: '14px' }}>✅ Answer Submitted Permanently</p>
                            )}

                            {revealedAnswers[idx] && (
                                <div style={{ marginTop: '15px', padding: '15px', backgroundColor: '#f5eef8', borderLeft: '4px solid #8e44ad', borderRadius: '4px' }}>
                                    <p style={{ margin: '0 0 5px 0', fontWeight: 'bold', color: '#8e44ad' }}>Teacher's Expected Answer:</p>
                                    <p style={{ margin: 0, color: '#34495e', fontSize: '15px' }}>{q.answer}</p>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    }

    // ==========================================
    // RENDER: GRID VIEW
    // ==========================================
    return loading ? <p>Loading Documents...</p> : contentList.length === 0 ? (
        <div style={{ padding: '20px', backgroundColor: '#f9f9f9', textAlign: 'center', borderRadius: '4px', border: '1px dashed #ccc' }}><p style={{ color: '#7f8c8d' }}>No documents have been uploaded yet.</p></div>
    ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '15px' }}>
            {contentList.map((item, index) => {
                const progress = documentProgress[item.id] || { watchedPercentage: 0, answeredCount: 0 };
                const totalQuestions = item.questions ? item.questions.length : 0;
                
                // Document is complete if they opened it (100%) AND answered all questions
                const isOpened = progress.watchedPercentage === 100;
                const isFullyComplete = isOpened && progress.answeredCount === totalQuestions;

                return (
                    <div key={index} onClick={() => setSelectedItem(item)} style={{ border: isFullyComplete ? '2px solid #27ae60' : '1px solid #ddd', borderRadius: '8px', padding: '15px', backgroundColor: '#fff', cursor: 'pointer', transition: 'box-shadow 0.2s' }}
                         onMouseOver={(e) => e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)'}
                         onMouseOut={(e) => e.currentTarget.style.boxShadow = 'none'}>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <h4 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>{item.title}</h4>
                            <span style={{ fontSize: '24px' }}>{isFullyComplete ? '✅' : '📑'}</span>
                        </div>
                        
                        <div style={{ margin: '15px 0', fontSize: '13px', color: '#7f8c8d', backgroundColor: '#fdfefe', padding: '10px', borderRadius: '6px', border: '1px solid #ecf0f1' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', paddingBottom: '8px', borderBottom: '1px dashed #ddd' }}>
                                <strong>Document Status:</strong> 
                                <span style={{ color: isOpened ? '#27ae60' : '#e74c3c', fontWeight: 'bold' }}>
                                    {isOpened ? "Opened" : "Not Opened"}
                                </span>
                            </div>
                            
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <strong>Check Questions:</strong> 
                                <span>{progress.answeredCount} / {totalQuestions}</span>
                            </div>
                        </div>

                        <p style={{ margin: 0, fontSize: '13px', color: isFullyComplete ? '#27ae60' : '#9b59b6', fontWeight: 'bold' }}>
                            {isFullyComplete ? "Completed" : "Click to read"}
                        </p>
                    </div>
                );
            })}
        </div>
    );
};

export default StudentDocuments;