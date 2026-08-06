package com.healthguard.security;

import com.healthguard.entity.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

/**
 * User-facing JWT operations used by {@code AuthService} and
 * {@code JwtAuthenticationFilter}. Delegates the actual signing/parsing
 * mechanics to {@link JwtUtil}, and is responsible for deciding which claims
 * go into a token and what "valid" means for a given user.
 */
@Service
public class JwtService {

    private final JwtUtil jwtUtil;

    public JwtService(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    /**
     * Generates a token for the given user, embedding role and uuid as
     * extra claims alongside the standard subject (email) and expiration.
     */
    public String generateToken(User user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("uuid", user.getUuid().toString());
        claims.put("role", user.getRole() != null ? user.getRole().name() : null);
        claims.put("userId", user.getId());
        return jwtUtil.generateToken(user.getEmail(), claims);
    }

    public String extractUsername(String token) {
        return jwtUtil.extractUsername(token);
    }

    public String extractRole(String token) {
        return jwtUtil.extractClaim(token, claims -> claims.get("role", String.class));
    }

    /**
     * A token is valid when it's well-formed, unexpired, and its subject
     * (email) matches the user it's being presented for.
     */
    public boolean validateToken(String token, UserDetails userDetails) {
        try {
            String username = extractUsername(token);
            return username != null
                    && username.equals(userDetails.getUsername())
                    && !jwtUtil.isTokenExpired(token);
        } catch (Exception e) {
            return false;
        }
    }
}
