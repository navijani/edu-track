import React, { useState, useEffect } from 'react';
import axios from 'axios';

const StudentDocuments = ({ subjectName, user }) => {
    const [contentList, setContentList] = useState([]);
    const [documentProgress, setDocumentProgress] = useState({}); 
    const [loading, setLoading] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    const [userAnswers, setUserAnswers] = useState({});
    const [savedAnswers, setSavedAnswers] = useState({}); 
    const [revealedAnswers, setRevealedAnswers] = useState({});
    const [hasOpened, setHasOpened] = useState(false);

    useEffect(() => {
        fetchDocuments();
        if (user) fetchAllProgress();
    }, [subjectName]);

    useEffect(() => {
        setUserAnswers({});
        setRevealedAnswers({});
        setSavedAnswers({});
        setHasOpened(false);
        if (selectedItem && user) fetchSavedAnswers();
    }, [selectedItem]);

    const fetchDocuments = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`http://localhost:8080/api/contents/document?subject=${encodeURIComponent(subjectName)}`);
            setContentList(response.data);
        } catch (error) { setContentList([]); }
        setLoading(false);
    };

    const fetchAllProgress = async () => {
        try {
            const response = await axios.get(`http://localhost:8080/api/progress/document?studentId=${user.id}`);
            setDocumentProgress(response.data); 
        } catch (error) {}
    };

    const fetchSavedAnswers = async () => {
        try {
            const response = await axios.get(`http://localhost:8080/api/answers/document?studentId=${user.id}&documentId=${selectedItem.id}`);
            setSavedAnswers(response.data);
            const alreadyRevealed = {};
            Object.keys(response.data).forEach(key => { alreadyRevealed[key] = true; });
            setRevealedAnswers(alreadyRevealed);
        } catch (error) {}
    };

    const handleSaveAndReveal = async (idx) => {
        const answerText = userAnswers[idx];
        if (!answerText?.trim()) return alert("Please type an answer first!");
        if (!window.confirm("Submit answer permanently?")) return;

        try {
            await axios.post('http://localhost:8080/api/answers/document', {
                studentId: user.id,
                documentId: selectedItem.id,
                questionIndex: idx,
                answer: answerText
            });
            setSavedAnswers(prev => ({ ...prev, [idx]: answerText }));
            setRevealedAnswers(prev => ({ ...prev, [idx]: true }));
        } catch (error) { alert("Error saving answer."); }
    };

    const handleCloseDocument = async () => {
        const answeredCount = Object.keys(savedAnswers).length;
        const isOpened = hasOpened || (documentProgress[selectedItem.id]?.watchedPercentage === 100);
        const percentage = isOpened ? 100 : 0; 
        
        setDocumentProgress(prev => ({
            ...prev,
            [selectedItem.id]: { watchedPercentage: percentage, answeredCount }
        }));

        try {
            await axios.post('http://localhost:8080/api/progress/document', {
                studentId: user.id,
                documentId: selectedItem.id,
                watchedPercentage: percentage,
                answeredCount,
                lastAccessed: new Date().toISOString()
            });
        } catch (error) {}
        setSelectedItem(null);
    };

    if (selectedItem) {
        return (
            <div className="s-doc-viewer-container animated-fade-in">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
                    <h2 style={{ margin: 0, color: '#1e293b' }}>{selectedItem.title}</h2>
                    <button onClick={handleCloseDocument} className="s-btn-logout" style={{ width: 'auto', padding: '10px 20px' }}>
                        Finish & Close
                    </button>
                </div>
                
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <a href={selectedItem.documentUrl} target="_blank" rel="noopener noreferrer" onClick={() => setHasOpened(true)} className="s-doc-link-button">
                        📄 Read Assigned Material
                    </a>
                    <p style={{ color: '#64748b', fontSize: '13px', marginTop: '10px' }}>Opens in a new browser tab</p>
                </div>
                
                <h3 className="t-section-header" style={{ color: '#9b59b6' }}>Reading Comprehension</h3>
                
                {selectedItem.questions?.map((q, idx) => {
                    const isSaved = savedAnswers[idx] !== undefined;
                    return (
                        <div key={idx} className={`s-doc-q-box ${isSaved ? 'saved' : ''}`}>
                            <p style={{ fontWeight: '700', color: '#1e293b', marginBottom: '15px' }}>{idx + 1}. {q.question}</p>
                            <textarea
                                value={isSaved ? savedAnswers[idx] : (userAnswers[idx] || '')}
                                onChange={(e) => setUserAnswers({ ...userAnswers, [idx]: e.target.value })}
                                disabled={isSaved}
                                className="t-adddoc-input"
                                placeholder="Reflect on the reading here..."
                                style={{ minHeight: '80px', marginBottom: '15px' }}
                            />
                            {!isSaved ? (
                                <button onClick={() => handleSaveAndReveal(idx)} className="t-addquiz-btn-add" style={{ background: '#9b59b6' }}>
                                    Submit & Reveal
                                </button>
                            ) : (
                                <span style={{ color: '#10b981', fontWeight: '800', fontSize: '14px' }}>✅ Answer Logged</span>
                            )}

                            {revealedAnswers[idx] && (
                                <div className="s-doc-teacher-ans">
                                    <strong style={{ color: '#8e44ad', display: 'block', marginBottom: '5px' }}>Teacher's Notes:</strong>
                                    {q.answer}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    }

    return loading ? <p className="t-empty-state">Loading Library...</p> : (
        <div className="s-doc-grid">
            {contentList.map((item, index) => {
                const progress = documentProgress[item.id] || { watchedPercentage: 0, answeredCount: 0 };
                const totalQ = item.questions?.length || 0;
                const isOpened = progress.watchedPercentage === 100;
                const isDone = isOpened && progress.answeredCount === totalQ;

                return (
                    <div key={index} onClick={() => setSelectedItem(item)} className={`s-doc-card ${isDone ? 'completed' : ''}`}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <h4 style={{ margin: 0, color: '#1e293b' }}>{item.title}</h4>
                            <span style={{ fontSize: '20px' }}>{isDone ? '✅' : '📖'}</span>
                        </div>
                        
                        <div className="s-doc-dropdown-area" style={{ marginTop: '15px', padding: '10px', fontSize: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                <span>Status:</span>
                                <span style={{ fontWeight: 'bold', color: isOpened ? '#3498db' : '#f59e0b' }}>
                                    {isOpened ? "Read" : "Unread"}
                                </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Check Questions:</span>
                                <strong>{progress.answeredCount} / {totalQ}</strong>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default StudentDocuments;