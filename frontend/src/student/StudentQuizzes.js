import React, { useState, useEffect } from 'react';
import axios from 'axios';

const StudentQuizzes = ({ subjectName, user }) => {
    const [contentList, setContentList] = useState([]);
    const [submissions, setSubmissions] = useState({}); 
    const [loading, setLoading] = useState(false);
    
    // View States: 'list', 'take', 'review', 'submitted'
    const [viewMode, setViewMode] = useState('list');
    const [selectedItem, setSelectedItem] = useState(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(0);

    useEffect(() => {
        fetchQuizzes();
        if (user) fetchSubmissions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [subjectName]);

    // Timer Logic for active quiz
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
            const response = await axios.get(`http://localhost:8080/api/contents/quiz?subject=${encodeURIComponent(subjectName)}`);
            setContentList(response.data);
        } catch (error) {
            console.error("Error fetching quizzes:", error);
            setContentList([]);
        }
        setLoading(false);
    };

    const fetchSubmissions = async () => {
        try {
            const response = await axios.get(`http://localhost:8080/api/answers/quiz?studentId=${user.id}`);
            setSubmissions(response.data); 
        } catch (error) {
            console.error("Error fetching submissions:", error);
        }
    };

    // --- Quiz Access Logic ---
    const handleQuizClick = (quiz) => {
        const now = new Date();
        const safeStartDateStr = quiz.scheduledDate ? quiz.scheduledDate.replace(' ', 'T') : null;
        const safeDeadlineStr = quiz.deadline ? quiz.deadline.replace(' ', 'T') : null;
        
        const scheduledTime = safeStartDateStr ? new Date(safeStartDateStr) : null;
        const deadlineTime = safeDeadlineStr ? new Date(safeDeadlineStr) : null;

        const isTooEarly = scheduledTime && now < scheduledTime;
        const isTooLate = deadlineTime && now > deadlineTime;
        const hasSubmitted = submissions[quiz.id] !== undefined;

        if (isTooEarly) {
            alert(`This quiz opens on: ${scheduledTime.toLocaleString()}`);
            return;
        }

        if (hasSubmitted) {
            if (isTooLate) {
                // Unlocked for review!
                setSelectedItem(quiz);
                setViewMode('review');
            } else {
                alert(`You have already submitted this quiz! You can review your answers and marks after the deadline: ${deadlineTime ? deadlineTime.toLocaleString() : 'Teacher closes the quiz'}`);
            }
            return;
        }

        if (isTooLate && !hasSubmitted) {
            alert(`Sorry, this quiz has closed! You missed the deadline on: ${deadlineTime.toLocaleString()}`);
            return;
        }

        if (!window.confirm(`Ready to start? You will have ${quiz.duration} minutes. Do not refresh the page!`)) return;

        setSelectedItem(quiz);
        setCurrentQuestionIndex(0);
        setUserAnswers({});
        setTimeLeft(quiz.duration * 60); 
        setViewMode('take');
    };

    const handleOptionSelect = (option) => {
        setUserAnswers({ ...userAnswers, [currentQuestionIndex]: option });
    };

    const handleSubmitQuiz = async () => {
        let correctCount = 0;
        selectedItem.questions.forEach((q, idx) => {
            if (userAnswers[idx] === q.correctAnswer) correctCount++;
        });
        
        const score = Math.round((correctCount / selectedItem.questions.length) * selectedItem.marks);
        const nowStr = new Date().toISOString().slice(0, 19).replace('T', ' ');

        const payload = {
            studentId: user.id,
            quizId: selectedItem.id,
            answersJson: JSON.stringify(userAnswers),
            score: score,
            attendTime: nowStr
        };

        try {
            await axios.post('http://localhost:8080/api/answers/quiz', payload);
            setSubmissions({
                ...submissions,
                [selectedItem.id]: { score: score, answers: JSON.stringify(userAnswers), attendTime: nowStr }
            });
            setViewMode('submitted');

        } catch (error) {
            console.error("Error submitting quiz:", error);
            alert("Failed to submit. Check backend connection.");
        }
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    // ==========================================
    // RENDER: REVIEW MODE (After Deadline)
    // ==========================================
    if (viewMode === 'review' && selectedItem) {
        const mySub = submissions[selectedItem.id];
        const parsedAnswers = JSON.parse(mySub.answers || "{}");

        return (
            <div style={{ padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px', border: '1px solid #ddd' }}>
                <button onClick={() => setViewMode('list')} style={{ marginBottom: '20px', padding: '6px 12px', backgroundColor: '#bdc3c7', color: '#2c3e50', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                    ⬅ Back to Quizzes
                </button>
                
                <div style={{ backgroundColor: '#2c3e50', color: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2 style={{ margin: '0 0 5px 0', color: '#3498db' }}>{selectedItem.title} - Results</h2>
                        <p style={{ margin: 0, fontSize: '14px', color: '#bdc3c7' }}>Attended: {new Date(mySub.attendTime.replace(' ', 'T')).toLocaleString()}</p>
                    </div>
                    <div style={{ textAlign: 'center', backgroundColor: '#3498db', padding: '15px 25px', borderRadius: '8px' }}>
                        <h1 style={{ margin: 0 }}>{mySub.score} <span style={{ fontSize: '18px', color: '#ecf0f1' }}>/ {selectedItem.marks}</span></h1>
                        <p style={{ margin: 0, fontSize: '12px', fontWeight: 'bold' }}>Total Marks</p>
                    </div>
                </div>

                {selectedItem.questions.map((q, idx) => {
                    const studentAns = parsedAnswers[idx];
                    const isCorrect = studentAns === q.correctAnswer;

                    return (
                        <div key={idx} style={{ backgroundColor: 'white', padding: '20px', marginBottom: '15px', borderLeft: isCorrect ? '5px solid #27ae60' : '5px solid #e74c3c', borderRadius: '4px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#2c3e50', fontSize: '16px' }}>{idx + 1}. {q.question}</p>
                                <span style={{ fontSize: '20px' }}>{isCorrect ? '✅' : '❌'}</span>
                            </div>
                            
                            {q.imageUrl && <img src={q.imageUrl} alt="Context" style={{ maxHeight: '150px', marginBottom: '15px', borderRadius: '4px' }} />}
                            
                            <div style={{ paddingLeft: '20px' }}>
                                <p style={{ margin: '0 0 5px 0', color: isCorrect ? '#27ae60' : '#e74c3c', fontWeight: 'bold' }}>
                                    Your Answer: {studentAns || "No answer selected"}
                                </p>
                                {!isCorrect && (
                                    <p style={{ margin: 0, color: '#3498db', fontWeight: 'bold' }}>
                                        Correct Answer: {q.correctAnswer}
                                    </p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    }

    // ==========================================
    // RENDER: SUBMITTED SUCCESS SCREEN
    // ==========================================
    if (viewMode === 'submitted') {
        return (
            <div style={{ padding: '40px 30px', backgroundColor: '#f9f9f9', borderRadius: '8px', border: '1px solid #ddd', textAlign: 'center' }}>
                <h2 style={{ color: '#27ae60', fontSize: '32px', margin: '0 0 10px 0' }}>🏁 Quiz Submitted!</h2>
                <p style={{ fontSize: '18px', color: '#34495e', marginBottom: '20px' }}>Your answers have been permanently saved.</p>
                <div style={{ backgroundColor: '#ebf5fb', padding: '20px', borderRadius: '8px', display: 'inline-block', marginBottom: '30px', border: '1px solid #3498db' }}>
                    <p style={{ margin: 0, color: '#2980b9', fontWeight: 'bold' }}>🔒 Grades and reviews are locked until the deadline.</p>
                </div>
                <br/>
                <button onClick={() => setViewMode('list')} style={{ padding: '10px 20px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}>
                    Return to Quizzes
                </button>
            </div>
        );
    }

    // ==========================================
    // RENDER: TAKE QUIZ
    // ==========================================
    if (viewMode === 'take' && selectedItem) {
        const currentQ = selectedItem.questions[currentQuestionIndex];

        return (
            <div style={{ padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px', border: '1px solid #ddd' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '15px', borderBottom: '2px solid #eee' }}>
                    <h3 style={{ margin: 0, color: '#34495e' }}>{selectedItem.title}</h3>
                    <div style={{ padding: '10px 20px', backgroundColor: timeLeft < 60 ? '#fdedec' : '#eaf2f8', color: timeLeft < 60 ? '#c0392b' : '#2980b9', borderRadius: '30px', fontWeight: 'bold', fontSize: '18px' }}>
                        ⏱ Time Left: {formatTime(timeLeft)}
                    </div>
                </div>

                <p style={{ margin: '0 0 15px 0', color: '#7f8c8d', fontWeight: 'bold' }}>Question {currentQuestionIndex + 1} of {selectedItem.questions.length}</p>

                <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', minHeight: '300px' }}>
                    <h4 style={{ fontSize: '18px', marginTop: 0 }}>{currentQ.question}</h4>
                    {currentQ.imageUrl && <img src={currentQ.imageUrl} alt="Context" style={{ maxHeight: '200px', marginBottom: '20px', borderRadius: '4px' }} />}
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
                        {currentQ.options?.map((opt, oIdx) => (
                            <label key={oIdx} style={{ 
                                padding: '15px', border: userAnswers[currentQuestionIndex] === opt ? '2px solid #3498db' : '1px solid #ddd', borderRadius: '8px', 
                                cursor: 'pointer', backgroundColor: userAnswers[currentQuestionIndex] === opt ? '#ebf5fb' : 'white', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '10px'
                            }}>
                                <input type="radio" name={`question-${currentQuestionIndex}`} value={opt} checked={userAnswers[currentQuestionIndex] === opt} onChange={() => handleOptionSelect(opt)} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
                                <span style={{ fontSize: '16px', color: '#2c3e50' }}>{opt}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '25px' }}>
                    <button onClick={() => setCurrentQuestionIndex(prev => prev - 1)} disabled={currentQuestionIndex === 0} style={{ padding: '10px 20px', backgroundColor: currentQuestionIndex === 0 ? '#ecf0f1' : '#bdc3c7', color: currentQuestionIndex === 0 ? '#bdc3c7' : '#2c3e50', border: 'none', borderRadius: '4px', cursor: currentQuestionIndex === 0 ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}>
                        ⬅ Previous
                    </button>
                    {currentQuestionIndex < selectedItem.questions.length - 1 ? (
                        <button onClick={() => setCurrentQuestionIndex(prev => prev + 1)} style={{ padding: '10px 20px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                            Next ➡
                        </button>
                    ) : (
                        <button onClick={handleSubmitQuiz} style={{ padding: '10px 25px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}>
                            Submit Final Answers
                        </button>
                    )}
                </div>
            </div>
        );
    }

    // ==========================================
    // RENDER: GRID VIEW
    // ==========================================
    return loading ? <p>Loading Quizzes...</p> : contentList.length === 0 ? (
        <div style={{ padding: '20px', backgroundColor: '#f9f9f9', textAlign: 'center', borderRadius: '4px', border: '1px dashed #ccc' }}>
            <p style={{ color: '#7f8c8d' }}>No quizzes have been scheduled yet.</p>
        </div>
    ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '15px' }}>
            {contentList.map((item, index) => {
                const now = new Date();
                const isTooEarly = item.scheduledDate && now < new Date(item.scheduledDate.replace(' ', 'T'));
                const isTooLate = item.deadline && now > new Date(item.deadline.replace(' ', 'T'));
                const hasSubmitted = submissions[item.id] !== undefined;
                
                let statusText = "Click to Start Quiz";
                let statusColor = "#27ae60";
                let icon = "📋";
                let opacity = 1;

                if (isTooEarly) {
                    statusText = "Not yet open"; statusColor = "#f39c12"; icon = "🔒"; opacity = 0.7;
                } else if (hasSubmitted) {
                    if (isTooLate) {
                        statusText = "View Results & Marks"; statusColor = "#3498db"; icon = "📈";
                    } else {
                        statusText = "Submitted (Waiting for deadline)"; statusColor = "#9b59b6"; icon = "✅"; opacity = 0.8;
                    }
                } else if (isTooLate) {
                    statusText = "Missed Deadline"; statusColor = "#e74c3c"; icon = "⌛"; opacity = 0.6;
                }
                
                return (
                    <div key={index} onClick={() => handleQuizClick(item)} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '15px', backgroundColor: '#fff', cursor: 'pointer', opacity: opacity, transition: 'box-shadow 0.2s' }} onMouseOver={(e) => e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)'} onMouseOut={(e) => e.currentTarget.style.boxShadow = 'none'}>
                        <h4 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>{item.title}</h4>
                        <span style={{ fontSize: '24px' }}>{icon}</span>
                        
                        {/* --- NEW: Clear Schedule Display --- */}
                        <div style={{ margin: '15px 0', fontSize: '13px', color: '#7f8c8d', backgroundColor: '#fdfefe', padding: '10px', borderRadius: '6px', border: '1px solid #ecf0f1' }}>
                            <div style={{ marginBottom: '5px' }}>
                                <strong>🟢 Opens:</strong> {item.scheduledDate ? new Date(item.scheduledDate.replace(' ', 'T')).toLocaleString() : "Available Now"}
                            </div>
                            <div>
                                <strong>🔴 Closes:</strong> {item.deadline ? new Date(item.deadline.replace(' ', 'T')).toLocaleString() : "No Deadline"}
                            </div>
                        </div>
                        
                        <p style={{ margin: 0, fontSize: '13px', color: statusColor, fontWeight: 'bold' }}>{statusText}</p>
                    </div>
                );
            })}
        </div>
    );
};

export default StudentQuizzes;