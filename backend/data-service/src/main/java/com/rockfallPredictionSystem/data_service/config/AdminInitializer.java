package com.rockfallPredictionSystem.data_service.config;

import com.rockfallPredictionSystem.data_service.entity.Role;
import com.rockfallPredictionSystem.data_service.entity.User;
import com.rockfallPredictionSystem.data_service.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class AdminInitializer implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminInitializer.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${admin.email:${ADMIN_EMAIL:}}")
    private String adminEmail;

    @Value("${admin.password:${ADMIN_PASSWORD:}}")
    private String adminPassword;

    @Value("${admin.name:${ADMIN_NAME:Administrator}}")
    private String adminName;

    public AdminInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        // 1 & 2. Check if an ADMIN account already exists; if so, do not create or alter
        if (userRepository.existsByRole(Role.ADMIN)) {
            log.info("ADMIN account already exists in the database. Skipping initial ADMIN provisioning.");
            return;
        }

        boolean emailConfigured = adminEmail != null && !adminEmail.trim().isEmpty();
        boolean passwordConfigured = adminPassword != null && !adminPassword.trim().isEmpty();

        // 6. If neither is configured, log safe warning and allow startup to continue
        if (!emailConfigured && !passwordConfigured) {
            log.warn("No ADMIN account exists in the database, and neither ADMIN_EMAIL nor ADMIN_PASSWORD is configured. " +
                    "Initial ADMIN provisioning was skipped.");
            return;
        }

        // 5. If only one is configured, fail with a clear configuration error
        if (!emailConfigured || !passwordConfigured) {
            throw new IllegalStateException(
                    "Incomplete initial ADMIN configuration: Both ADMIN_EMAIL and ADMIN_PASSWORD must be configured " +
                    "to provision the initial ADMIN account. Only one was provided."
            );
        }

        // 3. Normalize email, encode password with BCrypt, and persist with Role.ADMIN
        String normalizedEmail = adminEmail.trim().toLowerCase();

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new IllegalStateException(
                    "Cannot provision initial ADMIN: An account with email '" + normalizedEmail + "' already exists."
            );
        }

        String hashedPassword = passwordEncoder.encode(adminPassword);
        String displayName = (adminName != null && !adminName.trim().isEmpty()) ? adminName.trim() : "Administrator";

        User adminUser = User.builder()
                .name(displayName)
                .email(normalizedEmail)
                .password(hashedPassword)
                .role(Role.ADMIN)
                .build();

        userRepository.save(adminUser);

        // 4. Never log the password or secret
        log.info("Securely provisioned initial ADMIN account with email: '{}'.", normalizedEmail);
    }
}

