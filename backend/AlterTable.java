import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;

public class AlterTable {
    public static void main(String[] args) {
        String url = "jdbc:mysql://edu-track-edu-track.l.aivencloud.com:26238/defaultdb?sslMode=REQUIRED";
        
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
            Connection conn = DriverManager.getConnection(url, "avnadmin", "YOUR_AIVEN_PASSWORD_HERE");
            Statement stmt = conn.createStatement();
            
            try {
                stmt.execute("ALTER TABLE users ADD COLUMN child_id VARCHAR(50);");
                System.out.println("Column child_id added successfully!");
            } catch (Exception e) {
                System.out.println("Column might already exist or error: " + e.getMessage());
            }
            
            conn.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
