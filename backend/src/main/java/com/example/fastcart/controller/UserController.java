package com.example.fastcart.controller;

import com.example.fastcart.jwt.JwtUtil;
import com.example.fastcart.model.RefreshToken;
import com.example.fastcart.model.User;
import com.example.fastcart.repository.UserRepository;
import com.example.fastcart.service.AuthService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuthService authService;

    private BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    // ── SIGNUP ────────────────────────────────────────────────────────────────

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody User user) {
        if (user.getEmail() == null || user.getPassword() == null) {
            return ResponseEntity.badRequest().body("Email and Password Required");
        }
        if (userRepository.findByEmail(user.getEmail()) != null) {
            return ResponseEntity.badRequest().body("Email Already Exists");
        }
        user.setPassword(encoder.encode(user.getPassword()));
        userRepository.save(user);
        return ResponseEntity.ok("Signup Successful");
    }

    // ── LOGIN ─────────────────────────────────────────────────────────────────

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User loginUser) {
        if (loginUser.getEmail() == null || loginUser.getPassword() == null) {
            return ResponseEntity.badRequest().body("Email and Password Required");
        }
        User user = userRepository.findByEmail(loginUser.getEmail());
        if (user == null) {
            return ResponseEntity.status(401).body("Invalid Email");
        }
        if (!encoder.matches(loginUser.getPassword(), user.getPassword())) {
            return ResponseEntity.status(401).body("Invalid Password");
        }

        String accessToken = JwtUtil.generateAccessToken(user.getId());
        RefreshToken refreshToken = authService.createRefreshToken(user.getId());

        Map<String, Object> response = new HashMap<>();
        response.put("accessToken", accessToken);
        response.put("refreshToken", refreshToken.getToken());

        Map<String, Object> userData = new HashMap<>();
        userData.put("id", user.getId());
        userData.put("name", user.getName());
        userData.put("email", user.getEmail());
        userData.put("phoneNumber", user.getPhoneNumber());
        userData.put("address", user.getAddress());
        response.put("user", userData);

        return ResponseEntity.ok(response);
    }

    // ── REFRESH ───────────────────────────────────────────────────────────────

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@RequestBody Map<String, String> body) {
        try {
            return ResponseEntity.ok(authService.refreshAccessToken(body.get("refreshToken")));
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).body(Map.of("message", e.getMessage()));
        }
    }

    // ── LOGOUT ────────────────────────────────────────────────────────────────

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestBody Map<String, String> body) {
        authService.revokeRefreshToken(body.get("refreshToken"));
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }

    // ── PROFILE ───────────────────────────────────────────────────────────────

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(@RequestAttribute("userId") Long userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return ResponseEntity.status(404).body("User not found");

        Map<String, Object> userData = new HashMap<>();
        userData.put("id", user.getId());
        userData.put("name", user.getName());
        userData.put("email", user.getEmail());
        userData.put("phoneNumber", user.getPhoneNumber());
        userData.put("address", user.getAddress());
        return ResponseEntity.ok(userData);
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(
            @RequestAttribute("userId") Long userId,
            @RequestBody User updatedData) {

        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return ResponseEntity.status(404).body("User not found");

        user.setName(updatedData.getName());
        user.setPhoneNumber(updatedData.getPhoneNumber());
        user.setAddress(updatedData.getAddress());
        userRepository.save(user);

        Map<String, Object> userData = new HashMap<>();
        userData.put("id", user.getId());
        userData.put("name", user.getName());
        userData.put("email", user.getEmail());
        userData.put("phoneNumber", user.getPhoneNumber());
        userData.put("address", user.getAddress());
        return ResponseEntity.ok(userData);
    }

    @PutMapping("/profile/change-password")
    public ResponseEntity<?> changePassword(
            @RequestAttribute("userId") Long userId,
            @RequestBody Map<String, String> passwordData) {

        String currentPassword = passwordData.get("currentPassword");
        String newPassword = passwordData.get("newPassword");

        if (currentPassword == null || newPassword == null) {
            return ResponseEntity.badRequest().body("Both current and new passwords are required");
        }
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return ResponseEntity.status(404).body("User not found");

        if (!encoder.matches(currentPassword, user.getPassword())) {
            return ResponseEntity.status(401).body("Incorrect current password");
        }
        user.setPassword(encoder.encode(newPassword));
        userRepository.save(user);
        return ResponseEntity.ok("Password updated successfully");
    }
}