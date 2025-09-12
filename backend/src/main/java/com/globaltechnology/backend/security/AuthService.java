package com.globaltechnology.backend.security;

import org.springframework.security.core.userdetails.*;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.stream.Collectors;

@Service
public class AuthService implements UserDetailsService {

  private final UserRepository userRepo;

  public AuthService(UserRepository userRepo) { this.userRepo = userRepo; }

  @Override
  public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
    User u = userRepo.findByUsername(username)
        .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    var authorities = u.getRoles().stream()
        .map(r -> new SimpleGrantedAuthority("ROLE_" + r.name()))
        .collect(Collectors.toSet());
    return new org.springframework.security.core.userdetails.User(
        u.getUsername(), u.getPassword(), authorities);
  }
}
