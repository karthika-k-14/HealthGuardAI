package com.healthguard.admin.security;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // Admin service validates JWT tokens passed in requests.
        // Grant authorities including ROLE_ADMIN, ROLE_HEALTH_OFFICER, ROLE_PHARMACIST.
        return new User(
                username,
                "",
                List.of(
                        new SimpleGrantedAuthority("ROLE_ADMIN"),
                        new SimpleGrantedAuthority("ROLE_HEALTH_OFFICER"),
                        new SimpleGrantedAuthority("ROLE_PHARMACIST")
                )
        );
    }
}
