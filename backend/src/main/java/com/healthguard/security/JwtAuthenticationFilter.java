package com.healthguard.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Runs once per request, ahead of Spring Security's own authentication
 * filter. Reads the {@code Authorization: Bearer <token>} header, validates
 * the token, and - if valid - populates the {@link SecurityContextHolder} so
 * downstream authorization checks (and controllers) see an authenticated user.
 * <p>
 * A missing or invalid token is not itself an error here: the request simply
 * proceeds unauthenticated, and {@link JwtAuthenticationEntryPoint} handles
 * rejecting it later if it turns out to require authentication.
 */
@Slf4j
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final String AUTH_HEADER = "Authorization";
    private static final String BEARER_PREFIX = "Bearer ";

    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;

    public JwtAuthenticationFilter(JwtService jwtService, CustomUserDetailsService userDetailsService) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                     @NonNull HttpServletResponse response,
                                     @NonNull FilterChain filterChain) throws ServletException, IOException {

    	String authHeader = request.getHeader(AUTH_HEADER);

    	System.out.println("Authorization Header = [" + authHeader + "]");

    	if (authHeader == null || !authHeader.startsWith(BEARER_PREFIX)) {
    	    filterChain.doFilter(request, response);
    	    return;
    	}

    	String token = authHeader.substring(BEARER_PREFIX.length()).trim();

    	System.out.println("JWT Token = [" + token + "]");

        try {
            String username = jwtService.extractUsername(token);

            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);

                if (jwtService.validateToken(token, userDetails) && userDetails.isEnabled()) {
                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
        } catch (Exception e) {
            // Any parsing/validation failure just leaves the request
            // unauthenticated; nothing to recover here.
            log.debug("JWT validation failed: {}", e.getMessage());
        }

        filterChain.doFilter(request, response);
    }
}
