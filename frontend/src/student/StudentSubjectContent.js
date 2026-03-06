import React, { useState } from 'react';
import StudentVideos from './StudentVideos';
import StudentQuizzes from './StudentQuizzes';
import StudentDocuments from './StudentDocuments';

const StudentSubjectContent = ({ subject, user, onBack }) => {
    const [activeMaterialTab, setActiveMaterialTab] = useState('videos');
    const subjectName = subject.title;

    return (
        <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            
            {/* Top Navigation */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <button 
                    onClick={onBack} 
                    style={{ padding: '8px 15px', backgroundColor: '#95a5a6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    ⬅ Back to Subjects
                </button>
                <h2 style={{ margin: 0, color: '#2c3e50' }}>{subjectName} Materials</h2>
            </div>

            {/* Sub-Tabs */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
                <button onClick={() => setActiveMaterialTab('videos')} style={{ padding: '8px 16px', backgroundColor: activeMaterialTab === 'videos' ? '#e74c3c' : '#ecf0f1', color: activeMaterialTab === 'videos' ? 'white' : 'black', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>🎥 Videos</button>
                <button onClick={() => setActiveMaterialTab('quizzes')} style={{ padding: '8px 16px', backgroundColor: activeMaterialTab === 'quizzes' ? '#f39c12' : '#ecf0f1', color: activeMaterialTab === 'quizzes' ? 'white' : 'black', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>📝 Quizzes</button>
                <button onClick={() => setActiveMaterialTab('documents')} style={{ padding: '8px 16px', backgroundColor: activeMaterialTab === 'documents' ? '#9b59b6' : '#ecf0f1', color: activeMaterialTab === 'documents' ? 'white' : 'black', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>📄 Documents</button>
            </div>

            {/* Render the selected component dynamically */}
            <div style={{ marginTop: '20px' }}>
                {activeMaterialTab === 'videos' && <StudentVideos subjectName={subjectName} user={user} />}
                {activeMaterialTab === 'quizzes' && <StudentQuizzes subjectName={subjectName} user={user} />}
                {activeMaterialTab === 'documents' && <StudentDocuments subjectName={subjectName} />}
            </div>
            
        </div>
    );
};

export default StudentSubjectContent;