package com.rockfallPredictionSystem.data_service.service;

import com.rockfallPredictionSystem.data_service.dto.AuthResponse;
import com.rockfallPredictionSystem.data_service.dto.LoginRequest;
import com.rockfallPredictionSystem.data_service.dto.RegisterRequest;
import com.rockfallPredictionSystem.data_service.entity.Role;
import com.rockfallPredictionSystem.data_service.entity.User;
import com.rockfallPredictionSystem.data_service.exception.DuplicateEmailException;
import com.rockfallPredictionSystem.data_service.exception.InvalidCredentialsException;
import com.rockfallPredictionSystem.data_service.repository.UserRepository;
import com.rockfallPredictionSystem.data_service.util.JwtUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtUtils jwtUtils
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
    }

    /**
     * Registers a new user with standard USER privileges.
     * Normalizes the email, validates uniqueness, hashes the password using BCrypt,
     * and returns an AuthResponse with an access token.
     *
     * @param request Validated registration parameters.
     * @return AuthResponse containing the access token and safe user details (no password hash).
     * @throws DuplicateEmailException if an account already exists with the normalized email.
     */
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Registration request cannot be null.");
        }

        String normalizedEmail = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmail(normalizedEmail)) {
            log.warn("Registration rejected: email '{}' is already registered.", normalizedEmail);
            throw new DuplicateEmailException("An account with email '" + normalizedEmail + "' already exists.");
        }

        String hashedPassword = passwordEncoder.encode(request.getPassword());

        // Requirement: Public registration must always assign Role.USER
        User user = User.builder()
                .name(request.getName().trim())
                .email(normalizedEmail)
                .password(hashedPassword)
                .role(Role.USER)
                .build();

        User savedUser = userRepository.save(user);
        log.info("Registered new user with id={} and email='{}' (role: {}).",
                savedUser.getId(), savedUser.getEmail(), savedUser.getRole());

        String token = jwtUtils.generateToken(
                savedUser.getId(),
                savedUser.getEmail(),
                savedUser.getRole(),
                savedUser.getName()
        );

        return AuthResponse.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .userId(savedUser.getId())
                .name(savedUser.getName())
                .email(savedUser.getEmail())
                .role(savedUser.getRole())
                .expiresIn(jwtUtils.getExpirationMs())
                .build();
    }

    /**
     * Authenticates a user against their stored BCrypt password hash.
     *
     * @param request Validated login parameters.
     * @return AuthResponse containing the access token and user metadata.
     * @throws InvalidCredentialsException if email or password do not match.
     */
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Login request cannot be null.");
        }

        String normalizedEmail = request.getEmail().trim().toLowerCase();

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> {
                    log.warn("Login failed: account not found for email '{}'.", normalizedEmail);
                    return new InvalidCredentialsException("Invalid email or password.");
                });

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            log.warn("Login failed: invalid password for email '{}'.", normalizedEmail);
            throw new InvalidCredentialsException("Invalid email or password.");
        }

        log.info("User id={} ('{}') logged in successfully.", user.getId(), user.getEmail());

        String token = jwtUtils.generateToken(
                user.getId(),
                user.getEmail(),
                user.getRole(),
                user.getName()
        );

        return AuthResponse.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .expiresIn(jwtUtils.getExpirationMs())
                .build();
    }
}

