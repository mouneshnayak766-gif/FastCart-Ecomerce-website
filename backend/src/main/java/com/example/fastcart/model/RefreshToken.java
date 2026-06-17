package com.example.fastcart.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "refresh_tokens", indexes = {
    @Index(name = "idx_refresh_tokens_user_id", columnList = "userId"),
    @Index(name = "idx_refresh_tokens_token", columnList = "token")
})
public class RefreshToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 512)
    private String token;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private Instant expiryDate;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    /**
     * ADDED: Tracks whether this token was issued with "Remember Me".
     * Controls expiry duration: 1 day (normal) vs 30 days (remember me).
     * Also useful for displaying active sessions to the user.
     */
    @Column(nullable = false)
    private boolean rememberMe = false;

    /**
     * KEEP: revoked flag is still useful for reuse-detection scenarios
     * (see AuthService). When a revoked token is presented again, it signals
     * possible token theft — at that point we nuke ALL tokens for the user.
     */
    @Column(nullable = false)
    private boolean revoked = false;

    // --- Getters & Setters ---

    public Long getId() { return id; }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public Instant getExpiryDate() { return expiryDate; }
    public void setExpiryDate(Instant expiryDate) { this.expiryDate = expiryDate; }

    public Instant getCreatedAt() { return createdAt; }

    public boolean isRememberMe() { return rememberMe; }
    public void setRememberMe(boolean rememberMe) { this.rememberMe = rememberMe; }

    public boolean isRevoked() { return revoked; }
    public void setRevoked(boolean revoked) { this.revoked = revoked; }
}
