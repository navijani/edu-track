import React, { useState } from 'react';
import axios from 'axios';
import '../styles/Teacher.css';

const TeacherAddQuiz = ({ user }) => {
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [deadline, setDeadline] = useState('');
  const [totalMarks, setTotalMarks] = useState('');
  const [targetClass, setTargetClass] = useState('');
  const [status, setStatus] = useState('');
  const [questions, setQuestions] = useState([
    { question: '', imageUrl: '', options: ['', ''], correctAnswer: '' }
  ]);

  const handleAddQuestion = () => {
    setQuestions([...questions, { question: '', imageUrl: '', options: ['', ''], correctAnswer: '' }]);
  };

  const handleQuestionChange = (qIndex, field, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[qIndex][field] = value;
    setQuestions(updatedQuestions);
  };

  const handleAddOption = (qIndex) => {
    const updatedQuestions = [...questions];
    updatedQuestions[qIndex].options.push('');
    setQuestions(updatedQuestions);
  };

  const handleOptionChange = (qIndex, optIndex, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[qIndex].options[optIndex] = value;
    setQuestions(updatedQuestions);
  };

  const handleRemoveOption = (qIndex, optIndex) => {
    const updatedQuestions = [...questions];
    updatedQuestions[qIndex].options.splice(optIndex, 1);
    setQuestions(updatedQuestions);
  };

  const handleSaveQuiz = async () => {
    if (!title || !duration || !scheduledDate || !deadline || !totalMarks || !targetClass) {
      setStatus('❌ Please fill all Quiz Settings including Target Class.');
      return;
    }
    const payload = {
      teacherId: user.id,
      subject: user.subject,
      title,
      duration: parseInt(duration),
      scheduledDate,
      deadline,
      totalMarks: parseInt(totalMarks),
      targetClass,
      questions
    };
    try {
      await axios.post('http://localhost:8080/api/contents/quiz', payload);
      setStatus('✅ Quiz saved successfully!');
      setTitle(''); setDuration(''); setScheduledDate(''); setDeadline(''); setTotalMarks(''); setTargetClass('');
      setQuestions([{ question: '', imageUrl: '', options: ['', ''], correctAnswer: '' }]);
    } catch (error) {
      setStatus('❌ Error saving quiz.');
    }
  };

  return (
    <div className="t-contents-wrapper animated-fade-in">
      {/* 1. Header Card */}
      <div className="t-addquiz-header-card glass-card">
        <h4>Create Interactive <span>Quiz</span></h4>
      </div>

      {status && (
        <div style={{ textAlign: 'center', marginBottom: '20px', fontWeight: 'bold', color: status.includes('✅') ? '#059669' : '#dc2626' }}>
          {status}
        </div>
      )}

      {/* 2. Settings Area */}
      <div className="t-addquiz-settings-box">
        <select 
          value={targetClass} 
          onChange={(e) => setTargetClass(e.target.value)} 
          className="t-addquiz-input" 
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
          placeholder="Quiz Title (e.g., Midterm)" 
          className="t-addquiz-input" 
          style={{ marginBottom: '15px' }}
          value={title} onChange={(e) => setTitle(e.target.value)} 
        />
        <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
          <input type="number" placeholder="Duration(Minutes)" className="t-addquiz-input" value={duration} onChange={(e) => setDuration(e.target.value)} />
          <input type="number" placeholder="Total Marks" className="t-addquiz-input" value={totalMarks} onChange={(e) => setTotalMarks(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: '15px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '15px', fontWeight: 'bold', color: '#10b981' }}>Start Date:</label>
            <input type="datetime-local" className="t-addquiz-input" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '15px', fontWeight: 'bold', color: '#10b981' }}>Deadline:</label>
            <input type="datetime-local" className="t-addquiz-input" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
          </div>
        </div>
      </div>

      {/* 3. Questions Section */}
      <div className="t-questions-accent-area" style={{ borderLeft: '5px solid #10b981', paddingLeft: '20px' }}>
        <h3 style={{ color: '#10b981', fontWeight: '800', marginBottom: '20px' }}>QUIZ QUESTIONS</h3>

        {questions.map((q, qIndex) => (
          <div key={qIndex} className="t-addquiz-question-card">
            <h5 style={{ color: '#10b981', margin: '0 0 15px 0' }}>QUESTION {qIndex + 1}</h5>
            
            <input 
              type="text" placeholder="Enter Question..." 
              className="t-addquiz-input" style={{ marginBottom: '10px' }}
              value={q.question} onChange={(e) => handleQuestionChange(qIndex, 'question', e.target.value)} 
            />

            <input
              type="text" placeholder="Optional Image URL (.jpg, .png)"
              className="t-addquiz-input" style={{ marginBottom: '10px' }}
              value={q.imageUrl} onChange={(e) => handleQuestionChange(qIndex, 'imageUrl', e.target.value)}
            />

            {q.imageUrl && (
              <div className="t-addquiz-img-preview">
                <span style={{ fontSize: '10px', color: '#64748b' }}>IMAGE PREVIEW:</span>
                <img src={q.imageUrl} alt="Preview" onError={(e) => e.target.src='https://via.placeholder.com/150?text=Invalid+Link'} />
              </div>
            )}

            <h6 style={{ margin: '20px 0 10px 0', color: '#64748b' }}>Options:</h6>
            {q.options.map((opt, optIndex) => (
              <div key={optIndex} style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
                <input type="text" placeholder={`Option ${optIndex + 1}`} className="t-addquiz-input" value={opt} onChange={(e) => handleOptionChange(qIndex, optIndex, e.target.value)} />
                {q.options.length > 2 && <button onClick={() => handleRemoveOption(qIndex, optIndex)} style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', padding: '0 10px' }}>✕</button>}
              </div>
            ))}
            <button onClick={() => handleAddOption(qIndex)} style={{ color: '#10b981', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>+ Add Option</button>

            <div className="t-addquiz-dropdown-area">
              <label style={{ fontWeight: 'bold' }}>Correct Answer:</label>
              <select className="t-addquiz-input" style={{ width: 'auto' }} value={q.correctAnswer} onChange={(e) => handleQuestionChange(qIndex, 'correctAnswer', e.target.value)}>
                <option value="">-- Choose --</option>
                {q.options.map((opt, i) => opt.trim() !== '' && <option key={i} value={opt}>{opt}</option>)}
              </select>
            </div>
          </div>
        ))}

        <button onClick={handleAddQuestion} style={{ marginTop: '20px', background: '#10b981', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '50px', cursor: 'pointer', fontWeight: 'bold' }}>+ Add New Question</button>
      </div>

      <button onClick={handleSaveQuiz} className="t-btn-save-quiz">Save Complete Quiz to Database</button>
    </div>
  );
};

export default TeacherAddQuiz;