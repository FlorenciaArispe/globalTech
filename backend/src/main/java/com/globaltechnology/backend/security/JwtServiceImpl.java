package com.globaltechnology.backend.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;

@Service
public class JwtServiceImpl implements JwtService {

  @Value("${app.jwt.secret}")
  private String secret; // puede venir en Base64 o texto plano

  private SecretKey key() {
    // 1) Intentar interpretarlo como Base64
    try {
      byte[] k = Decoders.BASE64.decode(secret);
      if (k != null && k.length >= 32) { // 256 bits mínimo recomendado
        return Keys.hmacShaKeyFor(k);
      }
    } catch (Exception ignore) { /* no era Base64 válido */ }

    // 2) Si no es Base64, usar bytes del texto plano
    byte[] raw = secret.getBytes(StandardCharsets.UTF_8);
    if (raw.length < 32) {
      throw new IllegalStateException("app.jwt.secret debe tener al menos 32 bytes (256 bits).");
    }
    return Keys.hmacShaKeyFor(raw);
  }

  private Claims parse(String token) {
    return Jwts.parserBuilder()
        .setSigningKey(key())
        .build()
        .parseClaimsJws(token)
        .getBody();
  }

  @Override
  public String extractUsername(String token) {
    return parse(token).getSubject();
  }

  @Override
  public boolean isTokenValid(String token) {
    try {
      parse(token); // lanza excepción si expira o no coincide la firma
      return true;
    } catch (Exception e) {
      return false;
    }
  }
}
