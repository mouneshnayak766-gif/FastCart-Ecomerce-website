package com.example.fastcart.jwt;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import java.security.Key;
import java.util.Date;
import java.util.UUID;

/**
 * CHANGED: Now a Spring @Component so the secret can be injected from
 * application.properties via @Value. All callers (JwtAuthFilter, controllers)
 * must @Autowired / constructor-inject this instead of using static calls.
 */
@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    private Key key;

    // 15 minutes — short-lived on purpose; refresh token handles longevity
    private static final long ACCESS_TOKEN_EXPIRY = 1000L * 60 * 15;

    // Default refresh expiry (no remember-me): 1 day
    public static final long REFRESH_TOKEN_EXPIRY_DEFAULT = 1000L * 60 * 60 * 24;

    // Remember-me refresh expiry: 30 days
    public static final long REFRESH_TOKEN_EXPIRY_REMEMBER_ME = 1000L * 60 * 60 * 24 * 30;

    @PostConstruct
    public void init() {
        if (secret == null || secret.length() < 32) {
            throw new IllegalStateException(
                "jwt.secret in application.properties must be at least 32 characters. " +
                "Generate with: openssl rand -hex 32"
            );
        }
        this.key = Keys.hmacShaKeyFor(secret.getBytes());
    }

    public String generateAccessToken(Long userId) {
        return Jwts.builder()
                .setSubject(String.valueOf(userId))
                .claim("type", "access")
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + ACCESS_TOKEN_EXPIRY))
                .signWith(key)
                .compact();
    }

    public static String generateRefreshTokenValue() {
        // Two UUIDs concatenated — 72 chars of cryptographic randomness
        return UUID.randomUUID() + "-" + UUID.randomUUID();
    }

    public Long extractUserId(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
        return Long.parseLong(claims.getSubject());
    }

    public Long getUserIdFromToken(String token) {
        return extractUserId(token);
    }

    /**
     * FIX: The old isTokenExpired() caught ALL exceptions and returned true,
     * meaning a tampered token (bad signature, malformed) was indistinguishable
     * from an expired token. This masked security violations.
     *
     * Now: only ExpiredJwtException → EXPIRED. Everything else → INVALID.
     * Your JwtAuthFilter should treat EXPIRED as "try refresh", INVALID as hard 401.
     */
    public TokenValidationResult validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
            return TokenValidationResult.VALID;
        } catch (ExpiredJwtException e) {
            return TokenValidationResult.EXPIRED;
        } catch (JwtException | IllegalArgumentException e) {
            // Covers: SignatureException, MalformedJwtException, UnsupportedJwtException
            return TokenValidationResult.INVALID;
        }
    }

    public enum TokenValidationResult {
        VALID,
        EXPIRED,   // Token is past expiry — candidate for silent refresh
        INVALID    // Tampered, malformed, or wrong key — hard reject, no retry
    }
}
