import React, { useState, useEffect } from 'react';
import ChangePassword from './ChangePassword';

/**
 * UserProfile – Unified "My Profile" page used by all three dashboard roles.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * Props
 * ─────────────────────────────────────────────────────────────────────────────
 *   user  {object}  The logged-in user object that comes from the login response.
 *                   Required field: user.id  (used to fetch the full profile)
 *                   Optional fields used as fallback: user.name, user.role
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * How it works
 * ─────────────────────────────────────────────────────────────────────────────
 *   1. On mount, calls GET /api/users/profile?userId=<id> to load the full
 *      profile including role-specific linked data (parent / child records).
 *   2. While loading, shows a full-page spinner.
 *   3. On success, renders:
 *        - Hero card   – avatar initial, name, ID pill, role badge, email
 *        - Info grid   – grade (student) / subject (teacher) / child ID (parent)
 *        - Linked card – parent info (student) OR child info (parent)
 *        - Security    – embedded <ChangePassword> component
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * Role colour mapping
 * ─────────────────────────────────────────────────────────────────────────────
 *   Student → Purple  (#7c5dfa / #a855f7)
 *   Teacher → Blue    (#3498db / #06b6d4)
 *   Parent  → Green   (#10b981 / #059669)
 */
const UserProfile = ({ user }) => {

    // ─────────────────────────────────────────────────────────────────────────
    // State
    // ─────────────────────────────────────────────────────────────────────────

    // `profile` holds the full JSON returned by GET /api/users/profile.
    // Starts as null (not yet loaded) and is populated on successful fetch.
    const [profile, setProfile] = useState(null);

    // `loading` is true while the profile API call is in-flight.
    // Controls whether the spinner or the actual content is rendered.
    const [loading, setLoading] = useState(true);

    // `error` stores any failure message (network error, user not found, etc.).
    const [error, setError]     = useState('');

    // ─────────────────────────────────────────────────────────────────────────
    // Fetch profile data from the backend (runs once when the component mounts)
    // ─────────────────────────────────────────────────────────────────────────
    useEffect(() => {

        /**
         * fetchProfile – async function that calls the profile API and
         * updates state with the result.
         *
         * We define it inside useEffect so it can be called immediately
         * without needing to wrap it in useCallback.
         */
        const fetchProfile = async () => {
            try {
                // --- JWT AUTHORIZATION STEP ---
                // To fetch the profile, we must "show" our Passport (JWT Token) to the server.
                // We retrieve it from Local Storage and put it in the "Authorization" header
                // using the "Bearer" scheme (industry standard).
                const res = await fetch(`http://localhost:8080/api/users/profile?userId=${user.id}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('edu_track_token')}`
                    }
                });

                // If the server returns 401, it means our passport is fake or expired.
                if (res.status === 401) {
                    setError('Unauthorized: Your session has expired. Please log in again.');
                    return;
                }

                const data = await res.json();

                if (data.error) {
                    // Backend returned an error (e.g. user not found)
                    setError(data.error);
                } else {
                    // Success – store the full profile object
                    setProfile(data);
                }
            } catch (err) {
                // Network failure or server not running
                setError('Could not load profile. Check that the server is running.');
            } finally {
                // Always hide the spinner after the request finishes
                setLoading(false);
            }
        };

        fetchProfile();

    // Re-fetch only if the user's ID changes (e.g. admin switching accounts)
    }, [user.id]);

    // ─────────────────────────────────────────────────────────────────────────
    // Role colour / label configuration
    // ─────────────────────────────────────────────────────────────────────────
    // This lookup table maps each role string to the visual tokens used on:
    //   - the avatar circle  (gradient)
    //   - the role badge     (badge text colour + badge background colour)
    //   - some info cards    (accent / bg props)
    const roleConfig = {
        student: {
            gradient : 'linear-gradient(135deg, #7c5dfa 0%, #a855f7 100%)', // purple
            badge    : '#7c5dfa',   // text colour for the role badge
            badgeBg  : '#f0ebff',   // background colour for the role badge
            label    : 'Student',   // human-readable label shown in the badge
        },
        teacher: {
            gradient : 'linear-gradient(135deg, #3498db 0%, #06b6d4 100%)', // blue
            badge    : '#0369a1',
            badgeBg  : '#e0f2fe',
            label    : 'Teacher',
        },
        parent: {
            gradient : 'linear-gradient(135deg, #10b981 0%, #059669 100%)', // green
            badge    : '#065f46',
            badgeBg  : '#d1fae5',
            label    : 'Parent',
        },
    };

    // Look up the config for the current role; fall back to student styling
    // if the role is unrecognised (safety net, should not happen in practice)
    const rc = roleConfig[user.role?.toLowerCase()] || roleConfig.student;

    // ─────────────────────────────────────────────────────────────────────────
    // Sub-component: InfoCard
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * InfoCard – a small glassmorphism tile that displays one piece of
     * profile information (e.g. Grade, Subject, User ID).
     *
     * Rendered inside the `.up-grid` CSS grid so tiles wrap responsively.
     *
     * @param {string} icon    Emoji rendered inside the coloured icon circle
     * @param {string} label   Small uppercase descriptive label (e.g. "GRADE")
     * @param {string} value   Primary value displayed in bold (e.g. "Grade 10")
     * @param {string} accent  CSS colour used for the left border and icon text
     * @param {string} bg      CSS colour used for the icon circle background
     */
    const InfoCard = ({ icon, label, value, accent, bg }) => (
        <div className="up-info-card" style={{ borderLeftColor: accent }}>
            {/* Coloured square icon circle – colour is passed as a prop */}
            <div className="up-info-icon" style={{ background: bg, color: accent }}>
                {icon}
            </div>
            <div>
                {/* Primary value – falls back to an em-dash if value is empty */}
                <div className="up-info-value">{value || '—'}</div>
                {/* Small uppercase label below the value */}
                <div className="up-info-label">{label}</div>
            </div>
        </div>
    );

    // ─────────────────────────────────────────────────────────────────────────
    // Sub-component: PersonChip
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * PersonChip – a compact card showing a person's avatar initial, full name,
     * and a secondary sub-line (e.g. ID + email, or grade + ID).
     *
     * Used in:
     *   - The "Parent / Guardian" section for students
     *   - The "My Child" section for parents
     *
     * @param {string} initial  Single uppercase letter shown inside the avatar
     * @param {string} name     Full name displayed in bold
     * @param {string} sub      Secondary info line (ID, email, grade, etc.)
     * @param {string} color    CSS gradient string for the avatar circle background
     */
    const PersonChip = ({ initial, name, sub, color }) => (
        <div className="up-person-chip">
            {/* Circular avatar showing the first letter of the person's name */}
            <div className="up-person-avatar" style={{ background: color }}>{initial}</div>
            <div>
                <div className="up-person-name">{name}</div>
                <div className="up-person-sub">{sub}</div>
            </div>
        </div>
    );

    // ─────────────────────────────────────────────────────────────────────────
    // Early-return: Loading state
    // ─────────────────────────────────────────────────────────────────────────
    // Show a large centred spinner while the profile API call is in-flight.
    // Once the call finishes (success or error) `loading` is set to false
    // and we fall through to the main render below.
    if (loading) {
        return (
            <div className="up-center">
                {/* up-big-spinner is a CSS-only rotating ring (see Students.css) */}
                <div className="up-big-spinner" />
                <p style={{ color: '#94a3b8', marginTop: '16px', fontWeight: 600 }}>
                    Loading profile…
                </p>
            </div>
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Early-return: Error state
    // ─────────────────────────────────────────────────────────────────────────
    // Shown when the API returned an error JSON or the request failed entirely.
    if (error) {
        return (
            <div className="up-center">
                <div style={{ fontSize: '48px' }}>⚠️</div>
                <p style={{ color: '#ef4444', fontWeight: 700, marginTop: '12px' }}>{error}</p>
            </div>
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Main render – profile is loaded and error-free
    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div className="up-wrapper">

            {/*
              * Decorative blurred orbs positioned with CSS (up-orb-1, up-orb-2).
              * They are purely visual and do not capture mouse events.
              */}
            <div className="up-orb up-orb-1" />
            <div className="up-orb up-orb-2" />

            {/* All profile content is stacked vertically inside this container */}
            <div className="up-content">

                {/* ══════════════════════════════════════════════════════════════
                    SECTION 1 – HERO CARD
                    Shows the avatar, full name, ID pill, role badge, and email.
                    ══════════════════════════════════════════════════════════════ */}
                <div className="up-hero-card">

                    {/*
                      * Avatar circle – background is the role gradient (rc.gradient).
                      * Displays the FIRST CHARACTER of the user's name in uppercase.
                      * Falls back to '?' if the name is somehow empty.
                      */}
                    <div className="up-avatar" style={{ background: rc.gradient }}>
                        {profile.name ? profile.name.charAt(0).toUpperCase() : '?'}
                    </div>

                    {/* Text block beside the avatar */}
                    <div className="up-hero-info">
                        {/* Full name in large bold text */}
                        <h1 className="up-hero-name">{profile.name}</h1>

                        <div className="up-hero-meta">
                            {/*
                              * ID pill – a small grey capsule showing the user's
                              * database ID (e.g. "ID: S001")
                              */}
                            <span className="up-id-pill">ID: {profile.id}</span>

                            {/*
                              * Role badge – colour comes from roleConfig (rc.badge / rc.badgeBg).
                              * Shows "Student", "Teacher", or "Parent".
                              */}
                            <span
                                className="up-role-badge"
                                style={{ color: rc.badge, background: rc.badgeBg }}
                            >
                                {rc.label}
                            </span>
                        </div>

                        {/*
                          * Email address – only rendered if the backend returned one.
                          * Some accounts may not have an email stored.
                          */}
                        {profile.email && (
                            <p className="up-email">✉️ {profile.email}</p>
                        )}
                    </div>
                </div>

                {/* ══════════════════════════════════════════════════════════════
                    SECTION 2 – INFO CARDS GRID
                    Each InfoCard shows one piece of structured data.
                    Role-specific cards are rendered conditionally.
                    ══════════════════════════════════════════════════════════════ */}
                <div className="up-grid">

                    {/*
                      * STUDENT-ONLY: Grade / Class card
                      * Shows the student's assigned class (e.g. "Grade 10").
                      * Falls back to "Not assigned" if the field is empty.
                      */}
                    {profile.role?.toLowerCase() === 'student' && (
                        <InfoCard
                            icon="🎓"
                            label="Grade / Class"
                            value={profile.studentClass || 'Not assigned'}
                            accent="#7c5dfa"
                            bg="#f0ebff"
                        />
                    )}

                    {/*
                      * TEACHER-ONLY: Subject card
                      * Shows the subject this teacher is responsible for.
                      */}
                    {profile.role?.toLowerCase() === 'teacher' && (
                        <InfoCard
                            icon="📚"
                            label="Subject"
                            value={profile.subject || 'Not assigned'}
                            accent="#3498db"
                            bg="#e0f2fe"
                        />
                    )}

                    {/*
                      * PARENT-ONLY: Child ID card
                      * Shows the ID of the child linked to this parent account.
                      */}
                    {profile.role?.toLowerCase() === 'parent' && (
                        <InfoCard
                            icon="👶"
                            label="Child ID"
                            value={profile.childId || 'Not linked'}
                            accent="#10b981"
                            bg="#d1fae5"
                        />
                    )}

                    {/* User ID card – shown for ALL roles */}
                    <InfoCard
                        icon="🪪"
                        label="User ID"
                        value={profile.id}
                        accent="#f59e0b"
                        bg="#fef3c7"
                    />

                    {/* Role card – shows the human-readable role name for ALL roles */}
                    <InfoCard
                        icon="🏫"
                        label="Role"
                        value={rc.label}
                        accent={rc.badge}
                        bg={rc.badgeBg}
                    />
                </div>

                {/* ══════════════════════════════════════════════════════════════
                    SECTION 3 – PARENT INFO  (students only)
                    Displays the linked parent/guardian record fetched by the
                    backend.  The backend finds this by querying:
                      SELECT * FROM users WHERE child_id = <studentId>
                    ══════════════════════════════════════════════════════════════ */}
                {profile.role?.toLowerCase() === 'student' && (
                    <div className="up-linked-section">
                        <h3 className="up-section-title">
                            <span className="up-section-icon">👨‍👩‍👧</span> Parent / Guardian
                        </h3>

                        {profile.parentName ? (
                            /*
                             * A parent record was found – show their name, ID and email
                             * inside a PersonChip (green avatar + text block).
                             */
                            <PersonChip
                                initial={profile.parentName.charAt(0).toUpperCase()}
                                name={profile.parentName}
                                sub={`ID: ${profile.parentId}${profile.parentEmail ? ' · ' + profile.parentEmail : ''}`}
                                color="linear-gradient(135deg, #10b981 0%, #059669 100%)"
                            />
                        ) : (
                            /* No parent record is linked to this student yet */
                            <p className="up-no-data">No parent account linked to this student yet.</p>
                        )}
                    </div>
                )}

                {/* ══════════════════════════════════════════════════════════════
                    SECTION 4 – CHILD INFO  (parents only)
                    Displays the linked child record fetched by the backend.
                    The backend finds this by querying:
                      SELECT * FROM users WHERE id = <parent.child_id>
                    Only rendered when childName is non-empty (meaning the
                    backend successfully resolved the linked child).
                    ══════════════════════════════════════════════════════════════ */}
                {profile.role?.toLowerCase() === 'parent' && profile.childName && (
                    <div className="up-linked-section">
                        <h3 className="up-section-title">
                            <span className="up-section-icon">👦</span> My Child
                        </h3>
                        {/*
                          * Purple avatar PersonChip showing the child's name,
                          * grade (student_class), and database ID.
                          */}
                        <PersonChip
                            initial={profile.childName.charAt(0).toUpperCase()}
                            name={profile.childName}
                            sub={`Grade: ${profile.childClass || 'N/A'} · ID: ${profile.childId}`}
                            color="linear-gradient(135deg, #7c5dfa 0%, #a855f7 100%)"
                        />
                    </div>
                )}

                {/* ══════════════════════════════════════════════════════════════
                    SECTION 5 – SECURITY / CHANGE PASSWORD
                    Reuses the existing <ChangePassword> component so that
                    users can update their password directly from the profile page
                    without needing a separate "Change Password" tab.

                    The `user` prop is passed through so ChangePassword knows
                    which account to update (it uses user.id in the API call).
                    ══════════════════════════════════════════════════════════════ */}
                <div className="up-linked-section">
                    <h3 className="up-section-title">
                        <span className="up-section-icon">🔑</span> Security
                    </h3>
                    <ChangePassword user={user} />
                </div>

            </div>
        </div>
    );
};

export default UserProfile;
