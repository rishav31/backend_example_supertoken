package com.example.supertokensdemo.controller;

import io.supertokens.emailpassword.EmailPassword;
import io.supertokens.emailpassword.exceptions.EmailAlreadyExistsException;
import io.supertokens.pluginInterface.exceptions.StorageQueryException;
import io.supertokens.pluginInterface.exceptions.StorageTransactionLogicException;
import io.supertokens.session.Session;
import io.supertokens.session.exceptions.UnauthorisedException;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @PostMapping("/signup")
    public ResponseEntity<?> signUp(@RequestBody SignUpRequest request) {
        try {
            // Create user with SuperTokens
            EmailPassword.User user = EmailPassword.signUp(
                request.getEmail(),
                request.getPassword()
            );

            Map<String, Object> response = new HashMap<>();
            response.put("status", "OK");
            response.put("user", Map.of(
                "id", user.id,
                "email", user.email,
                "timeJoined", user.timeJoined
            ));

            return ResponseEntity.ok(response);

        } catch (EmailAlreadyExistsException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("status", "EMAIL_ALREADY_EXISTS_ERROR");
            return ResponseEntity.badRequest().body(response);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("status", "GENERAL_ERROR");
            response.put("message", e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @PostMapping("/signin")
    public ResponseEntity<?> signIn(@RequestBody SignInRequest request) {
        try {
            // Sign in user with SuperTokens
            EmailPassword.User user = EmailPassword.signIn(
                request.getEmail(),
                request.getPassword()
            );

            Map<String, Object> response = new HashMap<>();
            response.put("status", "OK");
            response.put("user", Map.of(
                "id", user.id,
                "email", user.email,
                "timeJoined", user.timeJoined
            ));

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("status", "WRONG_CREDENTIALS_ERROR");
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/signout")
    public ResponseEntity<?> signOut(@RequestHeader("Authorization") String sessionHandle) {
        try {
            // Revoke session
            if (sessionHandle != null && sessionHandle.startsWith("Bearer ")) {
                String token = sessionHandle.substring(7);
                Session.revokeSession(token);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("status", "OK");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("status", "GENERAL_ERROR");
            response.put("message", e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @GetMapping("/session")
    public ResponseEntity<?> getSessionInfo(@RequestHeader("Authorization") String sessionHandle) {
        try {
            if (sessionHandle != null && sessionHandle.startsWith("Bearer ")) {
                String token = sessionHandle.substring(7);
                Session.SessionInformation sessionInfo = Session.getSession(token, null);

                Map<String, Object> response = new HashMap<>();
                response.put("status", "OK");
                response.put("sessionHandle", sessionInfo.sessionHandle);
                response.put("userId", sessionInfo.userId);
                response.put("userDataInJWT", sessionInfo.userDataInJWT);
                
                return ResponseEntity.ok(response);
            }

            return ResponseEntity.badRequest().body(Map.of("status", "INVALID_SESSION"));

        } catch (UnauthorisedException e) {
            return ResponseEntity.status(401).body(Map.of("status", "UNAUTHORISED"));
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("status", "GENERAL_ERROR");
            response.put("message", e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    // Request DTOs
    public static class SignUpRequest {
        private String email;
        private String password;

        // Getters and setters
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class SignInRequest {
        private String email;
        private String password;

        // Getters and setters
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }
}
