import java.sql.*;

public class DBSearch {
    public static void main(String[] args) throws Exception {
        Class.forName("com.mysql.cj.jdbc.Driver");
        try (Connection conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/studentdb", "root", "")) {
            System.out.println("Adding deadline column...");
            conn.createStatement().executeUpdate("ALTER TABLE quizzes ADD COLUMN deadline VARCHAR(50) DEFAULT '' AFTER scheduled_date;");
            System.out.println("Column added successfully!");
        }
    }
}
