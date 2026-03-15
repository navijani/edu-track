import React, { useState } from 'react';
import axios from 'axios';
import '../styles/Admin.css'; // Utilizing your global admin styles

const AddSubject = () => {
  const [subject, setSubject] = useState({ code: '', title: '' });
  const [loading, setLoading] = useState(false);

  const handleSaveSubject = async (e) => {
    e.preventDefault();
    if (!subject.code || !subject.title) {
      alert("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      await axios.post('http://localhost:8080/api/subjects', subject);
      alert("📚 Subject successfully added to the curriculum!");
      setSubject({ code: '', title: '' }); // Clear form
    } catch (err) {
      alert("Error saving subject. Check if the code already exists.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-subject-container">
      <div className="form-glass-card compact">
        <div className="form-header">
          <div className="form-icon">📖</div>
          <h3>Add New Subject</h3>
          <p>Define a new course for the EduTrack database</p>
        </div>

        <form onSubmit={handleSaveSubject} className="admin-form">
          <div className="input-group">
            <label>Subject Code</label>
            <input 
              value={subject.code}
              placeholder="e.g. CS101, MATH20" 
              onChange={(e) => setSubject({...subject, code: e.target.value})} 
            />
          </div>

          <div className="input-group" style={{ marginTop: '20px' }}>
            <label>Subject Title</label>
            <input 
              value={subject.title}
              placeholder="e.g. Computer Science" 
              onChange={(e) => setSubject({...subject, title: e.target.value})} 
            />
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Adding...' : 'Create Subject'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddSubject;