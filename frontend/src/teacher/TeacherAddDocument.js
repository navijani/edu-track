import React from 'react';

const TeacherAddDocument = ({ user }) => {
  return (
    <div className="content-form" style={{ marginTop: '20px' }}>
      <h4>Upload PDF / Document</h4>
      <input type="text" placeholder="Document Title" style={{ width: '100%', marginBottom: '10px', padding: '8px' }} />
      
      <div style={{ padding: '20px', border: '2px dashed #ccc', textAlign: 'center', marginBottom: '15px', backgroundColor: '#fafafa' }}>
        <p>Drag & Drop your PDF/Word file here, or click to browse.</p>
        <input type="file" />
      </div>

      <div style={{ backgroundColor: '#f9f9f9', padding: '15px', marginTop: '15px', borderLeft: '4px solid #9b59b6' }}>
        <h5>Reading Questions</h5>
        <textarea placeholder="Type a question based on this document..." rows="2" style={{ width: '100%', marginBottom: '10px' }}></textarea>
        <button style={{ padding: '5px 10px', fontSize: '12px' }}>+ Add Another Question</button>
      </div>

      <button style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '4px' }}>Save Document</button>
    </div>
  );
};

export default TeacherAddDocument;