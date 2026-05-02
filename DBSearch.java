import java.sql.*;

public class DBSearch {
    public static void main(String[] args) throws Exception {
        Class.forName("com.mysql.cj.jdbc.Driver");
        try (Connection conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/studentdb", "root", "")) {
            System.out.println("--- users table columns ---");
            ResultSet rs = conn.createStatement().executeQuery("DESCRIBE users");
            while (rs.next())
                System.out.println(rs.getString("Field") + " - " + rs.getString("Type"));
        }
    }
}
