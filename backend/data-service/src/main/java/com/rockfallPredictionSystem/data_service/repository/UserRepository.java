package com.rockfallPredictionSystem.data_service.repository;

import com.rockfallPredictionSystem.data_service.entity.Role;
import com.rockfallPredictionSystem.data_service.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByRole(Role role);
}

