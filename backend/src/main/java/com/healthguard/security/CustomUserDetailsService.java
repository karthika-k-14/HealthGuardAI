package com.healthguard.security;

import com.healthguard.entity.User;
import com.healthguard.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

/**
 * Spring Security's single source of truth for loading a user during
 * authentication. Wired into {@link com.healthguard.config.SecurityConfig}'s
 * {@code AuthenticationProvider} and used directly by
 * {@link JwtAuthenticationFilter} when re-hydrating the principal from a
 * validated token, so both the login flow and per-request JWT checks resolve
 * users identically.
 * <p>
 * A single identifier field is accepted and matched against either email or
 * phone, since {@code LoginRequest.emailOrPhone} allows both.
 */
@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String emailOrPhone) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(emailOrPhone)
                .or(() -> userRepository.findByPhone(emailOrPhone))
                .orElseThrow(() -> new UsernameNotFoundException(
                        "No user found with email/phone: " + emailOrPhone));
        return new UserPrincipal(user);
    }
}
