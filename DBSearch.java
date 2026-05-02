import java.sql.*;

public class DBSearch {
    public static void main(String[] args) throws Exception {
        Class.forName("com.mysql.cj.jdbc.Driver");
        try (Connection conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/studentdb", "root", "")) {
            System.out.println("--- videos target_class ---");
            ResultSet rs = conn.createStatement().executeQuery("SELECT DISTINCT target_class FROM videos");
            while (rs.next())
                System.out.println(rs.getString(1));

            System.out.println("--- users student_class ---");
            ResultSet rs2 = conn.createStatement()
                    .executeQuery("SELECT DISTINCT studentClass FROM users WHERE role='STUDENT'");
            while (rs2.next())
                System.out.println(rs2.getString(1));
        }
    }
}
