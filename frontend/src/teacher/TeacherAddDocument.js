import React, { useState } from 'react';
import axios from 'axios';

const TeacherAddDocument = ({ user }) => {
    // 1. State Management
    const [title, setTitle] = useState('');
    const [documentUrl, setDocumentUrl] = useState('');
    const [targetClass, setTargetClass] = useState('');
    const [questions, setQuestions] = useState([{ question: '', answer: '' }]);
    const [status, setStatus] = useState('');

    // 2. Dynamic Question Handlers
    const handleAddQuestion = () => {
        setQuestions([...questions, { question: '', answer: '' }]);
    };

    const handleQuestionChange = (index, field, value) => {
        const updatedQuestions = [...questions];
        updatedQuestions[index][field] = value;
        setQuestions(updatedQuestions);
    };

    const handleRemoveQuestion = (index) => {
        const updatedQuestions = [...questions];
        updatedQuestions.splice(index, 1);
        setQuestions(updatedQuestions);
    };

    // 3. Save to Database
    const handleSaveDocument = async () => {
        if (!title || !documentUrl || !targetClass) {
            setStatus('❌ Please provide a title, a valid URL, and a Target Class.');
            return;
        }

        const payload = {
            teacherId: user.id,
            subject: user.subject,
            title: title,
            documentUrl: documentUrl,
            targetClass: targetClass,
            questions: questions
        };

        try {
            await axios.post('http://localhost:8080/api/contents/document', payload);
            setStatus('✅ Document saved successfully!');
            setTitle('');
            setDocumentUrl('');
            setTargetClass('');
            setQuestions([{ question: '', answer: '' }]); 
        } catch (error) {
            setStatus('❌ Error saving document.');
        }
    };

    return (
        <div className="t-contents-wrapper animated-fade-in">
            {/* 1. Header Card */}
            <div className="t-adddoc-header-card glass-card">
                <h4>Upload Reading <span>Material</span></h4>
            </div>
            
            {status && (
                <div style={{ textAlign: 'center', marginBottom: '20px', fontWeight: 'bold', color: status.includes('✅') ? '#7c3aed' : '#dc2626' }}>
                    {status}
                </div>
            )}

            {/* 2. Document Details Area */}
            <div className="t-adddoc-settings-box">
                <select 
                    value={targetClass} 
                    onChange={(e) => setTargetClass(e.target.value)} 
                    className="t-adddoc-input" 
                    style={{ marginBottom: '15px' }}
                    required
                >
                    <option value="">Select Target Class</option>
                    <option value="Kindergarten">Kindergarten</option>
                    {[...Array(12)].map((_, i) => (
                        <option key={`Grade ${i + 1}`} value={`Grade ${i + 1}`}>Grade {i + 1}</option>
                    ))}
                </select>

                <input 
                    type="text" 
                    placeholder="Document Title (e.g., Chapter 1 Notes)" 
                    className="t-adddoc-input"
                    style={{ marginBottom: '15px' }}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
                
                <input 
                    type="text" 
                    placeholder="Paste Document Link (Google Drive / OneDrive)" 
                    className="t-adddoc-input"
                    style={{ marginBottom: '15px' }}
                    value={documentUrl}
                    onChange={(e) => setDocumentUrl(e.target.value)}
                />

                {/* Helpful Link Test Button */}
                {documentUrl.trim() !== '' && (
                    <div className="t-adddoc-preview-box">
                        <p style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: 'bold', color: '#7c3aed' }}>🔗 Link Verification:</p>
                        <a href={documentUrl} target="_blank" rel="noopener noreferrer" className="t-btn-test-link">
                            Click to verify your document opens correctly
                        </a>
                    </div>
                )}
            </div>

            {/* 3. Questions Section with Purple Accent */}
            <div className="t-questions-accent-area" style={{ borderLeft: '5px solid #a855f7', paddingLeft: '20px' }}>
                <h5 style={{ color: '#a855f7', fontWeight: '800', marginBottom: '20px', fontSize: '1.2rem' }}>COMPREHENSION QUESTIONS</h5>
                
                {questions.map((q, index) => (
                    <div key={index} className="t-adddoc-question-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                            <h5 style={{ color: '#a855f7', margin: 0 }}>QUESTION {index + 1}</h5>
                            {questions.length > 1 && (
                                <button onClick={() => handleRemoveQuestion(index)} style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', padding: '5px 12px' }}>✕ Remove</button>
                            )}
                        </div>
                        
                        <textarea 
                            placeholder={`Type reading question ${index + 1} here...`} 
                            rows="2" 
                            className="t-adddoc-input"
                            style={{ marginBottom: '10px', fontFamily: 'inherit' }}
                            value={q.question}
                            onChange={(e) => handleQuestionChange(index, 'question', e.target.value)}
                        />
                        <input 
                            type="text" 
                            placeholder={`Expected Answer for Question ${index + 1}`} 
                            className="t-adddoc-input"
                            value={q.answer}
                            onChange={(e) => handleQuestionChange(index, 'answer', e.target.value)}
                        />
                    </div>
                ))}

                <button 
                    onClick={handleAddQuestion} 
                    style={{ marginTop: '20px', background: '#ecf0f1', color: '#7c3aed', padding: '10px 20px', border: '1px solid #ddd6fe', borderRadius: '50px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                    + Add Another Reading Question
                </button>
            </div>

            <button onClick={handleSaveDocument} className="t-btn-save-doc">
                Save Document to Database
            </button>
        </div>
    );
};

export default TeacherAddDocument;