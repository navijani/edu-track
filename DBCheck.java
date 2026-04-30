import java.sql.*;
public class DBCheck {
    public static void main(String[] args) throws Exception {
        Class.forName("com.mysql.cj.jdbc.Driver");
        try (Connection conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/studentdb", "root", "")) {
            ResultSet rs = conn.createStatement().executeQuery("SELECT * FROM subjects");
            while (rs.next()) {
                System.out.println("Subject Title: '" + rs.getString("title") + "'");
            }
        }
    }
}
