import React, { useState, useEffect } from 'react';
import axios from 'axios';

/**
 * QuizRanklist — Shared component for Student, Teacher and Parent dashboards.
 *
 * Props:
 *   quizId       {number}  The quiz whose ranklist to display
 *   quizTitle    {string}  Displayed as the heading
 *   totalMarks   {number}  Used to compute percentage bar widths
 *   currentUserId {string} Optional — highlights the current student's row
 *   onClose      {func}    Callback to close/go back
 */
const QuizRanklist = ({ quizId, quizTitle, totalMarks, currentUserId, onClose }) => {
    const [ranklist, setRanklist] = useState([]);
    const [loading, setLoading]   = useState(true);

    useEffect(() => {
        const fetchRanklist = async () => {
            setLoading(true);
            try {
                const res = await axios.get(`http://localhost:8080/api/answers/quiz?quizId=${quizId}`);
                setRanklist(res.data);
            } catch (e) {
                setRanklist([]);
            }
            setLoading(false);
        };
        fetchRanklist();
    }, [quizId]);

    const getMedalEmoji = (rank) => {
        if (rank === 1) return '🥇';
        if (rank === 2) return '🥈';
        if (rank === 3) return '🥉';
        return `#${rank}`;
    };

    const getBarColor = (score) => {
        const pct = totalMarks > 0 ? (score / totalMarks) * 100 : 0;
        if (pct >= 80) return 'linear-gradient(90deg, #10b981, #34d399)';
        if (pct >= 50) return 'linear-gradient(90deg, #f59e0b, #fcd34d)';
        return 'linear-gradient(90deg, #ef4444, #fca5a5)';
    };

    return (
        <div style={{ background: 'white', borderRadius: '20px', padding: '30px', boxShadow: '0 10px 40px rgba(0,0,0,0.08)' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                <div>
                    <h2 style={{ margin: 0, color: '#1e293b', fontSize: '1.4rem' }}>🏆 Quiz Ranklist</h2>
                    <p style={{ margin: '4px 0 0 0', color: '#64748b', fontWeight: 600 }}>{quizTitle}</p>
                </div>
                <button
                    onClick={onClose}
                    style={{ padding: '8px 18px', borderRadius: '12px', border: '2px solid #e2e8f0', background: 'white', fontWeight: 700, cursor: 'pointer', color: '#64748b' }}
                >
                    ← Back
                </button>
            </div>

            {loading ? (
                <p style={{ textAlign: 'center', color: '#94a3b8', padding: '40px 0' }}>Loading ranklist...</p>
            ) : ranklist.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                    <div style={{ fontSize: '50px', marginBottom: '15px' }}>📋</div>
                    <p style={{ color: '#94a3b8', fontWeight: 600 }}>No submissions yet. Ranklist will appear once students complete this quiz.</p>
                </div>
            ) : (
                <>
                    {/* Top 3 Podium */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '30px', flexWrap: 'wrap' }}>
                        {ranklist.slice(0, 3).map((entry) => (
                            <div
                                key={entry.studentId}
                                style={{
                                    background: entry.rank === 1
                                        ? 'linear-gradient(135deg, #fef3c7, #fde68a)'
                                        : entry.rank === 2
                                        ? 'linear-gradient(135deg, #f1f5f9, #e2e8f0)'
                                        : 'linear-gradient(135deg, #fef3c7, #fed7aa)',
                                    borderRadius: '16px',
                                    padding: '20px 30px',
                                    textAlign: 'center',
                                    minWidth: '130px',
                                    border: entry.studentId === currentUserId ? '3px solid #7c5dfa' : '3px solid transparent',
                                    boxShadow: '0 6px 20px rgba(0,0,0,0.08)',
                                    transform: entry.rank === 1 ? 'scale(1.05)' : 'scale(1)',
                                }}
                            >
                                <div style={{ fontSize: '40px' }}>{getMedalEmoji(entry.rank)}</div>
                                <div style={{ fontWeight: 800, color: '#1e293b', fontSize: '15px', marginTop: '8px' }}>{entry.name}</div>
                                <div style={{ fontWeight: 700, color: '#059669', marginTop: '4px' }}>
                                    {entry.score}{totalMarks > 0 ? `/${totalMarks}` : ''} pts
                                </div>
                                {entry.studentId === currentUserId && (
                                    <div style={{ fontSize: '11px', color: '#7c5dfa', fontWeight: 800, marginTop: '6px' }}>YOU</div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Full Table */}
                    <div style={{ border: '1px solid #f1f5f9', borderRadius: '16px', overflow: 'hidden' }}>
                        {/* Table Header */}
                        <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr 120px', background: '#f8fafc', padding: '12px 20px', fontWeight: 800, fontSize: '12px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            <span>Rank</span>
                            <span>Student</span>
                            <span style={{ textAlign: 'right' }}>Score</span>
                        </div>

                        {/* Table Rows */}
                        {ranklist.map((entry, idx) => {
                            const isMe   = entry.studentId === currentUserId;
                            const pct    = totalMarks > 0 ? Math.round((entry.score / totalMarks) * 100) : 0;
                            // Detect tie: same score as adjacent entry
                            const prevSameScore = idx > 0 && ranklist[idx - 1].score === entry.score;
                            const nextSameScore = idx < ranklist.length - 1 && ranklist[idx + 1].score === entry.score;
                            const isTied = prevSameScore || nextSameScore;
                            // Format submission time for display
                            const submittedAt = entry.attendTime
                                ? new Date(entry.attendTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                                : null;

                            return (
                                <div
                                    key={entry.studentId}
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: '60px 1fr 120px',
                                        padding: '14px 20px',
                                        alignItems: 'center',
                                        borderTop: '1px solid #f1f5f9',
                                        background: isMe ? 'linear-gradient(90deg, #f5f3ff, #ede9fe)' : idx % 2 === 0 ? 'white' : '#fafafa',
                                        fontWeight: isMe ? 800 : 600,
                                        transition: 'background 0.2s',
                                    }}
                                >
                                    {/* Rank column */}
                                    <span style={{ fontSize: '18px', color: entry.rank <= 3 ? '#d97706' : '#94a3b8' }}>
                                        {getMedalEmoji(entry.rank)}
                                    </span>

                                    {/* Name column with progress bar */}
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                            <span style={{ color: isMe ? '#7c5dfa' : '#1e293b' }}>{entry.name}</span>
                                            {isMe && <span style={{ fontSize: '10px', background: '#7c5dfa', color: 'white', padding: '2px 8px', borderRadius: '20px', fontWeight: 800 }}>YOU</span>}
                                            {isTied && submittedAt && (
                                                <span style={{ fontSize: '10px', background: '#fef3c7', color: '#92400e', padding: '2px 8px', borderRadius: '20px', fontWeight: 700 }}>
                                                    ⏱ {submittedAt}
                                                </span>
                                            )}
                                        </div>
                                        {isTied && (
                                            <div style={{ fontSize: '11px', color: '#f59e0b', marginTop: '3px' }}>
                                                Tie broken by submission time
                                            </div>
                                        )}
                                        <div style={{ marginTop: '6px', height: '5px', background: '#f1f5f9', borderRadius: '10px', overflow: 'hidden' }}>
                                            <div style={{ height: '100%', width: `${pct}%`, background: getBarColor(entry.score), borderRadius: '10px', transition: 'width 0.8s ease' }} />
                                        </div>
                                    </div>

                                    {/* Score column */}
                                    <div style={{ textAlign: 'right' }}>
                                        <span style={{ color: '#059669', fontWeight: 800 }}>{entry.score}</span>
                                        {totalMarks > 0 && <span style={{ color: '#94a3b8', fontSize: '12px' }}>/{totalMarks}</span>}
                                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>{pct}%</div>
                                    </div>
                                </div>
                            );
                        })}

                    </div>
                </>
            )}
        </div>
    );
};

export default QuizRanklist;
