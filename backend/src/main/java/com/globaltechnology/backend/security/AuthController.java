package com.globaltechnology.backend.security;

import com.globaltechnology.backend.security.dto.*;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

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

  @GetMapping("/me")
  public MeResponse me(Authentication auth) {
    var principal = (org.springframework.security.core.userdetails.User) auth.getPrincipal();
    var roles = principal.getAuthorities().stream().map(a -> a.getAuthority()).collect(java.util.stream.Collectors.toSet());
    return new MeResponse(principal.getUsername(), roles);
  }
}
