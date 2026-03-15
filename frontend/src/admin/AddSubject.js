import React, { useState } from 'react';
import axios from 'axios';

const AddSubject = () => {
  const [subject, setSubject] = useState({ code: '', title: '' });

  const handleSaveSubject = async () => {
    try {
      await axios.post('http://localhost:8080/api/subjects', subject);
      alert("Subject added to system!");
    } catch (err) {
      alert("Error saving subject.");
    }
  };

  return (
    <div className="admin-card">
      <h3>Add New Subject</h3>
      <input placeholder="Subject Code (e.g., CS101)" onChange={(e) => setSubject({...subject, code: e.target.value})} />
      <input placeholder="Subject Title" onChange={(e) => setSubject({...subject, title: e.target.value})} />
      <button onClick={handleSaveSubject}>Create Subject</button>
    </div>
  );
};

export default AddSubject;