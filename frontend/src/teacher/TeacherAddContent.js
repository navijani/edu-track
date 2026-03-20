import React, { useState } from 'react';
import '../styles/Admin.css'; // Correct path

// 1. Import your new modular components
import TeacherAddVideo from './TeacherAddVideo';
import TeacherAddQuiz from './TeacherAddQuiz';
import TeacherAddDocument from './TeacherAddDocument';

const TeacherAddContent = ({ user }) => {
  const [contentTab, setContentTab] = useState('video');

  // Helper styles for the buttons
  /*const getBtnStyle = (tabName) => ({
    padding: '8px 16px', 
    backgroundColor: contentTab === tabName ? '#3498db' : '#ecf0f1', 
    color: contentTab === tabName ? 'white' : 'black', 
    border: 'none', 
    borderRadius: '4px', 
    cursor: 'pointer'
  });*/

  return (
    <div className="admin-card">
      {/*<h3>Upload New Content for {user.subject}</h3>*/}
      
      {/* Sub-navigation Tabs */}
      {/*<div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
        <button onClick={() => setContentTab('video')} style={getBtnStyle('video')}>
          Add Video & Questions
        </button>
        <button onClick={() => setContentTab('quiz')} style={getBtnStyle('quiz')}>
          Add Interactive Quiz
        </button>
        <button onClick={() => setContentTab('document')} style={getBtnStyle('document')}>
          Add Document & Questions
        </button>
      </div>*/}

      
<div className="t-contents-header">
  {/* The Upload Banner - Still using glass-card for consistency */}
  <div className="t-content-banner glass-card">
    <div className="content-banner-text">
      <h2>Upload New <span>Content</span></h2>
      <p>Adding resources for <strong>{user.subject}</strong></p>
    </div>
  </div>

  {/* The Specific Upload Navigation using the new names */}
  <div className="t-add-content-nav">
    <button 
      onClick={() => setContentTab('video')} 
      className={`t-add-nav-btn ${contentTab === 'video' ? 'active' : ''}`}
    >
      🎥 Add Video & Questions
    </button>
    
    <button 
      onClick={() => setContentTab('quiz')} 
      className={`t-add-nav-btn ${contentTab === 'quiz' ? 'active' : ''}`}
    >
      📝 Add Interactive Quiz
    </button>
    
    <button 
      onClick={() => setContentTab('document')} 
      className={`t-add-nav-btn ${contentTab === 'document' ? 'active' : ''}`}
    >
      📄 Add Document & Questions
    </button>
  </div>
</div>
      {/* 2. Cleanly render the selected component and pass the 'user' prop down */}
      {contentTab === 'video' && <TeacherAddVideo user={user} />}
      {contentTab === 'quiz' && <TeacherAddQuiz user={user} />}
      {contentTab === 'document' && <TeacherAddDocument user={user} />}

    </div>
  );
};

export default TeacherAddContent;