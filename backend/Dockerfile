FROM eclipse-temurin:21-jdk-jammy
WORKDIR /app

# Copy the libraries and source code
COPY lib/ /app/lib/
COPY src/ /app/src/

# Create a bin directory for compiled classes
RUN mkdir -p /app/bin

# Find all Java files and compile them into the bin directory
RUN find src -name "*.java" > sources.txt
RUN javac -d /app/bin -cp "lib/*" @sources.txt

# The application runs on port 8080 (as defined in Main.java)
EXPOSE 8080

# Run the Main class, making sure to include both the compiled classes and the MySQL library in the classpath
CMD ["java", "-cp", "/app/bin:lib/*", "com.edutrack.Main"]
