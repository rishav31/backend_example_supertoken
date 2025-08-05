package com.example.supertokensdemo.controller;

import io.supertokens.session.Session;
import io.supertokens.session.exceptions.UnauthorisedException;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ApiController {

    @GetMapping("/public/hello")
    public ResponseEntity<?> publicHello() {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Hello from public endpoint!");
        response.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/protected/profile")
    public ResponseEntity<?> getProfile(@RequestHeader("Authorization") String sessionHandle) {
        try {
            if (sessionHandle != null && sessionHandle.startsWith("Bearer ")) {
                String token = sessionHandle.substring(7);
                Session.SessionInformation sessionInfo = Session.getSession(token, null);

                Map<String, Object> response = new HashMap<>();
                response.put("message", "Hello from protected endpoint!");
                response.put("userId", sessionInfo.userId);
                response.put("sessionHandle", sessionInfo.sessionHandle);
                response.put("timestamp", System.currentTimeMillis());
                
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

    @PostMapping("/protected/update-profile")
    public ResponseEntity<?> updateProfile(
            @RequestHeader("Authorization") String sessionHandle,
            @RequestBody UpdateProfileRequest request) {
        try {
            if (sessionHandle != null && sessionHandle.startsWith("Bearer ")) {
                String token = sessionHandle.substring(7);
                Session.SessionInformation sessionInfo = Session.getSession(token, null);

                // Here you would typically update user data in your database
                // For demo purposes, we'll just return success
                
                Map<String, Object> response = new HashMap<>();
                response.put("message", "Profile updated successfully!");
                response.put("userId", sessionInfo.userId);
                response.put("updatedData", request);
                response.put("timestamp", System.currentTimeMillis());
                
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

    @GetMapping("/health")
    public ResponseEntity<?> healthCheck() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "OK");
        response.put("service", "SuperTokens Demo API");
        response.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(response);
    }

    // Request DTO
    public static class UpdateProfileRequest {
        private String name;
        private String bio;

        // Getters and setters
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getBio() { return bio; }
        public void setBio(String bio) { this.bio = bio; }
    }
}
