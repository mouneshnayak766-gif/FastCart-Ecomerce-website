package com.example.fastcart.ai;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/** Sliding-window limiter, in-memory. Single instance only; use Redis/Bucket4j if you scale out. */
@Component
public class AiRateLimiter {
    private final Map<String, Deque<Long>> hits = new ConcurrentHashMap<>();
    private final int limitPerMinute;

    public AiRateLimiter(@Value("${fastcart.ai.rate-limit.per-minute:15}") int limitPerMinute) {
        if (limitPerMinute < 1) {
            throw new IllegalArgumentException("fastcart.ai.rate-limit.per-minute must be at least 1");
        }
        this.limitPerMinute = limitPerMinute;
    }

    public void check(String key) {
        long now = System.currentTimeMillis();
        if (hits.size() > 10_000) {
            hits.values().removeIf(q -> { synchronized (q) { return q.isEmpty() || now - q.peekLast() > 60_000; } });
        }
        Deque<Long> q = hits.computeIfAbsent(key, k -> new ArrayDeque<>());
        synchronized (q) {
            while (!q.isEmpty() && now - q.peekFirst() > 60_000) q.pollFirst();
            if (q.size() >= limitPerMinute) {
                long retry = Math.max(1, (60_000 - (now - q.peekFirst())) / 1000);
                throw new AiExceptions.RateLimitExceededException(retry);
            }
            q.addLast(now);
        }
    }
}
