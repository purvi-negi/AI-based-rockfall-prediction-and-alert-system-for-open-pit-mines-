package com.rockfallPredictionSystem.api_gateway.config;

import com.rockfallPredictionSystem.api_gateway.filter.JwtAuthenticationWebFilter;
import com.rockfallPredictionSystem.api_gateway.util.JwtUtils;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.SecurityWebFiltersOrder;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.security.web.server.context.NoOpServerSecurityContextRepository;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;

@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

    private final JwtUtils jwtUtils;

    public SecurityConfig(JwtUtils jwtUtils) {
        this.jwtUtils = jwtUtils;
    }

    @Bean
    public SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity http) {
        JwtAuthenticationWebFilter jwtAuthenticationWebFilter = new JwtAuthenticationWebFilter(jwtUtils);

        return http
                .csrf(ServerHttpSecurity.CsrfSpec::disable)
                .httpBasic(ServerHttpSecurity.HttpBasicSpec::disable)
                .formLogin(ServerHttpSecurity.FormLoginSpec::disable)
                .securityContextRepository(NoOpServerSecurityContextRepository.getInstance())
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint((exchange, ex) -> {
                            ServerHttpResponse response = exchange.getResponse();
                            response.setStatusCode(HttpStatus.UNAUTHORIZED);
                            response.getHeaders().setContentType(MediaType.APPLICATION_JSON);
                            DataBuffer buffer = response.bufferFactory().wrap(
                                    "{\"error\":\"Unauthorized\",\"message\":\"Authentication required to access this resource.\"}".getBytes(StandardCharsets.UTF_8)
                            );
                            return response.writeWith(Mono.just(buffer));
                        })
                        .accessDeniedHandler((exchange, ex) -> {
                            ServerHttpResponse response = exchange.getResponse();
                            response.setStatusCode(HttpStatus.FORBIDDEN);
                            response.getHeaders().setContentType(MediaType.APPLICATION_JSON);
                            DataBuffer buffer = response.bufferFactory().wrap(
                                    "{\"error\":\"Forbidden\",\"message\":\"Access denied: insufficient permissions.\"}".getBytes(StandardCharsets.UTF_8)
                            );
                            return response.writeWith(Mono.just(buffer));
                        })
                )
                .addFilterAt(jwtAuthenticationWebFilter, SecurityWebFiltersOrder.AUTHENTICATION)
                .authorizeExchange(exchanges -> exchanges
                        // PUBLIC: Registration & Login
                        .pathMatchers(HttpMethod.POST, "/api/auth/register", "/api/auth/login").permitAll()
                        .pathMatchers("/api/auth/**").permitAll()

                        // ADMIN ONLY: Resource management & mutating operations
                        .pathMatchers(HttpMethod.POST, "/api/mines/**").hasRole("ADMIN")
                        .pathMatchers(HttpMethod.PUT, "/api/mines/**").hasRole("ADMIN")
                        .pathMatchers(HttpMethod.PATCH, "/api/mines/**").hasRole("ADMIN")
                        .pathMatchers(HttpMethod.DELETE, "/api/mines/**").hasRole("ADMIN")

                        .pathMatchers(HttpMethod.POST, "/api/sensors/**").hasRole("ADMIN")
                        .pathMatchers(HttpMethod.PUT, "/api/sensors/**").hasRole("ADMIN")
                        .pathMatchers(HttpMethod.PATCH, "/api/sensors/**").hasRole("ADMIN")
                        .pathMatchers(HttpMethod.DELETE, "/api/sensors/**").hasRole("ADMIN")

                        // Includes /api/monitoring-snapshots/{id}/predict (POST)
                        .pathMatchers(HttpMethod.POST, "/api/monitoring-snapshots/**").hasRole("ADMIN")
                        .pathMatchers(HttpMethod.PUT, "/api/monitoring-snapshots/**").hasRole("ADMIN")
                        .pathMatchers(HttpMethod.PATCH, "/api/monitoring-snapshots/**").hasRole("ADMIN")
                        .pathMatchers(HttpMethod.DELETE, "/api/monitoring-snapshots/**").hasRole("ADMIN")

                        .pathMatchers(HttpMethod.POST, "/api/predictions/**").hasRole("ADMIN")
                        .pathMatchers(HttpMethod.PUT, "/api/predictions/**").hasRole("ADMIN")
                        .pathMatchers(HttpMethod.PATCH, "/api/predictions/**").hasRole("ADMIN")
                        .pathMatchers(HttpMethod.DELETE, "/api/predictions/**").hasRole("ADMIN")

                        .pathMatchers(HttpMethod.POST, "/api/alerts/**").hasRole("ADMIN")
                        .pathMatchers(HttpMethod.PUT, "/api/alerts/**").hasRole("ADMIN")
                        .pathMatchers(HttpMethod.PATCH, "/api/alerts/**").hasRole("ADMIN")
                        .pathMatchers(HttpMethod.DELETE, "/api/alerts/**").hasRole("ADMIN")

                        // BOTH ADMIN AND USER: Read-only data queries
                        .pathMatchers(HttpMethod.GET, "/api/dashboard/**").hasAnyRole("ADMIN", "USER")
                        .pathMatchers(HttpMethod.GET, "/api/mines/**").hasAnyRole("ADMIN", "USER")
                        .pathMatchers(HttpMethod.GET, "/api/sensors/**").hasAnyRole("ADMIN", "USER")
                        .pathMatchers(HttpMethod.GET, "/api/monitoring-snapshots/**").hasAnyRole("ADMIN", "USER")
                        .pathMatchers(HttpMethod.GET, "/api/alerts/**").hasAnyRole("ADMIN", "USER")
                        .pathMatchers(HttpMethod.GET, "/api/predictions/**").hasAnyRole("ADMIN", "USER")

                        // Any other request must be authenticated
                        .anyExchange().authenticated()
                )
                .build();
    }
}
