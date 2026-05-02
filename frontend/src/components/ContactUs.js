import React from 'react';
import { FiPhone, FiGithub, FiUser } from 'react-icons/fi'; // Import icons
import '../styles/RoleSelection.css'; // Reusing existing glass styles

const ContactUs = ({ onBack }) => {
    // Team data based on image_5.png, image_6.png, and user input
    const team = [
        {
            name: "Navindu Janith",
            ghUser: "navijani", // From image_5.png
            role: "Full-Stack Developer",
            phone: "071 389 2928",
            ghLink: "https://github.com/navijani"
        },
        {
            name: "Uchitha Oshan",
            ghUser: "uchithao04", // From image_5.png
            role: "Backend & DB Architect",
            phone: "074 362 1605",
            ghLink: "https://github.com/uchithao04"
        },
        {
            name: "Thisandi Rajapaksha",
            ghUser: "thisandirajapaksha", // From image_5.png
            role: "Frontend Developer",
            phone: "070 350 4806",
            ghLink: "https://github.com/thisandirajapaksha"
        },
        {
            name: "Sameera Senanayaka",
            ghUser: "sameera-hash", // From image_5.png
            role: "Quality Assurance",
            phone: "071 047 6839",
            ghLink: "https://github.com/sameera-hash"
        },
        {
            name: "Imain Willaddara",
            ghUser: "iwilladdara24", // From image_6.png
            role: "Project Manager",
            phone: "077 571 0090",
            ghLink: "https://github.com/iwilladdara24"
        }
    ];

    return (
        <div className="glass-overlay">
            {/* Animated orbs background */}
            <div className="glass-orb glass-orb-1"></div>
            <div className="glass-orb glass-orb-2"></div>
            <div className="glass-orb glass-orb-3"></div>

            <div className="login-glass-card" style={{ maxWidth: '800px', width: '90%', padding: '40px' }}>
                <button className="back-arrow" onClick={onBack}>←</button>

                <div className="login-header">
                    <div className="role-icon-circle">💻</div>
                    <h2>Development <span>Team</span></h2>
                    <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.1rem', marginTop: '10px' }}>
                        All members are **Web Developers** and **CSE Undergraduates**.
                    </p>
                </div>

                <div className="developer-grid" style={{
                    marginTop: '30px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '20px'
                }}>
                    {team.map((member, index) => (
                        <div key={index} className="dev-card" style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '15px',
                            padding: '20px',
                            textAlign: 'center',
                            transition: 'all 0.3s ease',
                        }}>
                            {/* PLACEHOLDER ICON (We will add photos in another day) */}
                            <div className="dev-photo-placeholder" style={{
                                width: '80px',
                                height: '80px',
                                borderRadius: '50%',
                                background: 'rgba(255,255,255,0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 15px',
                                border: '2px solid rgba(255,255,255,0.2)'
                            }}>
                                <FiUser size={40} color="rgba(255,255,255,0.5)" />
                            </div>

                            <h3 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '5px' }}>{member.name}</h3>
                            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', marginBottom: '15px' }}>{member.role}</p>

                            <div className="dev-links" style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
                                {/* Phone Link */}
                                <a href={`tel:${member.phone.replace(/ /g, '')}`} title="Call Now" style={{ color: '#64ffda', transition: 'color 0.3s' }}>
                                    <FiPhone size={22} />
                                </a>
                                {/* Github Link */}
                                <a href={member.ghLink} target="_blank" rel="noopener noreferrer" title={`View ${member.ghUser}'s GitHub`} style={{ color: 'rgba(255,255,255,0.7)', transition: 'color 0.3s' }}>
                                    <FiGithub size={22} />
                                </a>
                            </div>
                        </div>
                    ))}
                </div>

                <button
                    className="login-primary-btn"
                    onClick={onBack}
                    style={{ marginTop: '40px' }}
                >
                    Return to Login
                    071 389 2928</button>
            </div>
        </div>
    );
};

export default ContactUs;