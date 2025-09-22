package com.globaltechnology.backend.security;

import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

  private final JwtService jwtService;
  private final org.springframework.security.core.userdetails.UserDetailsService userDetailsService;

  public JwtAuthFilter(JwtService jwtService,
                       org.springframework.security.core.userdetails.UserDetailsService uds) {
    this.jwtService = jwtService;
    this.userDetailsService = uds;
  }

  @Override
  protected void doFilterInternal(HttpServletRequest request,
                                  HttpServletResponse response,
                                  FilterChain chain)
      throws ServletException, IOException {

   String authHeader = request.getHeader("Authorization");
if (authHeader != null && authHeader.startsWith("Bearer ")) {
  String token = authHeader.substring(7);

  // Validá primero, NO extraigas antes
  if (jwtService.isTokenValid(token) &&
      SecurityContextHolder.getContext().getAuthentication() == null) {
    String username = jwtService.extractUsername(token);

    UserDetails userDetails = userDetailsService.loadUserByUsername(username);
    UsernamePasswordAuthenticationToken authToken =
        new UsernamePasswordAuthenticationToken(
            userDetails, null, userDetails.getAuthorities());
    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
    SecurityContextHolder.getContext().setAuthentication(authToken);
  }
}
chain.doFilter(request, response);

  }

  @Override
protected boolean shouldNotFilter(HttpServletRequest request) {
  String path = request.getServletPath();
  return path.equals("/auth/login") || path.startsWith("/actuator/");
}

}
