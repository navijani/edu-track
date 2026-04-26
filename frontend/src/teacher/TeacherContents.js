import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Teacher.css';

const TeacherContents = ({ user }) => {
  const [activeTab, setActiveTab] = useState('videos');
  const [contentList, setContentList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    setSelectedItem(null);
    fetchContent(activeTab);
  }, [activeTab]);

  const fetchContent = async (type) => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:8080/api/contents/${type}?teacherId=${user.id}`);
      setContentList(response.data);
    } catch (error) {
      console.error("Error fetching content:", error);
      setContentList([]);
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete this ${activeTab.slice(0, -1)}?`)) return;
    try {
      await axios.delete(`http://localhost:8080/api/contents/${activeTab.slice(0, -1)}?id=${selectedItem.id}`);
      setSelectedItem(null);
      fetchContent(activeTab);
    } catch (error) {
      alert("Failed to delete content.");
    }
  };

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
  };

  const formatDateTime = (dateStr) => {
    const dateObj = new Date(dateStr);
    return {
      date: dateObj.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      time: dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  return (
    <div className="t-contents-wrapper light-theme">
      <div className="t-contents-header">
        <div className="t-content-banner glass-card">
                <div className="content-banner-text">
                    <h2> Subject <span>Materials </span></h2>
                    <p>Managing <strong>{user.subject}</strong> resources.</p>
                </div>
          </div>
        
        <div className="t-tab-navigation light">
          <button className={activeTab === 'videos' ? 'active' : ''} onClick={() => setActiveTab('videos')}>🎥 Videos</button>
          <button className={activeTab === 'quizzes' ? 'active' : ''} onClick={() => setActiveTab('quizzes')}>📝 Quizzes</button>
          <button className={activeTab === 'documents' ? 'active' : ''} onClick={() => setActiveTab('documents')}>📄 Documents</button>
        </div>
      </div>

      {!selectedItem ? (
        <div className="t-content-grid">
          {loading ? (
            <div className="t-loader">Refreshing gallery...</div>
          ) : contentList.length === 0 ? (
            <div className="t-empty-state light-glass">
              <p>No {activeTab} uploads found.</p>
            </div>
          ) : (
            contentList.map((item, index) => (
              <div key={index} className={`t-item-card light-glass ${activeTab}-theme`}>
                {/* Updated Icon Logic */}
                <div className="t-card-icon">
                  {activeTab === 'videos' ? '▶️' : activeTab === 'quizzes' ? '📝' : '📄'}
                </div>
                <h4>{item.title}</h4>
                <button className="t-btn-glass-primary" onClick={() => setSelectedItem(item)}>
                  Explore Resource
                </button>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className={`t-wide-detail-container animated-fade-in ${activeTab}-theme`}>
          {/* By adding ${activeTab}-theme here, the title inside will turn blue/purple/green */}

          {/* Enhanced Navigation Buttons */}
          <div className="t-detail-nav">
            <button className="t-btn-back-pill" onClick={() => setSelectedItem(null)}>
              <span className="btn-icon">←</span> Back to Resources
            </button>
            <button className="t-btn-delete-pill" onClick={handleDelete}>
              <span className="btn-icon">🗑️</span> Remove Resource
            </button>
          </div>

          <div className="t-wide-content-box light-glass">
            {/* Conditional Color for Quiz Title */}
            <h2 className={`t-wide-title ${activeTab === 'quizzes' ? 'quiz-accent' : ''}`}>
                {selectedItem.title}
            </h2>

            {activeTab === 'videos' && (
              <div className="t-video-container-wide">
                <iframe
                  src={getYouTubeEmbedUrl(selectedItem.videoUrl)}
                  title="YouTube Player" frameBorder="0" allowFullScreen>
                </iframe>
              </div>
            )}

            {activeTab === 'quizzes' && (
              <div className="t-quiz-meta-grid">
                <div className="meta-tile"><span>Marks</span>{selectedItem.marks} Pts</div>
                <div className="meta-tile"><span>Duration</span>{selectedItem.duration} Mins</div>
                <div className="meta-tile wide">
                  <span>Scheduled Schedule</span>
                  <strong>📅 {formatDateTime(selectedItem.scheduledDate).date}</strong>
                  <br />
                  <strong>⏰ {formatDateTime(selectedItem.scheduledDate).time}</strong>
                </div>
              </div>
            )}

            {activeTab === 'documents' && (
              <div className="t-doc-action-box">
                <a href={selectedItem.documentUrl} target="_blank" rel="noreferrer" className="t-btn-glass-purple">
                  📄 Open Full Document: <strong>{selectedItem.title}</strong>
                </a>
              </div>
            )}

            <div className="t-spacer" />

            <div className="t-questions-section">
              {/* Colored Question Set Header */}
              <h3 className="question-set-header">QUESTION SET</h3>
              
              <div className="t-q-stack">
                {selectedItem.questions?.map((q, idx) => (
                  <div key={idx} className="t-q-card-wide">
                    {/* Synchronized Badge Color */}
                    <span className="q-badge">Q {idx + 1}</span>
                    <p className="q-body-text">{q.question}</p>

                    {q.imageUrl && <img src={q.imageUrl} className="q-preview-img" alt="Attached material" />}

                    {activeTab === 'quizzes' ? (
                      <div className="q-options-container">
                        {q.options?.map((opt, oIdx) => (
                          <div key={oIdx} className={`q-opt-item ${opt === q.correctAnswer ? 'correct' : ''}`}>
                            {opt} {opt === q.correctAnswer && "✓"}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="q-ans-bubble">
                        <strong>Correct Answer:</strong> {q.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherContents;