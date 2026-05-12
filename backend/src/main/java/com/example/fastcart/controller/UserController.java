package com.example.fastcart.controller;

import com.example.fastcart.jwt.JwtUtil;
import com.example.fastcart.model.User;
import com.example.fastcart.repository.UserRepository;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@CrossOrigin("http://localhost:5173")
public class UserController {

    @Autowired
    private UserRepository userRepository;

   @PostMapping("/signup")
public Object signup(@RequestBody User user) {

    User existing =
            userRepository.findByEmail(user.getEmail());

    if(existing != null) {
        return "Email already exists";
    }

    return userRepository.save(user);
}

 @PostMapping("/login")
public Map<String, Object> login(
        @RequestBody User user
) {

    User existingUser =
            userRepository.findByEmail(user.getEmail());

    if(existingUser != null &&
            existingUser.getPassword()
                    .equals(user.getPassword())) {

        String token =
                JwtUtil.generateToken(existingUser.getId());

        Map<String, Object> response =
                new HashMap<>();

        response.put("token", token);
        response.put("user", existingUser);

        return response;
    }

    return null;

}
}