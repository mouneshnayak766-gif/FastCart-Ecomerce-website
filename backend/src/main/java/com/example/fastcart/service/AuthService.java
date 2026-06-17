package com.example.fastcart.service;

import com.example.fastcart.jwt.JwtUtil;
import com.example.fastcart.model.RefreshToken;
import com.example.fastcart.repository.RefreshTokenRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.Map;

@Service
@Transactional
public class AuthService {

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @Autowired
    private JwtUtil jwtUtil; // FIX: JwtUtil is now a @Component, inject it

    /**
     * FIX: Added `rememberMe` parameter.
     * - rememberMe=false → 1 day expiry (session-like)
     * - rememberMe=true  → 30 days expiry
     *
     * NOTE: This still deletes all existing tokens for the user on login,
     * enforcing single active session. If you want multi-device (phone + laptop),
     * remove the deleteByUserId call and store a deviceId or userAgent per token.
     */
    public RefreshToken createRefreshToken(Long userId, boolean rememberMe) {
        // Single session: kick out any existing session for this user
        refreshTokenRepository.deleteByUserId(userId);

        long expiryMillis = rememberMe
                ? JwtUtil.REFRESH_TOKEN_EXPIRY_REMEMBER_ME   // 30 days
                : JwtUtil.REFRESH_TOKEN_EXPIRY_DEFAULT;       // 1 day

        RefreshToken rt = new RefreshToken();
        rt.setUserId(userId);
        rt.setToken(JwtUtil.generateRefreshTokenValue());
        rt.setExpiryDate(Instant.now().plusMillis(expiryMillis));
        rt.setRememberMe(rememberMe);
        rt.setRevoked(false);
        return refreshTokenRepository.save(rt);
    }

    /**
     * FIX 1 (CRITICAL): Refresh token rotation.
     *   Old code reused the same refresh token forever — one stolen token = 7 days
     *   of silent unauthorized access. Now every /refresh call issues a NEW refresh
     *   token and the old one becomes invalid.
     *
     * FIX 2: Reuse detection.
     *   If a REVOKED token is presented, that means either:
     *     (a) The frontend has a stale token (bug), OR
     *     (b) An attacker got the old token after rotation (token theft).
     *   The safe response is to nuke ALL sessions for that user, forcing re-login
     *   on all devices.
     *
     * FIX 3: ResponseStatusException instead of RuntimeException.
     *   RuntimeException → Spring returns HTTP 500. That's wrong for auth failures.
     *   ResponseStatusException(HttpStatus.UNAUTHORIZED) → HTTP 401.
     *
     * RETURNS: Both new accessToken AND new refreshToken.
     *   Your frontend axios interceptor must update the stored refresh token
     *   on every successful /refresh response.
     */
    public Map<String, String> refreshAccessToken(String refreshTokenValue) {
        RefreshToken stored = refreshTokenRepository.findByToken(refreshTokenValue)
                .orElseThrow(() ->
                    new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid refresh token"));

        // Reuse detection: revoked token presented again → possible theft
        if (stored.isRevoked()) {
            // Nuclear option: invalidate ALL sessions for this user
            refreshTokenRepository.deleteByUserId(stored.getUserId());
            throw new ResponseStatusException(
                HttpStatus.UNAUTHORIZED,
                "Refresh token reuse detected — all sessions terminated"
            );
        }

        if (stored.getExpiryDate().isBefore(Instant.now())) {
            refreshTokenRepository.delete(stored);
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Refresh token expired. Please log in again.");
        }

        // ROTATION: mark old token revoked first (for reuse detection window),
        // then generate and persist a new token with the same expiry policy.
        stored.setRevoked(true);
        refreshTokenRepository.save(stored);

        // Preserve the rememberMe policy from the original token
        long expiryMillis = stored.isRememberMe()
                ? JwtUtil.REFRESH_TOKEN_EXPIRY_REMEMBER_ME
                : JwtUtil.REFRESH_TOKEN_EXPIRY_DEFAULT;

        RefreshToken newToken = new RefreshToken();
        newToken.setUserId(stored.getUserId());
        newToken.setToken(JwtUtil.generateRefreshTokenValue());
        newToken.setExpiryDate(Instant.now().plusMillis(expiryMillis)); // sliding expiry
        newToken.setRememberMe(stored.isRememberMe());
        newToken.setRevoked(false);
        refreshTokenRepository.save(newToken);

        String newAccessToken = jwtUtil.generateAccessToken(stored.getUserId());

        // Return BOTH tokens — frontend must store the new refresh token
        return Map.of(
            "accessToken", newAccessToken,
            "refreshToken", newToken.getToken()
        );
    }

    /**
     * FIX: Old code marked token as revoked but left the row in the DB.
     * On logout, just delete it — cleaner, no orphaned rows.
     * The reuse-detection window (revoked flag) is only needed during the
     * brief rotation window in refreshAccessToken, not for explicit logouts.
     */
    public void revokeRefreshToken(String refreshTokenValue) {
        if (refreshTokenValue == null || refreshTokenValue.isBlank()) return;
        refreshTokenRepository.findByToken(refreshTokenValue)
                .ifPresent(refreshTokenRepository::delete);
    }

    public void revokeAllForUser(Long userId) {
        refreshTokenRepository.deleteByUserId(userId);
    }
}
