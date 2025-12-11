package com.globaltechnology.backend.security;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Set;

@Configuration
public class AdminSeeder {
  @Bean
  CommandLineRunner initUsers(UserRepository repo, PasswordEncoder encoder) {
    return args -> {
      if (!repo.existsByUsername("admin")) {
        User u = new User();
        u.setUsername("admin");
        u.setPassword(encoder.encode("admin123"));
        u.setRoles(Set.of(Role.ADMIN));
        repo.save(u);
      }
      if (!repo.existsByUsername("operador")) {
        User u = new User();
        u.setUsername("operador");
        u.setPassword(encoder.encode("oper123"));
        u.setRoles(Set.of(Role.OPERADOR));
        repo.save(u);
      }
    };
  }
}
