package com.healthguard.gateway.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Component
@Slf4j
public class JwtUtils {

    @Value("${jwt.secret:404E635266556A586E3272357538782F413F4428472B4B6250655368566D5971}")
    private String secretKey;

    private SecretKey getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public Claims getAllClaimsFromToken(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public boolean validateToken(String token) {
        try {
            Claims claims = getAllClaimsFromToken(token);
            Date expiration = claims.getExpiration();
            boolean isExpired = expiration != null && expiration.before(new Date());
            if (isExpired) {
                log.warn("JWT Token is expired");
                return false;
            }
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            log.error("Invalid JWT Token: {}", e.getMessage());
            return false;
        }
    }

    public String getEmailFromToken(String token) {
        Claims claims = getAllClaimsFromToken(token);
        String email = claims.get("email", String.class);
        return email != null ? email : claims.getSubject();
    }

    public String getUserIdFromToken(String token) {
        Claims claims = getAllClaimsFromToken(token);
        Object userIdObj = claims.get("userId");
        if (userIdObj == null) {
            userIdObj = claims.get("id");
        }
        return userIdObj != null ? String.valueOf(userIdObj) : "";
    }

    @SuppressWarnings("unchecked")
    public List<String> getRolesFromToken(String token) {
        Claims claims = getAllClaimsFromToken(token);
        List<String> roles = new ArrayList<>();

        Object roleObj = claims.get("role");
        if (roleObj instanceof String) {
            roles.add((String) roleObj);
        }

        Object rolesObj = claims.get("roles");
        if (rolesObj instanceof List) {
            for (Object r : (List<?>) rolesObj) {
                if (r instanceof String) {
                    roles.add((String) r);
                }
            }
        }

        Object authoritiesObj = claims.get("authorities");
        if (authoritiesObj instanceof List) {
            for (Object a : (List<?>) authoritiesObj) {
                if (a instanceof String) {
                    roles.add((String) a);
                }
            }
        }

        return roles;
    }
}
