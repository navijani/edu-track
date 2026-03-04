import React, { useState } from 'react';
import axios from 'axios';

const TeacherAddDocument = ({ user }) => {
    // 1. State Management
    const [title, setTitle] = useState('');
    const [documentUrl, setDocumentUrl] = useState('');
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
        if (!title || !documentUrl) {
            setStatus('❌ Please provide a title and a valid Document URL.');
            return;
        }

        const payload = {
            teacherId: user.id,
            subject: user.subject,
            title: title,
            documentUrl: documentUrl,
            questions: questions
        };

        try {
            await axios.post('http://localhost:8080/api/contents/document', payload);
            setStatus('✅ Document and reading questions saved successfully!');
            setTitle('');
            setDocumentUrl('');
            setQuestions([{ question: '', answer: '' }]); // Reset form
        } catch (error) {
            console.error(error);
            setStatus('❌ Error saving document. Ensure Java backend is running.');
        }
    };

    return (
        <div className="content-form" style={{ marginTop: '20px' }}>
            <h4>Upload PDF / Reading Material</h4>
            
            {status && <p style={{ fontWeight: 'bold', color: status.includes('✅') ? 'green' : 'red' }}>{status}</p>}

            <input 
                type="text" 
                placeholder="Document Title (e.g., Chapter 1 Reading)" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{ width: '100%', marginBottom: '10px', padding: '8px' }} 
            />
            
            <input 
                type="text" 
                placeholder="Document Link (Google Drive, OneDrive, etc.)" 
                value={documentUrl}
                onChange={(e) => setDocumentUrl(e.target.value)}
                style={{ width: '100%', marginBottom: '15px', padding: '8px' }} 
            />

            {/* IF A LINK IS PROVIDED, SHOW A HELPFUL BUTTON TO TEST IT */}
            {documentUrl.trim() !== '' && (
                <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#e8f4f8', borderRadius: '4px', borderLeft: '4px solid #3498db' }}>
                    <p style={{ margin: '0 0 10px 0', fontSize: '14px' }}>Preview Link:</p>
                    <a href={documentUrl} target="_blank" rel="noopener noreferrer" style={{ padding: '8px 15px', backgroundColor: '#3498db', color: 'white', textDecoration: 'none', borderRadius: '4px', fontSize: '12px' }}>
                        Click here to test your document link
                    </a>
                </div>
            )}

            <div style={{ backgroundColor: '#f9f9f9', padding: '15px', marginTop: '15px', borderLeft: '4px solid #9b59b6' }}>
                <h5>Reading Comprehension Questions</h5>
                
                {questions.map((q, index) => (
                    <div key={index} style={{ marginBottom: '15px', paddingBottom: '10px', borderBottom: '1px solid #ddd' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                            <p style={{ margin: '0', fontWeight: 'bold', fontSize: '14px' }}>Question {index + 1}</p>
                            {questions.length > 1 && (
                                <button onClick={() => handleRemoveQuestion(index)} style={{ backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '2px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Remove</button>
                            )}
                        </div>
                        
                        <textarea 
                            placeholder={`Type reading question ${index + 1} here...`} 
                            rows="2" 
                            value={q.question}
                            onChange={(e) => handleQuestionChange(index, 'question', e.target.value)}
                            style={{ width: '100%', marginBottom: '5px', padding: '5px' }}
                        />
                        <input 
                            type="text" 
                            placeholder={`Correct Answer for Question ${index + 1}`} 
                            value={q.answer}
                            onChange={(e) => handleQuestionChange(index, 'answer', e.target.value)}
                            style={{ width: '100%', padding: '5px' }}
                        />
                    </div>
                ))}

                <button onClick={handleAddQuestion} style={{ padding: '6px 12px', fontSize: '12px', cursor: 'pointer', backgroundColor: '#ecf0f1', border: '1px solid #bdc3c7', borderRadius: '4px' }}>
                    + Add Another Reading Question
                </button>
            </div>

            <button 
                onClick={handleSaveDocument}
                style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', width: '100%', fontWeight: 'bold', fontSize: '16px' }}>
                Save Document to Database
            </button>
        </div>
    );
};

export default TeacherAddDocument;