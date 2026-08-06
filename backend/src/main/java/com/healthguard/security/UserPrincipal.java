package com.healthguard.security;

import com.healthguard.entity.AccountStatus;
import com.healthguard.entity.User;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

/**
 * Adapts our {@link User} entity to Spring Security's {@link UserDetails}
 * contract, so the rest of the security machinery (authentication manager,
 * JWT filter, etc.) can work with a standard type instead of our domain model.
 */
@Getter
public class UserPrincipal implements UserDetails {

    private final User user;

    public UserPrincipal(User user) {
        this.user = user;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        if (user.getRole() == null) {
            return List.of();
        }
        return List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()));
    }

    @Override
    public String getPassword() {
        return user.getPassword();
    }

    /**
     * Email is used as the Spring Security "username" (principal identifier).
     * Login itself still accepts either email or phone (see UserService).
     */
    @Override
    public String getUsername() {
        return user.getEmail();
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    /**
     * Only an ACTIVE account may authenticate. PENDING/REJECTED/SUSPENDED
     * accounts are treated as "disabled" by Spring Security, which is what
     * causes {@code DaoAuthenticationProvider} to throw
     * {@code DisabledException} during login for them.
     */
    @Override
    public boolean isEnabled() {
        return Boolean.TRUE.equals(user.getIsActive()) && user.getAccountStatus() == AccountStatus.ACTIVE;
    }
}
