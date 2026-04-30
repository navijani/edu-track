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
}