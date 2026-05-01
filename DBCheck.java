import java.sql.*;
public class DBCheck {
    public static void main(String[] args) throws Exception {
        Class.forName("com.mysql.cj.jdbc.Driver");
        try (Connection conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/studentdb", "root", "")) {
            System.out.println("--- notifications table ---");
            ResultSet rs = conn.createStatement().executeQuery("SELECT * FROM notifications ORDER BY created_at DESC LIMIT 5");
            boolean any = false;
            while (rs.next()) {
                any = true;
                System.out.println("ID:" + rs.getInt("id") + " class:" + rs.getString("target_class") + " type:" + rs.getString("content_type") + " title:" + rs.getString("title"));
            }
            if (!any) System.out.println("(empty - no notifications yet)");
        }
    }
}
