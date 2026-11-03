package com.rockfallPredictionSystem.data_service.util;

import com.rockfallPredictionSystem.data_service.entity.Role;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class JwtUtils {

    private static final Logger log = LoggerFactory.getLogger(JwtUtils.class);

    // Minimum 256 bits (32 bytes) required for HMAC-SHA256
    private static final int MIN_KEY_BYTES = 32;

    @Value("${jwt.secret:${JWT_SECRET:}}")
    private String secret;

    @Value("${jwt.expiration-ms:${JWT_EXPIRATION_MS:86400000}}")
    private long expirationMs;

    private volatile SecretKey signingKey;

    /**
     * Lazily resolves and validates the HMAC-SHA signing key.
     * Enforces that the key is read from configuration/environment, is valid Base64,
     * and is at least 256 bits (32 bytes) long.
     */
    public SecretKey getSigningKey() {
        if (this.signingKey == null) {
            synchronized (this) {
                if (this.signingKey == null) {
                    if (secret == null || secret.trim().isEmpty()) {
                        throw new IllegalStateException(
                                "JWT_SECRET configuration is missing or empty. " +
                                "A sufficiently strong Base64-encoded secret of at least 256 bits (32 bytes) must be set."
                        );
                    }

                    byte[] keyBytes;
                    try {
                        keyBytes = Decoders.BASE64.decode(secret.trim());
                    } catch (Exception ex) {
                        throw new IllegalStateException(
                                "JWT_SECRET must be a valid Base64-encoded string: " + ex.getMessage(), ex
                        );
                    }

                    if (keyBytes.length < MIN_KEY_BYTES) {
                        throw new IllegalStateException(
                                String.format(
                                        "JWT_SECRET is insufficiently strong. It must be at least 256 bits (32 bytes), " +
                                        "but decoded length is %d bits (%d bytes).",
                                        keyBytes.length * 8, keyBytes.length
                                )
                        );
                    }

                    this.signingKey = Keys.hmacShaKeyFor(keyBytes);
                    log.info("JWT signing key initialized successfully (algorithm: {}, key size: {} bits).",
                            this.signingKey.getAlgorithm(), keyBytes.length * 8);
                }
            }
        }
        return this.signingKey;
    }

    /**
     * Generates a signed JWT token containing userId, email, and role claims.
     *
     * @param userId The database primary key ID of the user.
     * @param email  The user's normalized email address (subject).
     * @param role   The user's authorization role.
     * @param name   The user's full name.
     * @return Compact, signed JWT string.
     */
    public String generateToken(Long userId, String email, Role role, String name) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expirationMs);

        return Jwts.builder()
                .subject(email)
                .claim("userId", userId)
                .claim("email", email)
                .claim("role", role != null ? role.name() : Role.USER.name())
                .claim("name", name)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(getSigningKey())
                .compact();
    }

    /**
     * Extracts all claims from a signed JWT token.
     */
    public Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public long getExpirationMs() {
        return expirationMs;
    }
}

