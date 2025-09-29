package com.globaltechnology.backend.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;

@Service
public class JwtService {

  @Value("${app.jwt.secret}")
  private String secret;

  @Value("${app.jwt.exp-minutes:120}")
  private long expMinutes;

  @Value("${app.jwt.issuer:globaltechnology}")
  private String issuer;

  private Key key() {
    return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
  }

  public String generateToken(UserDetails user) {
    Instant now = Instant.now();
    return Jwts.builder()
        .setSubject(user.getUsername())
        .setIssuer(issuer)
        .setIssuedAt(Date.from(now))
        .setExpiration(Date.from(now.plus(expMinutes, ChronoUnit.MINUTES)))
        .signWith(key(), SignatureAlgorithm.HS256)
        .compact();
  }

  public String extractUsername(String token) {
    return parse(token).getBody().getSubject();
  }

  public boolean isTokenValid(String token, UserDetails user) {
    try {
      var body = parse(token).getBody();
      boolean notExpired = body.getExpiration().after(new Date());
      boolean subjectMatches = user.getUsername().equals(body.getSubject());
      boolean issuerMatches = issuer.equals(body.getIssuer()); // opcional
      return notExpired && subjectMatches && issuerMatches;
    } catch (JwtException | IllegalArgumentException e) {
      return false;
    }
  }

  private Jws<Claims> parse(String token) {
    return Jwts.parserBuilder().setSigningKey(key()).build().parseClaimsJws(token);
  }
}
