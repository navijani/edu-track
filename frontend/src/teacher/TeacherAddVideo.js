import React, { useState } from 'react';
import axios from 'axios';

const TeacherAddVideo = ({ user }) => {
    // 1. State Management
    const [title, setTitle] = useState('');
    const [videoUrl, setVideoUrl] = useState('');
    // Array of question objects so the teacher can add as many as they want
    const [questions, setQuestions] = useState([{ question: '', answer: '' }]);
    const [status, setStatus] = useState('');

    // 2. Helper to extract YouTube ID for the live preview
    const getYouTubeEmbedUrl = (url) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
    };

    const embedUrl = getYouTubeEmbedUrl(videoUrl);

    // 3. Dynamic Question Handlers
    const handleAddQuestion = () => {
        setQuestions([...questions, { question: '', answer: '' }]);
    };

    const handleQuestionChange = (index, field, value) => {
        const updatedQuestions = [...questions];
        updatedQuestions[index][field] = value;
        setQuestions(updatedQuestions);
    };

    // 4. Save to Database
    const handleSaveVideo = async () => {
        if (!title || !videoUrl) {
            setStatus('Please provide a title and a valid video URL.');
            return;
        }

        const payload = {
            teacherId: user.id,
            subject: user.subject,
            title: title,
            videoUrl: videoUrl,
            questions: questions // Sends the whole array of Q&As
        };

        try {
            // We will need to build this Java endpoint next!
            await axios.post('http://localhost:8080/api/contents/video', payload);
            setStatus('✅ Video and questions saved successfully!');
            setTitle('');
            setVideoUrl('');
            setQuestions([{ question: '', answer: '' }]); // Reset form
        } catch (error) {
            console.error(error);
            setStatus('❌ Error saving to database. Ensure backend is running.');
        }
    };

    return (
        <div className="content-form" style={{ marginTop: '20px' }}>
            <div className="t-addvideo-header glass-card">
                <h4>Upload Video <span>Lesson</span></h4>
            </div>
            
            {status && <p style={{ fontWeight: 'bold', color: status.includes('✅') ? 'green' : 'red' }}>{status}</p>}

            {/* Lesson Title Input */}
            <input 
                type="text" 
                placeholder="Lesson Title (e.g., Real numbers)" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="t-addvideo-input" 
/>
                
            {/* Video URL Input */}
            <input 
                type="text" 
                placeholder="Paste YouTube Video URL here" 
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="t-addvideo-input"
            />

            {/* LIVE VIDEO PREVIEW */}
            {embedUrl && (
                <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                    <p style={{ fontSize: '12px', color: 'gray' }}>Video Preview:</p>
                    <iframe 
                        width="100%" 
                        height="315" 
                        src={embedUrl} 
                        title="YouTube video player" 
                        frameBorder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowFullScreen>
                    </iframe>
                </div>
            )}

            <div className="t-question-section-wrapper">
                <h5 className="t-question-header">Associated Questions & Answers</h5>
                
                {/* Dynamically render all questions */}
                {questions.map((q, index) => (
                    <div className="t-questions-accent-area">
                    <div key={index} className="t-addquestion-box light-glass">
                        <p className="t-q-label">Question {index + 1}</p>
                        <textarea 
                            placeholder={`Type question ${index + 1} here...`} 
                            rows="2" 
                            value={q.question}
                            onChange={(e) => handleQuestionChange(index, 'question', e.target.value)}
                            className="t-addvideo-qarea"
                        />
                        <input 
                            type="text" 
                            placeholder={`Correct Answer for Question ${index + 1}`} 
                            value={q.answer}
                            onChange={(e) => handleQuestionChange(index, 'answer', e.target.value)}
                            className="t-addvideo-inputquestion"
                        />
                    </div>
                    </div>
                ))}

                <button onClick={handleAddQuestion} className="t-btn-addvideo-q">
                    + Add Another Question
                </button>
            </div>

            <button 
                onClick={handleSaveVideo}
                className="t-savevideo-btn">
                Save Video Lesson
            </button>
        </div>
    );
};

export default TeacherAddVideo;