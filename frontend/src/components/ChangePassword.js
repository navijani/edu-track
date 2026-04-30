import React, { useState } from 'react';

/**
 * ChangePassword – Shared password-change component used by all dashboard roles.
 *
 * Props:
 *   user  {object}  The currently logged-in user object. Must contain `user.id`.
 *
 * Features:
 *   - Three password fields: Current, New, Confirm New
 *   - Show / hide toggle on every field (eye icon)
 *   - Live password strength indicator (Weak → Fair → Good → Strong)
 *   - Client-side validation before any network request
 *   - Calls PUT /api/users/change-password on the Java backend
 *   - Animated success / error banner after submit
 *   - Spinner on the submit button while the request is in-flight
 */
const ChangePassword = ({ user }) => {

    // ── Form field state ──────────────────────────────────────────────────────
    const [currentPassword, setCurrentPassword]   = useState('');
    const [newPassword, setNewPassword]           = useState('');
    const [confirmPassword, setConfirmPassword]   = useState('');

    // ── UI feedback state ─────────────────────────────────────────────────────
    const [status, setStatus]   = useState(null);  // 'success' | 'error' | null
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false); // true while awaiting API response

    // ── Show / hide password toggle state ────────────────────────────────────
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew]         = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    /**
     * resetForm – clears all password input fields after a successful change.
     * Called only on success so the user doesn't lose their typed input on error.
     */
    const resetForm = () => {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
    };

    /**
     * handleSubmit – form submission handler.
     * 1. Runs client-side validation checks (order matters – earliest fail wins).
     * 2. Sends PUT request to the backend.
     * 3. Updates status/message based on the response.
     */
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Clear any previous alert before re-validating
        setStatus(null);
        setMessage('');

        // ── Client-side validation ───────────────────────────────────────────

        // All three fields are required
        if (!currentPassword || !newPassword || !confirmPassword) {
            setStatus('error');
            setMessage('Please fill in all fields.');
            return;
        }

        // Minimum length check (mirrors the backend rule)
        if (newPassword.length < 8) {
            setStatus('error');
            setMessage('New password must be at least 8 characters long.');
            return;
        }

        // New password and confirm password must match
        if (newPassword !== confirmPassword) {
            setStatus('error');
            setMessage('New passwords do not match.');
            return;
        }

        // New password must actually be different from the current one
        if (currentPassword === newPassword) {
            setStatus('error');
            setMessage('New password must be different from the current password.');
            return;
        }

        // ── API call ─────────────────────────────────────────────────────────
        setLoading(true);
        try {
            const res = await fetch('http://localhost:8080/api/users/change-password', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,          // The logged-in user's ID
                    currentPassword,           // Verified against BCrypt hash on server
                    newPassword,               // Will be hashed and stored on server
                }),
            });

            const data = await res.json();

            if (data.success) {
                // Success: show green banner and clear the form
                setStatus('success');
                setMessage('✅ Password changed successfully! Please use your new password next time you log in.');
                resetForm();
            } else {
                // Backend returned success:false (e.g. wrong current password)
                setStatus('error');
                setMessage(data.message || 'Failed to change password. Please try again.');
            }
        } catch (err) {
            // Network / server unreachable
            setStatus('error');
            setMessage('Could not reach the server. Please try again later.');
        } finally {
            // Always hide the spinner, whether the request succeeded or failed
            setLoading(false);
        }
    };

    // ── Shared inline style object for all password <input> elements ──────────
    const inputStyle = {
        width: '100%',
        padding: '14px 16px',
        border: '2px solid #e2e8f0',
        borderRadius: '12px',
        fontSize: '15px',
        fontFamily: 'inherit',
        background: 'rgba(255,255,255,0.8)',
        color: '#1e293b',
        outline: 'none',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        boxSizing: 'border-box',
    };

    /**
     * PasswordField – reusable sub-component that renders a labelled password
     * input with a show/hide toggle button.
     *
     * Props:
     *   id        {string}   Unique HTML id (also used for the <label> htmlFor)
     *   label     {string}   Human-readable label text shown above the field
     *   value     {string}   Controlled input value
     *   onChange  {function} State setter called when the input changes
     *   show      {boolean}  Whether to reveal the password as plain text
     *   onToggle  {function} Toggles the show/hide state
     */
    const PasswordField = ({ id, label, value, onChange, show, onToggle }) => (
        <div style={{ marginBottom: '22px' }}>
            {/* Accessible label linked to the input via htmlFor / id */}
            <label
                htmlFor={id}
                style={{ display: 'block', fontWeight: 700, fontSize: '13px',
                         color: '#475569', marginBottom: '8px', letterSpacing: '0.3px' }}
            >
                {label}
            </label>

            {/* Wrapper for input + toggle button (relative for absolute positioning) */}
            <div style={{ position: 'relative' }}>
                {/* type toggles between 'password' and 'text' based on show prop */}
                <input
                    id={id}
                    type={show ? 'text' : 'password'}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={`Enter ${label.toLowerCase()}`}
                    style={{ ...inputStyle, paddingRight: '50px' }} // room for the eye button
                    // Purple glow on focus to match the dashboard's colour palette
                    onFocus={(e) => {
                        e.target.style.borderColor = '#7c5dfa';
                        e.target.style.boxShadow = '0 0 0 3px rgba(124,93,250,0.15)';
                    }}
                    onBlur={(e) => {
                        e.target.style.borderColor = '#e2e8f0';
                        e.target.style.boxShadow = 'none';
                    }}
                />

                {/* Show / hide toggle button – positioned inside the input on the right */}
                <button
                    type="button"
                    onClick={onToggle}
                    style={{
                        position: 'absolute', right: '14px', top: '50%',
                        transform: 'translateY(-50%)', background: 'none',
                        border: 'none', cursor: 'pointer', fontSize: '18px',
                        color: '#94a3b8', padding: '0', lineHeight: 1,
                    }}
                    aria-label={show ? 'Hide password' : 'Show password'}
                >
                    {show ? '🙈' : '👁️'}
                </button>
            </div>
        </div>
    );

    /**
     * getStrength – calculates a password strength score (0–4) and returns
     * a label, a colour, and a progress bar width percentage.
     *
     * Scoring criteria (1 point each):
     *   - Length ≥ 8 characters
     *   - Contains an uppercase letter
     *   - Contains a digit
     *   - Contains a special character (non-alphanumeric)
     */
    const getStrength = (pwd) => {
        if (!pwd) return { label: '', color: '#e2e8f0', width: '0%' };

        const score =
            (pwd.length >= 8 ? 1 : 0) +          // length check
            (/[A-Z]/.test(pwd) ? 1 : 0) +         // uppercase letter
            (/[0-9]/.test(pwd) ? 1 : 0) +         // digit
            (/[^A-Za-z0-9]/.test(pwd) ? 1 : 0);   // special character

        if (score <= 1) return { label: 'Weak',   color: '#ef4444', width: '25%'  };
        if (score === 2) return { label: 'Fair',   color: '#f59e0b', width: '50%'  };
        if (score === 3) return { label: 'Good',   color: '#3b82f6', width: '75%'  };
        return              { label: 'Strong', color: '#10b981', width: '100%' };
    };

    // Compute strength once per render (re-computed whenever newPassword changes)
    const strength = getStrength(newPassword);

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="cp-page-wrapper">

            {/* Decorative blurred orbs – purely visual, created with CSS classes */}
            <div className="cp-orb cp-orb-1" />
            <div className="cp-orb cp-orb-2" />

            {/* Main glassmorphism card */}
            <div className="cp-card">

                {/* ── Card header: icon + title + subtitle ── */}
                <div className="cp-header">
                    <div className="cp-icon-ring">🔑</div>
                    <div>
                        <h2 className="cp-title">Change Password</h2>
                        <p className="cp-subtitle">
                            Keep your account safe with a strong, unique password.
                        </p>
                    </div>
                </div>

                {/* Gradient divider line */}
                <div className="cp-divider" />

                {/* ── Alert banner – shown after submit (success or error) ── */}
                {status && (
                    <div className={`cp-alert cp-alert-${status}`}>
                        {message}
                    </div>
                )}

                {/* ── Password change form ── */}
                <form onSubmit={handleSubmit} autoComplete="off">

                    {/* Field 1: Current password (used to verify identity on server) */}
                    <PasswordField
                        id="cp-current"
                        label="Current Password"
                        value={currentPassword}
                        onChange={setCurrentPassword}
                        show={showCurrent}
                        onToggle={() => setShowCurrent(!showCurrent)}
                    />

                    {/* Field 2: New password (sent to server for BCrypt hashing) */}
                    <PasswordField
                        id="cp-new"
                        label="New Password"
                        value={newPassword}
                        onChange={setNewPassword}
                        show={showNew}
                        onToggle={() => setShowNew(!showNew)}
                    />

                    {/* Live strength bar – only visible once the user starts typing */}
                    {newPassword && (
                        <div style={{ marginTop: '-14px', marginBottom: '22px' }}>
                            {/* Grey track with coloured fill that animates as strength changes */}
                            <div style={{ height: '5px', background: '#f1f5f9', borderRadius: '99px', overflow: 'hidden' }}>
                                <div style={{
                                    height: '100%', width: strength.width,
                                    background: strength.color, borderRadius: '99px',
                                    transition: 'width 0.4s ease, background 0.4s ease', // smooth animation
                                }} />
                            </div>
                            {/* Strength label (Weak / Fair / Good / Strong) */}
                            <p style={{ margin: '5px 0 0', fontSize: '12px', color: strength.color, fontWeight: 700 }}>
                                {strength.label}
                            </p>
                        </div>
                    )}

                    {/* Field 3: Confirm new password (client-side match check only) */}
                    <PasswordField
                        id="cp-confirm"
                        label="Confirm New Password"
                        value={confirmPassword}
                        onChange={setConfirmPassword}
                        show={showConfirm}
                        onToggle={() => setShowConfirm(!showConfirm)}
                    />

                    {/* ── Tips box ── */}
                    <div className="cp-tips">
                        <p style={{ margin: 0, fontWeight: 700, color: '#475569', marginBottom: '8px', fontSize: '13px' }}>
                            💡 Tips for a strong password:
                        </p>
                        <ul style={{ margin: 0, paddingLeft: '20px', color: '#64748b', fontSize: '13px', lineHeight: '1.8' }}>
                            <li>At least 8 characters</li>
                            <li>Mix uppercase &amp; lowercase letters</li>
                            <li>Include numbers and symbols</li>
                        </ul>
                    </div>

                    {/*
                     * Submit button:
                     *   - Shows a CSS spinner while the API request is in-flight (loading=true)
                     *   - Disabled during loading to prevent duplicate submissions
                     */}
                    <button
                        id="cp-submit-btn"
                        type="submit"
                        className="cp-submit-btn"
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="cp-spinner" /> // animated ring spinner (CSS)
                        ) : (
                            '🔒 Update Password'
                        )}
                    </button>

                </form>
            </div>
        </div>
    );
};

export default ChangePassword;
