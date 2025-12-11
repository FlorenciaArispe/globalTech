package com.globaltechnology.backend.security;

import com.globaltechnology.backend.security.dto.*;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

  private final AuthenticationManager authManager;
  private final JwtService jwt;

  public AuthController(AuthenticationManager authManager, JwtService jwt) {
    this.authManager = authManager;
    this.jwt = jwt;
  }

  @PostMapping("/login")
  public ResponseEntity<TokenResponse> login(@RequestBody @Valid LoginRequest req) {
    Authentication auth = authManager.authenticate(
        new UsernamePasswordAuthenticationToken(req.username(), req.password()));
    SecurityContextHolder.getContext().setAuthentication(auth);
    var user = (org.springframework.security.core.userdetails.User) auth.getPrincipal();
    String token = jwt.generateToken(user);
    return ResponseEntity.ok(new TokenResponse(token));
  }

  @GetMapping("/me")
  public Map<String, Object> me(org.springframework.security.core.Authentication auth) {
    var roles = auth.getAuthorities().stream().map(a -> a.getAuthority()).toList();
    return Map.of("user", auth.getName(), "roles", roles);
  }

}
