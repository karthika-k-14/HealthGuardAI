package com.healthguard.repository;

import com.healthguard.entity.AccountStatus;
import com.healthguard.entity.Role;
import com.healthguard.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    Optional<User> findByPhone(String phone);

    Optional<User> findByUuid(UUID uuid);

    boolean existsByEmail(String email);

    boolean existsByPhone(String phone);

    List<User> findByAccountStatus(AccountStatus accountStatus);

    List<User> findByRoleAndAccountStatus(Role role, AccountStatus accountStatus);

    long countByAccountStatus(AccountStatus accountStatus);

    long countByAccountStatusAndUpdatedAtBetween(AccountStatus accountStatus, LocalDateTime start, LocalDateTime end);
}
