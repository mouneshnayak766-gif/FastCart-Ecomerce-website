package com.example.fastcart.controller;

import com.example.fastcart.jwt.JwtUtil;
import com.example.fastcart.model.User;
import com.example.fastcart.repository.UserRepository;

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

    private BCryptPasswordEncoder encoder =
            new BCryptPasswordEncoder();

    // SIGNUP

    @PostMapping("/signup")
    public ResponseEntity<?> signup(
            @RequestBody User user
    ) {

        if (
                user.getEmail() == null
                ||
                user.getPassword() == null
        ) {

            return ResponseEntity
                    .badRequest()
                    .body("Email and Password Required");
        }

        User existingUser =
                userRepository.findByEmail(
                        user.getEmail()
                );

        if (existingUser != null) {

            return ResponseEntity
                    .badRequest()
                    .body("Email Already Exists");
        }

        // ENCRYPT PASSWORD

        user.setPassword(
                encoder.encode(
                        user.getPassword()
                )
        );

        userRepository.save(user);

        return ResponseEntity.ok(
                "Signup Successful"
        );
    }

    // LOGIN

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody User loginUser
    ) {

        User user =
                userRepository.findByEmail(
                        loginUser.getEmail()
                );

        if (user == null) {

            return ResponseEntity
                    .status(401)
                    .body("Invalid Email");
        }

        boolean matches =
                encoder.matches(
                        loginUser.getPassword(),
                        user.getPassword()
                );

        if (!matches) {

            return ResponseEntity
                    .status(401)
                    .body("Invalid Password");
        }

        String token =
                JwtUtil.generateToken(
                        user.getId()
                );

        Map<String, Object> response =
                new HashMap<>();

        response.put("token", token);

        // SAFE USER RESPONSE

        Map<String, Object> userData =
                new HashMap<>();

        userData.put("id", user.getId());
        userData.put("name", user.getName());
        userData.put("email", user.getEmail());
        userData.put("phoneNumber", user.getPhoneNumber());
        userData.put("address", user.getAddress());

        response.put("user", userData);

        return ResponseEntity.ok(response);
    }
// 1. GET PROFILE
    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(@RequestAttribute("userId") Long userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return ResponseEntity.status(404).body("User not found");
        }

        // Return safe user data without password
        Map<String, Object> userData = new HashMap<>();
        userData.put("id", user.getId());
        userData.put("name", user.getName());
        userData.put("email", user.getEmail());
        userData.put("phoneNumber", user.getPhoneNumber());
        userData.put("address", user.getAddress());

        return ResponseEntity.ok(userData);
    }

    // 2. UPDATE PROFILE
    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(
            @RequestAttribute("userId") Long userId,
            @RequestBody User updatedData
    ) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return ResponseEntity.status(404).body("User not found");
        }

        // Update fields safely
        user.setName(updatedData.getName());
        user.setPhoneNumber(updatedData.getPhoneNumber());
        user.setAddress(updatedData.getAddress());

        userRepository.save(user);

        // Prepare updated safe response data
        Map<String, Object> userData = new HashMap<>();
        userData.put("id", user.getId());
        userData.put("name", user.getName());
        userData.put("email", user.getEmail());
        userData.put("phoneNumber", user.getPhoneNumber());
        userData.put("address", user.getAddress());

        return ResponseEntity.ok(userData);
    }

    // 3. CHANGE PASSWORD
    @PutMapping("/profile/change-password")
    public ResponseEntity<?> changePassword(
            @RequestAttribute("userId") Long userId,
            @RequestBody Map<String, String> passwordData
    ) {
        String currentPassword = passwordData.get("currentPassword");
        String newPassword = passwordData.get("newPassword");

        if (currentPassword == null || newPassword == null) {
            return ResponseEntity.badRequest().body("Both current and new passwords are required");
        }

        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return ResponseEntity.status(404).body("User not found");
        }

        // Verify current password
        if (!encoder.matches(currentPassword, user.getPassword())) {
            return ResponseEntity.status(401).body("Incorrect current password");
        }

        // Encrypt and save new password
        user.setPassword(encoder.encode(newPassword));
        userRepository.save(user);

        return ResponseEntity.ok("Password updated successfully");
    }

}