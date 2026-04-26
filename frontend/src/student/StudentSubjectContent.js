import React, { useState } from 'react';
import StudentVideos from './StudentVideos';
import StudentQuizzes from './StudentQuizzes';
import StudentDocuments from './StudentDocuments';

const StudentSubjectContent = ({ subject, user, onBack }) => {
    const [activeMaterialTab, setActiveMaterialTab] = useState('videos');
    const subjectName = subject.title;

    return (
        <div className="s-subject-content-card animated-fade-in">
            
            {/* Top Navigation & Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <button 
                    onClick={onBack} 
                    className="s-btn-logout" 
                    style={{ width: 'auto', padding: '8px 18px', background: '#cfdbeb', fontSize: '14px' ,color: '#4f41e1',border: '2px solid #b0c4de', borderRadius: '12px' }}
                >
                    ⬅ Back to Subjects
                </button>
                <h2 style={{ margin: 0, color: '#1e293b', fontWeight: '800' }}>
                    {subjectName} <span style={{ color: '#3498db', fontWeight: '400' }}>Portal</span>
                </h2>
            </div>

            {/* Sub-Tab Navigation Pills */}
            <div className="s-material-tabs">
                <button 
                    onClick={() => setActiveMaterialTab('videos')} 
                    className={`s-pill-btn ${activeMaterialTab === 'videos' ? 'active-videos' : ''}`}
                >
                    🎥 Videos
                </button>
                <button 
                    onClick={() => setActiveMaterialTab('quizzes')} 
                    className={`s-pill-btn ${activeMaterialTab === 'quizzes' ? 'active-quizzes' : ''}`}
                >
                    📝 Quizzes
                </button>
                <button 
                    onClick={() => setActiveMaterialTab('documents')} 
                    className={`s-pill-btn ${activeMaterialTab === 'documents' ? 'active-documents' : ''}`}
                >
                    📄 Documents
                </button>
            </div>

            {/* Dynamic Content Area */}
            <div className="s-content-viewer" style={{ marginTop: '20px' }}>
                {activeMaterialTab === 'videos' && <StudentVideos subjectName={subjectName} user={user} />}
                {activeMaterialTab === 'quizzes' && <StudentQuizzes subjectName={subjectName} user={user} />}
                {activeMaterialTab === 'documents' && <StudentDocuments subjectName={subjectName} user={user} />}
            </div>
            
        </div>
    );
};

export default StudentSubjectContent;