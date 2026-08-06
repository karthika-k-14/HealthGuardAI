package com.healthguard.service;

import com.healthguard.entity.User;
import com.healthguard.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

/**
 * Business-level lookup for {@link User} by email or phone. The Spring
 * Security-facing {@code UserDetailsService} contract lives separately in
 * {@link com.healthguard.security.CustomUserDetailsService}, which mirrors
 * this same email-or-phone resolution for authentication purposes. Kept as
 * its own service (rather than folded into the repository) so later phases
 * needing "look up the current user" can depend on one place for it.
 */
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public User findByEmailOrPhone(String emailOrPhone) {
        return userRepository.findByEmail(emailOrPhone)
                .or(() -> userRepository.findByPhone(emailOrPhone))
                .orElseThrow(() -> new UsernameNotFoundException(
                        "No user found with email/phone: " + emailOrPhone));
    }
}
