import React, { useState } from 'react';
import axios from 'axios';

const TeacherAddQuiz = ({ user }) => {
  // 1. Quiz Settings State
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [totalMarks, setTotalMarks] = useState('');
  const [status, setStatus] = useState('');

  // 2. Dynamic Questions State (Starts with 1 question containing 2 empty options)
  const [questions, setQuestions] = useState([
    { question: '', imageUrl: '', options: ['', ''], correctAnswer: '' }
  ]);

  //  Handlers for Dynamic Questions 
  const handleAddQuestion = () => {
    setQuestions([...questions, { question: '', imageUrl: '', options: ['', ''], correctAnswer: '' }]);
  };

  const handleQuestionChange = (qIndex, field, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[qIndex][field] = value;
    setQuestions(updatedQuestions);
  };

  //  Handlers for Dynamic Options 
  const handleAddOption = (qIndex) => {
    const updatedQuestions = [...questions];
    updatedQuestions[qIndex].options.push(''); // Add a new blank option
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

  //  Save to Database 
  const handleSaveQuiz = async () => {
    if (!title || !duration || !scheduledDate || !totalMarks) {
      setStatus('❌ Please fill out all Quiz Settings.');
      return;
    }

    const payload = {
      teacherId: user.id,
      subject: user.subject,
      title: title,
      duration: parseInt(duration),
      scheduledDate: scheduledDate,
      totalMarks: parseInt(totalMarks),
      questions: questions
    };

    try {
      await axios.post('http://localhost:8080/api/contents/quiz', payload);
      setStatus('✅ Quiz saved successfully!');
      // Reset form
      setTitle(''); setDuration(''); setScheduledDate(''); setTotalMarks('');
      setQuestions([{ question: '', imageUrl: '', options: ['', ''], correctAnswer: '' }]);
    } catch (error) {
      console.error(error);
      setStatus('❌ Error saving quiz. Ensure backend is running.');
    }
  };

  return (
    <div className="content-form" style={{ marginTop: '20px' }}>
      <h4>Create Advanced Interactive Quiz</h4>

      {status && <p style={{ fontWeight: 'bold', color: status.includes('✅') ? 'green' : 'red' }}>{status}</p>}

      {/*  QUIZ SETTINGS  */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
        <input type="text" placeholder="Quiz Title (e.g., Midterm)" value={title} onChange={(e) => setTitle(e.target.value)} style={{ flex: '1 1 100%', padding: '8px' }} />
        <input type="number" placeholder="Duration (Minutes)" value={duration} onChange={(e) => setDuration(e.target.value)} style={{ flex: '1 1 30%', padding: '8px' }} />
        <input type="number" placeholder="Total Marks" value={totalMarks} onChange={(e) => setTotalMarks(e.target.value)} style={{ flex: '1 1 30%', padding: '8px' }} />
        <input type="datetime-local" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} style={{ flex: '1 1 30%', padding: '8px' }} title="Scheduled Date & Time" />
      </div>

      {/*  DYNAMIC QUESTIONS  */}
      {questions.map((q, qIndex) => (
        <div key={qIndex} style={{ backgroundColor: '#f9f9f9', padding: '15px', marginTop: '15px', borderLeft: '4px solid #e67e22' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <h5>Question {qIndex + 1}</h5>
          </div>

          <input type="text" placeholder="Enter Question..." value={q.question} onChange={(e) => handleQuestionChange(qIndex, 'question', e.target.value)} style={{ width: '100%', marginBottom: '10px', padding: '8px' }} />
          <input
            type="text"
            placeholder="Optional Direct Image URL (Must end in .jpg, .png, etc.)"
            value={q.imageUrl}
            onChange={(e) => handleQuestionChange(qIndex, 'imageUrl', e.target.value)}
            style={{ width: '100%', marginBottom: '10px', padding: '8px' }}
          />

          {q.imageUrl.trim() !== '' && (
            <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#fff', border: '1px solid #ddd', display: 'inline-block', borderRadius: '4px' }}>
              <p style={{ fontSize: '12px', color: '#7f8c8d', margin: '0 0 5px 0' }}>Image Preview:</p>
              <img
                src={q.imageUrl}
                alt="Question Preview"
                style={{ maxHeight: '150px', borderRadius: '4px', maxWidth: '100%' }}
                onError={(e) => {
                  // If the link is broken or not an image, swap it to a placeholder instantly!
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/300x150?text=Invalid+Image+Link';
                }}
              />
            </div>
          )}

          {/*  DYNAMIC OPTIONS  */}
          <h6>Answers / Options:</h6>
          {q.options.map((opt, optIndex) => (
            <div key={optIndex} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <input type="text" placeholder={`Option ${optIndex + 1}`} value={opt} onChange={(e) => handleOptionChange(qIndex, optIndex, e.target.value)} style={{ flex: '1', padding: '8px' }} />
              {q.options.length > 2 && (
                <button onClick={() => handleRemoveOption(qIndex, optIndex)} style={{ backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '0 10px', cursor: 'pointer', borderRadius: '4px' }}>X</button>
              )}
            </div>
          ))}

          <button onClick={() => handleAddOption(qIndex)} style={{ padding: '5px 10px', fontSize: '12px', cursor: 'pointer', marginBottom: '15px' }}>+ Add Another Option</button>

          {/*  CORRECT ANSWER DROPDOWN  */}
          <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#ecf0f1', borderRadius: '4px' }}>
            <label style={{ fontWeight: 'bold', marginRight: '10px' }}>Select Correct Answer: </label>
            <select value={q.correctAnswer} onChange={(e) => handleQuestionChange(qIndex, 'correctAnswer', e.target.value)} style={{ padding: '5px' }}>
              <option value="">-- Choose Correct Option --</option>
              {/* Dynamically populate the dropdown with the typed options */}
              {q.options.map((opt, optIndex) => (
                opt.trim() !== '' && <option key={optIndex} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        </div>
      ))}

      <button onClick={handleAddQuestion} style={{ marginTop: '15px', padding: '8px 15px', fontSize: '14px', cursor: 'pointer', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '4px' }}>
        + Add New Question
      </button>
      <br />
      <button onClick={handleSaveQuiz} style={{ marginTop: '25px', padding: '12px 25px', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '4px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', width: '100%' }}>
        Save Complete Quiz to Database
      </button>
    </div>
  );
};

export default TeacherAddQuiz;