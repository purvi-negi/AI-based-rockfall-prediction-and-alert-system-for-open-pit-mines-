package com.rockfallPredictionSystem.api_gateway.filter;

import com.rockfallPredictionSystem.api_gateway.util.JwtUtils;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.ReactiveSecurityContextHolder;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;
import java.util.List;

/**
 * Reactive JWT Authentication WebFilter for Spring Cloud Gateway WebFlux.
 * Validates incoming Bearer JWT tokens, extracts claims (userId, email, role),
 * establishes Spring Security context with mapped authorities (ROLE_ADMIN, ROLE_USER),
 * and propagates verified identity headers (X-User-Id, X-User-Email, X-User-Role) downstream
 * while stripping any client-supplied spoofing headers.
 */
public class JwtAuthenticationWebFilter implements WebFilter {

    private static final Logger log = LoggerFactory.getLogger(JwtAuthenticationWebFilter.class);

    private final JwtUtils jwtUtils;

    public JwtAuthenticationWebFilter(JwtUtils jwtUtils) {
        this.jwtUtils = jwtUtils;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();

        // Preflight OPTIONS requests bypass JWT authentication
        if (HttpMethod.OPTIONS.equals(request.getMethod())) {
            return chain.filter(exchange);
        }

        String path = request.getPath().value();

        // Remove any client-supplied identity headers to prevent spoofing
        ServerHttpRequest.Builder requestBuilder = request.mutate()
                .headers(headers -> {
                    headers.remove("X-User-Id");
                    headers.remove("X-User-Email");
                    headers.remove("X-User-Role");
                });

        // Public auth endpoints bypass JWT requirement
        if (path.startsWith("/api/auth/")) {
            return chain.filter(exchange.mutate().request(requestBuilder.build()).build());
        }

        String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);

        // If no Authorization header or not Bearer, proceed with stripped headers and unauthenticated context
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return chain.filter(exchange.mutate().request(requestBuilder.build()).build());
        }

        String token = authHeader.substring(7).trim();
        if (token.isEmpty()) {
            return returnUnauthorized(exchange, "Bearer token is empty.");
        }

        Claims claims;
        try {
            claims = jwtUtils.validateAndExtractClaims(token);
        } catch (ExpiredJwtException ex) {
            log.warn("JWT token expired for request to {}: {}", path, ex.getMessage());
            return returnUnauthorized(exchange, "JWT token has expired.");
        } catch (JwtException | IllegalArgumentException ex) {
            log.warn("Invalid JWT token for request to {}: {}", path, ex.getMessage());
            return returnUnauthorized(exchange, "Invalid JWT token: " + ex.getMessage());
        }

        // Extract claims
        Object userIdObj = claims.get("userId");
        String userId = userIdObj != null ? String.valueOf(userIdObj) : "";
        String email = claims.get("email", String.class);
        if (email == null || email.isBlank()) {
            email = claims.getSubject();
        }
        String role = claims.get("role", String.class);
        if (role == null || role.isBlank()) {
            role = "USER";
        }
        String normalizedRole = role.trim().toUpperCase();

        // Convert role to Spring Security authority (ROLE_ADMIN, ROLE_USER)
        String authority = normalizedRole.startsWith("ROLE_") ? normalizedRole : "ROLE_" + normalizedRole;
        List<GrantedAuthority> authorities = List.of(new SimpleGrantedAuthority(authority));

        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(email, null, authorities);

        // Add verified identity headers before forwarding to downstream microservices
        if (!userId.isEmpty()) {
            requestBuilder.header("X-User-Id", userId);
        }
        if (email != null && !email.isEmpty()) {
            requestBuilder.header("X-User-Email", email);
        }
        requestBuilder.header("X-User-Role", normalizedRole);

        ServerWebExchange authenticatedExchange = exchange.mutate().request(requestBuilder.build()).build();

        return chain.filter(authenticatedExchange)
                .contextWrite(ReactiveSecurityContextHolder.withAuthentication(authentication));
    }

    private Mono<Void> returnUnauthorized(ServerWebExchange exchange, String message) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(HttpStatus.UNAUTHORIZED);
        response.getHeaders().setContentType(MediaType.APPLICATION_JSON);
        String escaped = message.replace("\"", "\\\"");
        String body = String.format("{\"error\":\"Unauthorized\",\"message\":\"%s\"}", escaped);
        DataBuffer buffer = response.bufferFactory().wrap(body.getBytes(StandardCharsets.UTF_8));
        return response.writeWith(Mono.just(buffer));
    }
}

