package com.globaltechnology.backend.security;

public interface JwtService {
  String extractUsername(String token);
  boolean isTokenValid(String token);
}
