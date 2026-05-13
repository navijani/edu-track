import React from 'react';
import { FiPhone, FiGithub, FiUser } from 'react-icons/fi';
import '../styles/RoleSelection.css';

const ContactUs = ({ onBack }) => {
    const team = [
        {
            name: "Navindu Janith",
            ghUser: "navijani",
            role: "Full-Stack Developer",
            phone: "071 389 2928",
            ghLink: "https://github.com/navijani"
        },
        {
            name: "Uchitha Oshan",
            ghUser: "uchithao04",
            role: "Backend & DB Architect",
            phone: "074 362 1605",
            ghLink: "https://github.com/uchithao04"
        },
        {
            name: "Thisandi Rajapaksha",
            ghUser: "thisandirajapaksha",
            role: "Frontend Developer",
            phone: "070 350 4806",
            ghLink: "https://github.com/thisandirajapaksha"
        },
        {
            name: "Sameera Senanayaka",
            ghUser: "sameera-hash",
            role: "Quality Assurance",
            phone: "071 047 6839",
            ghLink: "https://github.com/sameera-hash"
        },
        {
            name: "Imain Willaddara",
            ghUser: "iwilladdara24",
            role: "Project Manager",
            phone: "077 571 0090",
            ghLink: "https://github.com/iwilladdara24"
        }
    ];

    return (
        /* FIX 1: Set overflow-y to auto and min-height to 100vh to allow scrolling */
        <div className="glass-overlay" style={{
            display: 'block',        // Change from flex to block for better scrolling
            overflowY: 'auto',      // Enable vertical scroll
            height: '100vh',        // Full viewport height
            padding: '40px 10px'    // Extra space at top/bottom for mobile
        }}>
            {/* Animated orbs stay in background */}
            <div className="glass-orb glass-orb-1"></div>
            <div className="glass-orb glass-orb-2"></div>
            <div className="glass-orb glass-orb-3"></div>

            {/* FIX 2: Remove fixed heights from the card */}
            <div className="login-glass-card" style={{
                maxWidth: '950px',
                width: '95%',
                margin: '0 auto',   // Center horizontally
                padding: '30px 15px',
                minHeight: 'auto',   // Let content determine height
                position: 'relative'
            }}>
                <button className="back-arrow" onClick={onBack} style={{ position: 'absolute', top: '15px', left: '15px' }}>←</button>

                <div className="login-header" style={{ marginBottom: '30px' }}>
                    <div className="role-icon-circle">💻</div>
                    <h2 style={{ fontSize: 'clamp(1.5rem, 5vw, 2.2rem)' }}>Development <span>Team</span></h2>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                    gap: '20px',
                    marginBottom: '20px'
                }}>
                    {team.map((member, index) => (
                        <div key={index} style={{
                            background: 'rgba(255, 255, 255, 0.08)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '20px',
                            padding: '25px 15px',
                            textAlign: 'center',
                            backdropFilter: 'blur(10px)'
                        }}>
                            <div style={{
                                width: '65px',
                                height: '65px',
                                borderRadius: '50%',
                                background: 'rgba(255,255,255,0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 15px',
                                border: '1px solid rgba(255,255,255,0.2)'
                            }}>
                                <FiUser size={30} color="#64ffda" />
                            </div>

                            <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '5px' }}>{member.name}</h3>
                            <p style={{ color: '#64ffda', fontSize: '0.8rem', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '15px' }}>{member.role}</p>

                            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '15px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '12px', color: '#fff' }}>
                                    <FiPhone size={14} color="#64ffda" />
                                    <span style={{ fontSize: '0.95rem', fontFamily: 'monospace' }}>{member.phone}</span>
                                </div>
                                <a href={member.ghLink} target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', fontSize: '0.85rem' }}>
                                    <FiGithub size={16} />
                                    <span>@{member.ghUser}</span>
                                </a>
                            </div>
                        </div>
                    ))}
                </div>

                <button className="login-primary-btn" onClick={onBack} style={{ marginTop: '20px', width: '200px' }}>
                    Return to Login
                </button>
            </div>
        </div>
    );
};

export default ContactUs;