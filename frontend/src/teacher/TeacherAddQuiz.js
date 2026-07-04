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

    const startDate = new Date(scheduledDate);
    const endDate = new Date(deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today

    if (startDate < today) {
      setStatus('❌ Start Date cannot be in the past.');
      return;
    }

    if (endDate <= startDate) {
      setStatus('❌ Deadline must be after the Start Date.');
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
      await axios.post('https://edu-track-c6ml.onrender.com/api/contents/quiz', payload);
      setStatus('✅ Quiz saved successfully!');
      setTitle(''); setDuration(''); setScheduledDate(''); setDeadline(''); setTotalMarks(''); setTargetClass('');
      setQuestions([{ question: '', imageUrl: '', options: ['', ''], correctAnswer: '' }]);
    } catch (error) {
      setStatus('❌ Error saving quiz.');
    }
  };

  return (
    <div className="t-contents-wrapper animated-fade-in" style={{ paddingBottom: '100px' }}>
      {/* 1. Header Card */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div className="t-addquiz-header-card">
          <h4>✨ Create Interactive <span>Quiz</span></h4>
        </div>
      </div>

      {status && (
        <div style={{ textAlign: 'center', marginBottom: '25px', fontWeight: 'bold', fontSize: '1.1rem', color: status.includes('✅') ? '#059669' : '#dc2626', animation: 'slideUpFade 0.3s ease' }}>
          {status}
        </div>
      )}

      {/* 2. Settings Area (Grid Layout) */}
      <div className="t-addquiz-settings-box">
        <div className="t-addquiz-settings-grid">
          <div className="t-input-group">
            <label className="t-input-label">📝 Quiz Title</label>
            <input type="text" placeholder="e.g., Final Term Exam" className="t-addquiz-input" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div className="t-input-group">
            <label className="t-input-label">🎯 Target Class</label>
            <select value={targetClass} onChange={(e) => setTargetClass(e.target.value)} className="t-addquiz-input" required>
              <option value="">Select Target Class</option>
              <option value="Kindergarten">Kindergarten</option>
              {[...Array(12)].map((_, i) => (
                <option key={`Grade ${i + 1}`} value={`Grade ${i + 1}`}>Grade {i + 1}</option>
              ))}
            </select>
          </div>

          <div className="t-input-group">
            <label className="t-input-label">⏱️ Duration (Minutes)</label>
            <input type="number" placeholder="e.g., 45" className="t-addquiz-input" value={duration} onChange={(e) => setDuration(e.target.value)} />
          </div>

          <div className="t-input-group">
            <label className="t-input-label">🏆 Total Marks</label>
            <input type="number" placeholder="e.g., 100" className="t-addquiz-input" value={totalMarks} onChange={(e) => setTotalMarks(e.target.value)} />
          </div>

          <div className="t-input-group">
            <label className="t-input-label">📅 Start Date & Time</label>
            <input type="datetime-local" className="t-addquiz-input" value={scheduledDate} min={new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)} onChange={(e) => setScheduledDate(e.target.value)} />
          </div>

          <div className="t-input-group">
            <label className="t-input-label">⏰ Deadline</label>
            <input type="datetime-local" className="t-addquiz-input" value={deadline} min={scheduledDate || new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)} onChange={(e) => setDeadline(e.target.value)} />
          </div>
        </div>
      </div>

      {/* 3. Questions Section */}
      <div className="t-questions-accent-area">
        {questions.map((q, qIndex) => (
          <div key={qIndex} className="t-addquiz-question-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <div style={{ background: '#10b981', color: 'white', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                {qIndex + 1}
              </div>
              <h5 style={{ color: '#0f172a', margin: 0, fontSize: '1.2rem', fontWeight: '700' }}>Question Content</h5>
            </div>
            
            <div className="t-input-group">
              <input type="text" placeholder="Type your question here..." className="t-addquiz-input" style={{ fontSize: '1.1rem', padding: '16px 20px' }} value={q.question} onChange={(e) => handleQuestionChange(qIndex, 'question', e.target.value)} />
            </div>

            <div className="t-input-group" style={{ marginTop: '15px' }}>
              <input type="text" placeholder="🖼️ Optional Image URL (.jpg, .png)" className="t-addquiz-input" value={q.imageUrl} onChange={(e) => handleQuestionChange(qIndex, 'imageUrl', e.target.value)} />
            </div>

            {q.imageUrl && (
              <div className="t-addquiz-img-preview">
                <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>Image Preview</span>
                <img src={q.imageUrl} alt="Preview" onError={(e) => e.target.src='https://via.placeholder.com/150?text=Invalid+Link'} />
              </div>
            )}

            <div style={{ marginTop: '30px' }}>
              <label className="t-input-label" style={{ marginBottom: '10px', color: '#334155' }}>Options</label>
              {q.options.map((opt, optIndex) => (
                <div key={optIndex} className="t-option-row">
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', border: '2px solid #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 'bold', flexShrink: 0 }}>
                    {String.fromCharCode(65 + optIndex)}
                  </div>
                  <input type="text" placeholder={`Option ${optIndex + 1}`} className="t-addquiz-input" value={opt} onChange={(e) => handleOptionChange(qIndex, optIndex, e.target.value)} />
                  {q.options.length > 2 && (
                    <button onClick={() => handleRemoveOption(qIndex, optIndex)} className="t-btn-remove-opt" title="Remove Option">✕</button>
                  )}
                </div>
              ))}
              <button onClick={() => handleAddOption(qIndex)} className="t-btn-add-opt">
                <span style={{ fontSize: '1.2rem' }}>+</span> Add Option
              </button>
            </div>

            <div className="t-addquiz-dropdown-area">
              <label>✅ Correct Answer:</label>
              <select className="t-addquiz-input" style={{ width: 'auto', minWidth: '200px', margin: 0 }} value={q.correctAnswer} onChange={(e) => handleQuestionChange(qIndex, 'correctAnswer', e.target.value)}>
                <option value="">-- Choose Correct Option --</option>
                {q.options.map((opt, i) => opt.trim() !== '' && <option key={i} value={opt}>Option {String.fromCharCode(65 + i)}: {opt}</option>)}
              </select>
            </div>
          </div>
        ))}

        <button onClick={handleAddQuestion} className="t-btn-add-q">
          <span>➕</span> Add Another Question
        </button>
      </div>

      {/* 4. Sticky Save Action Bar */}
      <div className="t-save-action-bar">
        <button onClick={handleSaveQuiz} className="t-btn-save-quiz">
          <span>💾</span> Publish Quiz to Database
        </button>
      </div>
    </div>
  );
};

export default TeacherAddQuiz;