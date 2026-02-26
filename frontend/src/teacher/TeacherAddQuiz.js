import React from 'react';

const TeacherAddQuiz = ({ user }) => {
  return (
    <div className="content-form" style={{ marginTop: '20px' }}>
      <h4>Create Interactive Quiz</h4>
      <input type="text" placeholder="Quiz Title (e.g., Midterm Review)" style={{ width: '100%', marginBottom: '10px', padding: '8px' }} />
      
      <div style={{ backgroundColor: '#f9f9f9', padding: '15px', marginTop: '15px', borderLeft: '4px solid #e67e22' }}>
        <h5>Question 1</h5>
        <input type="text" placeholder="Enter Question..." style={{ width: '100%', marginBottom: '10px', padding: '8px' }} />
        <input type="text" placeholder="Option A" style={{ width: '48%', marginRight: '4%', marginBottom: '10px', padding: '8px' }} />
        <input type="text" placeholder="Option B" style={{ width: '48%', marginBottom: '10px', padding: '8px' }} />
        <input type="text" placeholder="Option C" style={{ width: '48%', marginRight: '4%', padding: '8px' }} />
        <input type="text" placeholder="Option D" style={{ width: '48%', padding: '8px' }} />
        
        <div style={{ marginTop: '10px' }}>
          <label>Correct Answer: </label>
          <select>
            <option>A</option>
            <option>B</option>
            <option>C</option>
            <option>D</option>
          </select>
        </div>
      </div>
      
      <button style={{ marginTop: '10px', padding: '5px 10px', fontSize: '12px' }}>+ Add Question</button>
      <br />
      <button style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '4px' }}>Save Complete Quiz</button>
    </div>
  );
};

export default TeacherAddQuiz;