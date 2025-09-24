package com.globaltechnology.backend.security;

import com.globaltechnology.backend.security.dto.*;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;                      // ← IMPORT NECESARIO
import java.util.List;                     // ← si devolvés lista de roles
import java.util.stream.Collectors;  

@RestController
@RequestMapping("/auth")
public class AuthController {

  private final AuthenticationManager authManager;
  private final JwtUtil jwt;

  public AuthController(AuthenticationManager authManager, JwtUtil jwt) {
    this.authManager = authManager; this.jwt = jwt;
  }

  @PostMapping("/login")
  public ResponseEntity<TokenResponse> login(@RequestBody @Valid LoginRequest req) {
    Authentication auth = authManager.authenticate(
        new UsernamePasswordAuthenticationToken(req.username(), req.password())
    );
    SecurityContextHolder.getContext().setAuthentication(auth);
    String token = jwt.generateToken(req.username());
    return ResponseEntity.ok(new TokenResponse(token));
  }

  // en algún controller, p.ej. AuthController
@GetMapping("/auth/me")
public Map<String, Object> me(org.springframework.security.core.Authentication auth) {
  var roles = auth.getAuthorities().stream()
      .map(a -> a.getAuthority())
      .toList();
  return Map.of("user", auth.getName(), "roles", roles);
}

}
