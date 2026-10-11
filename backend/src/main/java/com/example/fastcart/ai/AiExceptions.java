package com.example.fastcart.ai;

public final class AiExceptions {
    private AiExceptions() {}

    public static class RateLimitExceededException extends RuntimeException {
        private final long retryAfterSeconds;
        public RateLimitExceededException(long retryAfterSeconds) {
            super("Too many requests");
            this.retryAfterSeconds = retryAfterSeconds;
        }
        public long getRetryAfterSeconds() { return retryAfterSeconds; }
    }

    public static class AiUnavailableException extends RuntimeException {
        public AiUnavailableException(String msg, Throwable cause) { super(msg, cause); }
    }

    public static class InvalidActionException extends RuntimeException {
        public InvalidActionException(String msg) { super(msg); }
    }
}
