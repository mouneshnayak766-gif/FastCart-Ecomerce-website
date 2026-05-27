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
}