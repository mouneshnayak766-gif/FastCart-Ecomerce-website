package com.example.fastcart.service;

import com.example.fastcart.jwt.JwtUtil;
import com.example.fastcart.model.RefreshToken;
import com.example.fastcart.repository.RefreshTokenRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Map;

@Service
@Transactional
public class AuthService {

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    public RefreshToken createRefreshToken(Long userId) {
        // Delete any existing refresh token for this user
        // enforces single active session
        refreshTokenRepository.deleteByUserId(userId);

        RefreshToken rt = new RefreshToken();
        rt.setUserId(userId);
        rt.setToken(JwtUtil.generateRefreshTokenValue());
        rt.setExpiryDate(Instant.now().plusMillis(JwtUtil.getRefreshTokenExpiryMillis()));
        rt.setRevoked(false);
        return refreshTokenRepository.save(rt);
    }

    public Map<String, String> refreshAccessToken(String refreshTokenValue) {
        RefreshToken stored = refreshTokenRepository.findByToken(refreshTokenValue)
                .orElseThrow(() -> new RuntimeException("Invalid refresh token"));

        if (stored.isRevoked() || stored.getExpiryDate().isBefore(Instant.now())) {
            refreshTokenRepository.delete(stored);
            throw new RuntimeException("Refresh token expired or revoked");
        }

        String newAccessToken = JwtUtil.generateAccessToken(stored.getUserId());
        return Map.of("accessToken", newAccessToken);
    }

    public void revokeRefreshToken(String refreshTokenValue) {
        if (refreshTokenValue == null) return;
        refreshTokenRepository.findByToken(refreshTokenValue)
                .ifPresent(rt -> {
                    rt.setRevoked(true);
                    refreshTokenRepository.save(rt);
                });
    }

    public void revokeAllForUser(Long userId) {
        refreshTokenRepository.deleteByUserId(userId);
    }
}