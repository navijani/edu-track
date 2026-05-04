import React, { useState, useEffect } from 'react';
import axios from 'axios';
import QuizRanklist from '../components/QuizRanklist';

const StudentQuizzes = ({ subjectName, user }) => {
    const [contentList, setContentList] = useState([]);
    const [submissions, setSubmissions] = useState({}); 
    const [loading, setLoading] = useState(false);
    const [viewMode, setViewMode] = useState('list');
    const [selectedItem, setSelectedItem] = useState(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(0);

    useEffect(() => {
        fetchQuizzes();
        if (user) fetchSubmissions();
    }, [subjectName]);

    useEffect(() => {
        if (viewMode === 'take' && selectedItem && timeLeft > 0) {
            const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
            return () => clearInterval(timer);
        } else if (timeLeft === 0 && viewMode === 'take' && selectedItem) {
            handleSubmitQuiz();
        }
    }, [timeLeft, selectedItem, viewMode]);

    const fetchQuizzes = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`http://localhost:8080/api/contents/quiz?subject=${encodeURIComponent(subjectName)}&targetClass=${encodeURIComponent(user.studentClass)}`);
            setContentList(response.data);
        } catch (error) { setContentList([]); }
        setLoading(false);
    };

    const fetchSubmissions = async () => {
        try {
            const response = await axios.get(`http://localhost:8080/api/answers/quiz?studentId=${user.id}`);
            setSubmissions(response.data); 
        } catch (error) {}
    };

    const handleQuizClick = (quiz) => {
        const now = new Date();
        const scheduledTime = quiz.scheduledDate ? new Date(quiz.scheduledDate.replace(' ', 'T')) : null;
        const deadlineTime = quiz.deadline ? new Date(quiz.deadline.replace(' ', 'T')) : null;
        const hasSubmitted = submissions[quiz.id] !== undefined;

        if (scheduledTime && now < scheduledTime) return alert(`Opens on: ${scheduledTime.toLocaleString()}`);
        if (hasSubmitted) {
            setSelectedItem(quiz);
            if (deadlineTime && now > deadlineTime) {
                setViewMode('review');
            } else {
                setViewMode('submitted');
            }
            return;
        }
        if (deadlineTime && now > deadlineTime) return alert("Deadline passed.");

        if (!window.confirm(`Start quiz? You have ${quiz.duration} minutes.`)) return;

        setSelectedItem(quiz);
        setCurrentQuestionIndex(0);
        setUserAnswers({});
        setTimeLeft(quiz.duration * 60); 
        setViewMode('take');
    };

    const handleSubmitQuiz = async () => {
        let correctCount = 0;
        selectedItem.questions.forEach((q, idx) => {
            if (userAnswers[idx] === q.correctAnswer) correctCount++;
        });
        
        const score = Math.round((correctCount / selectedItem.questions.length) * selectedItem.marks);
        try {
            await axios.post('http://localhost:8080/api/answers/quiz', {
                studentId: user.id, quizId: selectedItem.id,
                answersJson: JSON.stringify(userAnswers), score: score, attendTime: new Date().toISOString()
            });
            await fetchSubmissions();
            setViewMode('submitted');
        } catch (error) { alert("Submission failed."); }
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    // --- VIEW: RANKLIST ---
    if (viewMode === 'ranklist' && selectedItem) {
        return (
            <QuizRanklist
                quizId={selectedItem.id}
                quizTitle={selectedItem.title}
                totalMarks={selectedItem.marks}
                currentUserId={user.id}
                onClose={() => setViewMode('list')}
            />
        );
    }

    // --- VIEW: SUBMISSION SUCCESS (Score Only) ---
    if (viewMode === 'submitted' && selectedItem) {
        const mySub = submissions[selectedItem.id];
        return (
            <div className="s-quiz-take-container">
                <button onClick={() => setViewMode('list')} className="s-btn-back" style={{ background: '#94a3b8', width: 'auto', marginBottom: '20px' }}>
                    ⬅ Back to List
                </button>
                <div className="s-quiz-review-header" style={{ background: 'linear-gradient(135deg, #34d399 0%, #10b981 100%)' }}>
                    <div>
                        <h2 style={{ margin: 0 }}>Quiz Submitted!</h2>
                        <p style={{ opacity: 0.8 }}>{selectedItem.title}</p>
                    </div>
                    <div className="s-quiz-score-circle">
                        <h2 style={{ margin: 0 }}>{mySub?.score || 0}</h2>
                        <span style={{ fontSize: '10px' }}>/{selectedItem.marks} Marks</span>
                    </div>
                </div>
                <div className="s-video-q-box" style={{ textAlign: 'center', padding: '40px' }}>
                    <div style={{ fontSize: '50px', marginBottom: '20px' }}>🎉</div>
                    <h3>Great Job!</h3>
                    <p>Your answers have been recorded. You can review the correct answers once the deadline has passed.</p>
                    <div style={{ marginTop: '20px', fontSize: '14px', color: '#64748b' }}>
                        <strong>Deadline:</strong> {selectedItem.deadline || "N/A"}
                    </div>
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '30px' }}>
                        <button onClick={() => setViewMode('list')} className="s-pill-btn active-quizzes">
                            Return to Dashboard
                        </button>
                        <button onClick={() => setViewMode('ranklist')} className="s-pill-btn" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: 'white' }}>
                            🏆 View Ranklist
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // --- VIEW: REVIEW RESULTS ---
    if (viewMode === 'review' && selectedItem) {
        const mySub = submissions[selectedItem.id];
        const parsedAnswers = JSON.parse(mySub.answers || "{}");
        return (
            <div className="s-quiz-take-container">
                <button onClick={() => setViewMode('list')} className="s-btn-back" style={{ background: '#94a3b8', width: 'auto', marginBottom: '20px' }}>
                    ⬅ Back to List
                </button>
                <div className="s-quiz-review-header">
                    <div>
                        <h2 style={{ margin: 0 }}>{selectedItem.title}</h2>
                        <p style={{ opacity: 0.8 }}>Performance Review</p>
                    </div>
                    <div className="s-quiz-score-circle">
                        <h2 style={{ margin: 0 }}>{mySub.score}</h2>
                        <span style={{ fontSize: '10px' }}>Total Marks</span>
                    </div>
                </div>
                {selectedItem.questions.map((q, idx) => {
                    const isCorrect = parsedAnswers[idx] === q.correctAnswer;
                    return (
                        <div key={idx} className={`s-video-q-box ${isCorrect ? 'saved' : ''}`} style={{ borderLeftColor: isCorrect ? '#10b981' : '#ef4444' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <strong>{idx + 1}. {q.question}</strong>
                                <span>{isCorrect ? '✅' : '❌'}</span>
                            </div>
                            <div style={{ marginTop: '10px', fontSize: '14px' }}>
                                <div style={{ color: isCorrect ? '#059669' : '#b91c1c' }}>Your Answer: {parsedAnswers[idx] || "None"}</div>
                                {!isCorrect && <div style={{ color: '#3498db' }}>Correct: {q.correctAnswer}</div>}
                            </div>
                        </div>
                    );
                })}
                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                    <button onClick={() => setViewMode('ranklist')} className="s-pill-btn" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: 'white', margin: '0 auto' }}>
                        🏆 View Class Ranklist
                    </button>
                </div>
            </div>
        );
    }

    // --- VIEW: TAKE QUIZ ---
    if (viewMode === 'take' && selectedItem) {
        const currentQ = selectedItem.questions[currentQuestionIndex];
        return (
            <div className="s-quiz-take-container animated-fade-in">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <h3 style={{ margin: 0 }}>{selectedItem.title}</h3>
                    <div className={`s-quiz-timer-pill ${timeLeft < 60 ? 'urgent' : ''}`}>
                        ⏱ {formatTime(timeLeft)}
                    </div>
                </div>
                <div className="s-video-q-box" style={{ minHeight: '300px' }}>
                    <h4 style={{ marginBottom: '20px' }}>{currentQ.question}</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {currentQ.options?.map((opt, oIdx) => (
                            <label key={oIdx} className={`t-addquiz-option-row ${userAnswers[currentQuestionIndex] === opt ? 'selected' : ''}`} style={{ padding: '15px', borderRadius: '12px', border: '1px solid #e2e8f0', cursor: 'pointer', display: 'flex', gap: '10px', background: userAnswers[currentQuestionIndex] === opt ? '#f0f9ff' : 'white' }}>
                                <input type="radio" checked={userAnswers[currentQuestionIndex] === opt} onChange={() => setUserAnswers({ ...userAnswers, [currentQuestionIndex]: opt })} />
                                {opt}
                            </label>
                        ))}
                    </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <button onClick={() => setCurrentQuestionIndex(prev => prev - 1)} disabled={currentQuestionIndex === 0} className="s-pill-btn">Previous</button>
                    {currentQuestionIndex < selectedItem.questions.length - 1 ? (
                        <button onClick={() => setCurrentQuestionIndex(prev => prev + 1)} className="s-pill-btn active-videos">Next Question</button>
                    ) : (
                        <button onClick={handleSubmitQuiz} className="s-pill-btn active-quizzes">Finish & Submit</button>
                    )}
                </div>
            </div>
        );
    }

    return loading ? <p className="t-empty-state">Loading Exams...</p> : (
        <div className="s-quiz-grid">
            {contentList.map((item, index) => {
                const now = new Date();
                const isTooEarly = item.scheduledDate && now < new Date(item.scheduledDate.replace(' ', 'T'));
                const isTooLate = item.deadline && now > new Date(item.deadline.replace(' ', 'T'));
                const hasSub = submissions[item.id] !== undefined;
                
                return (
                    <div 
        key={index} 
        onClick={() => handleQuizClick(item)} 
        className={`s-quiz-card ${isTooLate && !hasSub ? 'missed' : ''}`} // Added conditional class
        style={{ 
            opacity: isTooEarly ? 0.6 : 1, // Missed cards usually don't need low opacity if they have a 'Missed' label
        }}
    >
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <h4 style={{ margin: 0 }}>{item.title}</h4>
            <span style={{ fontSize: '20px' }}>{hasSub ? '✅' : isTooEarly ? '🔒' : '📝'}</span>
        </div>

        {/* This is that light grey/green box from your screenshot */}
        <div className="t-addquiz-dropdown-area" style={{ marginTop: '15px', background: '#f8fafc' }}>
            <div style={{ fontSize: '11px', color: '#64748b' }}>
                <div><strong>Opens:</strong> {item.scheduledDate || "N/A"}</div>
                <div style={{ marginTop: '5px' }}><strong>Closes:</strong> {item.deadline || "N/A"}</div>
            </div>
        </div>

        <p style={{ margin: '15px 0 0 0', fontSize: '12px', fontWeight: '800', color: hasSub ? '#3498db' : isTooLate ? '#ef4444' : '#10b981' }}>
            {hasSub ? `SCORE: ${submissions[item.id]?.score || 0} / ${item.marks}` : isTooLate ? "MISSED" : "START QUIZ →"}
        </p>
    </div>
                );
            })}
        </div>
    );
};

export default StudentQuizzes;