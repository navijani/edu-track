package com.edutrack.dao;

import com.edutrack.DBConnection;
import com.edutrack.models.User;
import com.edutrack.models.Teacher;
import org.mindrot.jbcrypt.BCrypt;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Types;

/**
 * Data Access Object (DAO) for managing User records in the database.
 * Handles CRUD operations for all user types (Students, Teachers, Parents)
 * using the Factory pattern for instantiation.
 */
public class UserDAO {

    /**
     * Saves a new user to the database.
     * 
     * @param user    The User object (can be Teacher, Student, or base User/Parent)
     * @param childId The ID of the associated child (if the user is a Parent)
     * @return true if the user was successfully inserted, false otherwise
     */
    public boolean saveUser(User user, String childId) {
        // Added child_id and student_class to the INSERT statement
        String sql = "INSERT INTO users (id, name, email, password, role, subject, child_id, student_class) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        try (Connection conn = DBConnection.getConnection();
                PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, user.getId());
            pstmt.setString(2, user.getName());
            pstmt.setString(3, user.getEmail());

            // Hash the password before saving
            String hashedPassword = BCrypt.hashpw(user.getPassword(), BCrypt.gensalt());
            pstmt.setString(4, hashedPassword);

            pstmt.setString(5, user.getRole());

            // Handle Teacher Subject
            if (user instanceof Teacher) {
                pstmt.setString(6, ((Teacher) user).getSubject());
            } else {
                pstmt.setNull(6, Types.VARCHAR); // Using setNull is cleaner for databases than empty strings
            }

            // Handle Parent childId
            if (childId != null && !childId.trim().isEmpty()) {
                pstmt.setString(7, childId);
            } else {
                pstmt.setNull(7, Types.VARCHAR);
            }

            // Handle Student Class
            if (user instanceof com.edutrack.models.Student) {
                pstmt.setString(8, ((com.edutrack.models.Student) user).getStudentClass());
            } else {
                pstmt.setNull(8, Types.VARCHAR);
            }

