package com.rockfallPredictionSystem.api_gateway.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;

@Component
public class JwtUtils {

    private static final Logger log = LoggerFactory.getLogger(JwtUtils.class);

    // Minimum 256 bits (32 bytes) required for HMAC-SHA256
    private static final int MIN_KEY_BYTES = 32;

    @Value("${jwt.secret:${JWT_SECRET:}}")
    private String secret;

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
                    log.info("API Gateway JWT signing key initialized successfully (algorithm: {}, key size: {} bits).",
                            this.signingKey.getAlgorithm(), keyBytes.length * 8);
                }
            }
        }
        return this.signingKey;
    }

    /**
     * Validates signature and expiration of the JWT token and extracts claims.
     *
     * @param token Compact serialized JWT string.
     * @return Claims payload if valid.
     * @throws ExpiredJwtException if the token has expired.
     * @throws JwtException        if the token signature is invalid, malformed, or tampered.
     * @throws IllegalArgumentException if token is null, empty, or invalid.
     */
    public Claims validateAndExtractClaims(String token) throws ExpiredJwtException, JwtException, IllegalArgumentException {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}

