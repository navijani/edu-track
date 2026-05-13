import java.sql.*;

public class DBSearch {
    public static void main(String[] args) throws Exception {
        Class.forName("com.mysql.cj.jdbc.Driver");
        try (Connection conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/studentdb", "root", "")) {
            ResultSet rs = conn.createStatement().executeQuery("SELECT id, name, role FROM users WHERE email='tt@gmail.com'");
            while (rs.next())
                System.out.println(rs.getString("id") + " - " + rs.getString("name") + " - " + rs.getString("role"));
        }
    }
}
