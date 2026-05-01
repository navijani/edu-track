import java.sql.*;
public class CreateTable {
    public static void main(String[] args) throws Exception {
        Class.forName("com.mysql.cj.jdbc.Driver");
        try (Connection conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/studentdb", "root", "")) {
            String sql = "CREATE TABLE IF NOT EXISTS notifications (" +
                         "id INT AUTO_INCREMENT PRIMARY KEY," +
                         "teacher_id VARCHAR(255)," +
                         "target_class VARCHAR(255)," +
                         "subject VARCHAR(255)," +
                         "content_type VARCHAR(255)," +
                         "title VARCHAR(255)," +
                         "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP" +
                         ")";
            conn.createStatement().execute(sql);
            System.out.println("Table 'notifications' created successfully.");
        }
    }
}
