package com.globaltechnology.backend.security;

import jakarta.servlet.*;
import jakarta.servlet.http.*;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

  private final JwtUtil jwt;
  private final AuthService uds;

  public JwtAuthFilter(JwtUtil jwt, AuthService uds) {
    this.jwt = jwt; this.uds = uds;
  }

@Override
protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
    throws ServletException, IOException {

  if ("OPTIONS".equalsIgnoreCase(req.getMethod())) { // 👈
    chain.doFilter(req, res);
    return;
  }

  String auth = req.getHeader("Authorization");
  if (auth == null || !auth.startsWith("Bearer ")) { // 👈 sin token, no cortar
    chain.doFilter(req, res);
    return;
  }

  String token = auth.substring(7);
  if (jwt.validate(token)) {
    var user = uds.loadUserByUsername(jwt.getUsername(token));
    var authToken = new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities());
    SecurityContextHolder.getContext().setAuthentication(authToken);
  }
  chain.doFilter(req, res);
}

}
