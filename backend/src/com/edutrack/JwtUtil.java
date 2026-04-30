package com.edutrack;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.util.Date;

/**
 * JwtUtil – The "Security Guard" of EduTrack.
 * 
 * A JWT (JSON Web Token) is like a digital passport. It consists of three parts 
 * separated by dots: [Header].[Payload].[Signature]
 * 
 * This class handles:
 * 1. Issuing Passports (generateToken) - Given to users when they log in.
 * 2. Checking Passports (validateToken) - Verified on every request.
 */
public class JwtUtil {

    /**
     * SECRET_KEY: The "Seal" used to sign the passport.
     * Only the server knows this. If a user changes even one letter in the 
     * token, the signature will no longer match this key.
     */
    private static final String SECRET_KEY = "EduTrack_Super_Secret_Key_2026_!@#$";
    
    /**
     * EXPIRATION_TIME: How long the passport is valid (24 hours).
     * After this, the user must log in again to get a fresh token.
     */
    private static final long EXPIRATION_TIME = 86400000; 

    /**
     * generateToken – Creates a signed digital passport.
     * 
     * @param userId The ID of the user (Subject)
     * @param role   The permissions of the user
     * @return A string in the format: AAAAA.BBBBB.CCCCC
     */
    public static String generateToken(String userId, String role) {
        try {
            // PART 1: The Header
            // Defines the algorithm (HS256) used to sign the token.
            String header = "{\"alg\":\"HS256\",\"typ\":\"JWT\"}";
            
            // PART 2: The Payload (The Claims)
            // Contains the user data. "iat" is Issued At, "exp" is Expiration.
            long now = System.currentTimeMillis();
            String payload = String.format(
                "{\"sub\":\"%s\",\"role\":\"%s\",\"iat\":%d,\"exp\":%d}",
                userId, role, now / 1000, (now + EXPIRATION_TIME) / 1000
            );

            // Encode parts to Base64 to make them URL-friendly
            String encodedHeader = base64Encode(header);
            String encodedPayload = base64Encode(payload);

            // PART 3: The Signature
            // We combine Header + Payload and "sign" it using our SECRET_KEY.
            // This prevents anyone from tampering with the data.
            String dataToSign = encodedHeader + "." + encodedPayload;
            String signature = hmacSha256(dataToSign, SECRET_KEY);

            return dataToSign + "." + signature;

        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    /**
     * validateTokenAndGetUserId – Verifies the passport is authentic and valid.
     * 
     * @param token The token string from the Authorization header.
     * @return The userId if the passport is real and unexpired; otherwise null.
     */
    public static String validateTokenAndGetUserId(String token) {
        if (token == null || !token.contains(".")) return null;

        try {
            // Split the passport into its 3 parts
            String[] parts = token.split("\\.");
            if (parts.length != 3) return null;

            String encodedHeader = parts[0];
            String encodedPayload = parts[1];
            String signature = parts[2];

            // 1. VERIFY SIGNATURE
            // We re-calculate the signature using the Header + Payload we received.
            // If it matches the signature on the token, we know it hasn't been tampered with.
            String dataToSign = encodedHeader + "." + encodedPayload;
            String expectedSignature = hmacSha256(dataToSign, SECRET_KEY);

            if (!expectedSignature.equals(signature)) {
                System.out.println("JWT SECURITY ALERT: Someone tried to use a fake token!");
                return null;
            }

            // 2. VERIFY EXPIRATION
            // Decode the payload to check the "exp" timestamp.
            String payloadJson = new String(Base64.getUrlDecoder().decode(encodedPayload), StandardCharsets.UTF_8);
            long expTime = Long.parseLong(extractJsonValue(payloadJson, "exp"));
            
            if (System.currentTimeMillis() / 1000 > expTime) {
                System.out.println("JWT INFO: User session has expired.");
                return null;
            }

            // 3. EXTRACT USER IDENTITY
            // Return the "sub" (Subject) which is the User ID.
            return extractJsonValue(payloadJson, "sub");

        } catch (Exception e) {
            System.err.println("JWT VALIDATION FAILED: " + e.getMessage());
            return null;
        }
    }

    /**
     * hmacSha256 – Helper to create a cryptographic signature.
     * It's like a wax seal that can only be created by the owner of the SECRET_KEY.
     */
    private static String hmacSha256(String data, String secret) throws Exception {
        Mac sha256_HMAC = Mac.getInstance("HmacSHA256");
        SecretKeySpec secret_key = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        sha256_HMAC.init(secret_key);
        byte[] hash = sha256_HMAC.doFinal(data.getBytes(StandardCharsets.UTF_8));
        // Encode binary hash as a URL-safe string
        return Base64.getUrlEncoder().withoutPadding().encodeToString(hash);
    }

    private static String base64Encode(String data) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(data.getBytes(StandardCharsets.UTF_8));
    }

    /**
     * extractJsonValue – A simple helper to get values from the JSON string 
     * without needing a bulky external library.
     */
    private static String extractJsonValue(String json, String key) {
        String search = "\"" + key + "\":";
        int start = json.indexOf(search);
        if (start == -1) return "";
        start += search.length();
        
        if (json.charAt(start) == '\"') {
            start++;
            int end = json.indexOf("\"", start);
            return json.substring(start, end);
        } else {
            int end1 = json.indexOf(",", start);
            int end2 = json.indexOf("}", start);
            int end = (end1 != -1 && end1 < end2) ? end1 : end2;
            return json.substring(start, end).trim();
        }
    }
}
