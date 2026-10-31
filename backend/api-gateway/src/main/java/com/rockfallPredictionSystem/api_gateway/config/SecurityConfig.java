package com.rockfallPredictionSystem.api_gateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;

@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

    /**
     * TEMPORARY CONFIGURATION:
     * Permits all incoming requests temporarily to verify that the reactive API Gateway
     * routing, Eureka registration, and filter chains work as expected with Spring Security.
     * 
     * WARNING: THIS IS NOT PRODUCTION SECURITY.
     * Endpoints are not yet authenticated or authorized. JWT authentication and endpoint
     * protection will be configured in subsequent steps.
     */
    @Bean
    public SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity http) {
        return http
                .csrf(ServerHttpSecurity.CsrfSpec::disable)
                .authorizeExchange(exchanges -> exchanges
                        .anyExchange().permitAll()
                )
                .build();
    }
}