            return pstmt.executeUpdate() > 0;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Deletes a user from the database by their unique ID.
     * 
     * @param id The unique identifier of the user to delete
     * @return true if the deletion was successful, false otherwise
     */
    public boolean deleteUser(String id) {
        String sql = "DELETE FROM users WHERE id = ?";
        try (Connection conn = DBConnection.getConnection();
                PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, id);
            return pstmt.executeUpdate() > 0;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Retrieves all users from the database and formats them as a JSON array
     * string.
     * Extracts polymorphic properties (subject, student_class) and formats them for
     * the frontend.
     * 
     * @return A JSON formatted string containing all user records
     */
    public String getAllUsersJson() {
        StringBuilder json = new StringBuilder("[");
        String sql = "SELECT id, name, email, role, subject, child_id, student_class FROM users";
        try (Connection conn = DBConnection.getConnection();
                PreparedStatement pstmt = conn.prepareStatement(sql);
                ResultSet rs = pstmt.executeQuery()) {

            boolean first = true;
            while (rs.next()) {
                if (!first)
                    json.append(",");

                String id = rs.getString("id");
                String name = rs.getString("name");
                String email = rs.getString("email");
                String role = rs.getString("role");
                String subject = rs.getString("subject");
                String childId = rs.getString("child_id");
                String studentClass = rs.getString("student_class");

                // 1. Use the Factory during fetching operations as stated in the report
                User user = com.edutrack.models.UserFactory.createUser(id, name, email, "", role, subject,
                        studentClass);

                String displaySubject = (user instanceof Teacher) ? ((Teacher) user).getSubject() : "None";
                String displayChildId = (childId == null) ? "None" : childId;
                String displayStudentClass = (user instanceof com.edutrack.models.Student)
                        ? ((com.edutrack.models.Student) user).getStudentClass()
                        : "None";

                // 2. Build JSON from the actual Factory-created object
                json.append("{\"id\":\"").append(user.getId())
                        .append("\",\"name\":\"").append(user.getName())
                        .append("\",\"email\":\"").append(user.getEmail())
                        .append("\",\"role\":\"").append(user.getRole())
                        .append("\",\"subject\":\"").append(displaySubject)
                        .append("\",\"childId\":\"").append(displayChildId)
                        .append("\",\"studentClass\":\"").append(displayStudentClass).append("\"}");
                first = false;
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        json.append("]");
        return json.toString();
    }

    /**
     * Changes a user's password after verifying their current password.
     *
     * Steps:
     *   1. SELECT the stored BCrypt hash for the given userId.
     *   2. Use BCrypt.checkpw() to verify the supplied currentPassword.
     *   3. If valid, hash newPassword with a fresh salt and UPDATE the row.
     *
     * This two-step approach (SELECT then UPDATE) is intentional: it lets us
     * verify the current password without re-authenticating through LoginHandler.
     *
     * @param userId          The user's unique ID
     * @param currentPassword The plain-text current password to verify
     * @param newPassword     The plain-text new password to hash and store
     * @return true if the update was successful, false if the user was not found
     *         or the current password did not match the stored hash
     */
    public boolean changePassword(String userId, String currentPassword, String newPassword) {

        // Step 1: Fetch only the stored password hash for this user
        // (We never expose the hash to the caller; it stays inside this method)
        String selectSql = "SELECT password FROM users WHERE id = ?";
        try (Connection conn = DBConnection.getConnection();
                PreparedStatement selectStmt = conn.prepareStatement(selectSql)) {

            selectStmt.setString(1, userId);
            ResultSet rs = selectStmt.executeQuery();

            // If no row was returned the userId does not exist – abort
            if (!rs.next()) {
                return false; // User not found
            }

            // Retrieve the BCrypt hash that was stored at registration / last password change
            String storedHash = rs.getString("password");

            // Step 2: BCrypt.checkpw() re-hashes `currentPassword` using the salt
            // embedded in `storedHash` and compares the results in constant time.
            // Returns false without touching the database if the password is wrong.
            if (!BCrypt.checkpw(currentPassword, storedHash)) {
                return false; // Wrong current password – deny the change
            }

            // Step 3: Generate a fresh BCrypt hash for the new password.
            // BCrypt.gensalt() creates a new random salt each time, so even
            // two users with identical passwords will have different stored hashes.
            String newHash = BCrypt.hashpw(newPassword, BCrypt.gensalt());

            // Overwrite the password column for this user only
            String updateSql = "UPDATE users SET password = ? WHERE id = ?";
            try (PreparedStatement updateStmt = conn.prepareStatement(updateSql)) {
                updateStmt.setString(1, newHash);
                updateStmt.setString(2, userId);
                // executeUpdate returns the number of rows affected; > 0 means success
                return updateStmt.executeUpdate() > 0;
            }
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Authenticates a user by checking their ID, role, and verifying their password
     * hash.
     * Uses the Factory pattern to return the correct polymorphic User instance.
     * 
     * @param id       The user's ID
     * @param password The raw password provided during login
     * @param role     The role the user is attempting to log in as
     * @return The authenticated User object (Teacher, Student, or User) if
     *         successful, null otherwise
     */
    public User authenticateUser(String id, String password, String role) {
        // Fetch user by id and role only
        String sql = "SELECT * FROM users WHERE id = ? AND role = ?";

        try (Connection conn = DBConnection.getConnection();
                PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, id);
            pstmt.setString(2, role);
            ResultSet rs = pstmt.executeQuery();

            if (rs.next()) {
                String dbPasswordHash = rs.getString("password");

                // Verify the plain text password against the stored hash////
                if (BCrypt.checkpw(password, dbPasswordHash)) {
                    String dbName = rs.getString("name");
                    String dbEmail = rs.getString("email");
                    String dbSubject = rs.getString("subject");
                    String dbStudentClass = rs.getString("student_class");

                    return com.edutrack.models.UserFactory.createUser(id, dbName, dbEmail, dbPasswordHash, role,
                            dbSubject, dbStudentClass);
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }

    /**
     * Fetches a complete profile for one user, including role-specific linked
     * records from the same `users` table.
     *
     * ─────────────────────────────────────────────────────────────────
     * Role-specific behaviour
     * ─────────────────────────────────────────────────────────────────
     *   STUDENT  → also queries the parent row where child_id = userId
     *              (the parent who registered with this student as their child)
     *   PARENT   → also queries the child row where id = parent.child_id
     *              (the student record linked at registration time)
     *   TEACHER  → no secondary query; subject comes from the base row
     *
     * All optional fields (subject, child_id, student_class, parent fields,
     * child fields) are returned as empty strings when not applicable so the
     * JSON structure is always consistent regardless of role.
     *
     * ─────────────────────────────────────────────────────────────────
     * Returned JSON keys
     * ─────────────────────────────────────────────────────────────────
     *   id, name, email, role,
     *   subject, studentClass, childId,
     *   parentId, parentName, parentEmail,
     *   childName, childClass
     *
     * @param userId  The database ID of the user whose profile is requested
     * @return        JSON string with all profile fields, or error JSON
     *                {"error":"User not found"} / {"error":"Server error"}
     */
    public String getUserProfile(String userId) {

        // ── Step 1: Base user query ───────────────────────────────────────────
        // We do NOT select the `password` column – it is a BCrypt hash and must
        // never be returned to the frontend.
        String sql = "SELECT id, name, email, role, subject, child_id, student_class FROM users WHERE id = ?";

        try (Connection conn = DBConnection.getConnection();
                PreparedStatement pstmt = conn.prepareStatement(sql)) {

            // Bind the userId parameter to prevent SQL injection
            pstmt.setString(1, userId);
            ResultSet rs = pstmt.executeQuery();

            // If the ResultSet has no rows, the user does not exist
            if (!rs.next()) {
                return "{\"error\":\"User not found\"}";
            }

            // ── Read base fields from the result set ──────────────────────────
            // Null-safe extraction: nullable columns (subject, child_id,
            // student_class) use a ternary to fall back to an empty string
            // so the JSON never contains a literal "null" value.
            String id           = rs.getString("id");
            String name         = rs.getString("name");
            String email        = rs.getString("email");
            String role         = rs.getString("role");
            String subject      = rs.getString("subject")       != null ? rs.getString("subject")       : "";
            String childId      = rs.getString("child_id")      != null ? rs.getString("child_id")      : "";
            String studentClass = rs.getString("student_class") != null ? rs.getString("student_class") : "";

            // ── Step 2: Role-specific secondary queries ───────────────────────
            // Initialise all linked-record fields to empty strings.
            // They will only be populated if the appropriate role branch runs.
            String parentName  = "";
            String parentEmail = "";
            String parentId    = "";
            String childName   = "";
            String childClass  = "";

            if ("student".equalsIgnoreCase(role)) {
                // ── STUDENT branch ─────────────────────────────────────────────
                // Find the parent account whose `child_id` column equals this
                // student's ID.  We also filter by role='parent' as a safety
                // guard in case child_id values are reused across roles.
                String parentSql = "SELECT id, name, email FROM users WHERE child_id = ? AND role = 'parent'";
                try (PreparedStatement ps = conn.prepareStatement(parentSql)) {
                    ps.setString(1, userId);
                    ResultSet pr = ps.executeQuery();
                    if (pr.next()) {
                        // Populate parent fields (null-safe)
                        parentId    = pr.getString("id")    != null ? pr.getString("id")    : "";
                        parentName  = pr.getString("name")  != null ? pr.getString("name")  : "";
                        parentEmail = pr.getString("email") != null ? pr.getString("email") : "";
                    }
                    // If no parent row found, all three fields stay as empty strings
                }
            } else if ("parent".equalsIgnoreCase(role) && !childId.isEmpty()) {
                // ── PARENT branch ──────────────────────────────────────────────
                // Use the `child_id` we already read from the parent's own row
                // to look up the corresponding student record.
                // We only run this query if child_id is non-empty (i.e. a child
                // was actually linked when the parent account was registered).
                String childSql = "SELECT name, student_class FROM users WHERE id = ?";
                try (PreparedStatement ps = conn.prepareStatement(childSql)) {
                    ps.setString(1, childId);
                    ResultSet cr = ps.executeQuery();
                    if (cr.next()) {
                        // Populate child fields (null-safe)
                        childName  = cr.getString("name")          != null ? cr.getString("name")          : "";
                        childClass = cr.getString("student_class") != null ? cr.getString("student_class") : "";
                    }
                    // If the linked child row is missing, fields stay as empty strings
                }
            }
            // Teachers fall through both branches – no secondary query needed

            // ── Step 3: Build and return the complete JSON string ─────────────
            // String.format is used instead of a JSON library to keep the
            // project free of additional dependencies (consistent with the
            // rest of the backend codebase).
            // Field order matches the contract documented in ProfileHandler.
            return String.format(
                "{\"id\":\"%s\",\"name\":\"%s\",\"email\":\"%s\",\"role\":\"%s\"," +
                "\"subject\":\"%s\",\"studentClass\":\"%s\",\"childId\":\"%s\"," +
                "\"parentId\":\"%s\",\"parentName\":\"%s\",\"parentEmail\":\"%s\"," +
                "\"childName\":\"%s\",\"childClass\":\"%s\"}",
                id, name, email, role,          // base fields (all roles)
                subject, studentClass, childId, // role-specific base fields
                parentId, parentName, parentEmail, // student linked data
                childName, childClass              // parent linked data
            );

        } catch (Exception e) {
            // Log the full stack trace to the server console for debugging,
            // but return a safe error message to the frontend (no internal details)
            e.printStackTrace();
            return "{\"error\":\"Server error\"}";
        }
    }
}
