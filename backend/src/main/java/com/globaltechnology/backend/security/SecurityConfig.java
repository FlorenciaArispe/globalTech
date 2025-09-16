package com.globaltechnology.backend.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.*;

import java.util.List;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

  private final JwtAuthFilter jwt;

  public SecurityConfig(JwtAuthFilter jwt) { this.jwt = jwt; }

  // SecurityConfig.java
@Bean
public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
  http
    .csrf(csrf -> csrf.disable())
    .cors(cors -> cors.configurationSource(corsConfigurationSource()))
    .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
    .authorizeHttpRequests(auth -> auth
      .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()   // 👈 preflight
      .requestMatchers("/actuator/**").permitAll()
      .requestMatchers("/auth/login").permitAll()
      .requestMatchers("/api/**").authenticated()               // (si querés solo ADMIN, volvés a hasRole)
      .anyRequest().authenticated()
    )
    .exceptionHandling(ex -> ex
      .authenticationEntryPoint(new JsonAuthEntryPoint())
      .accessDeniedHandler(new JsonAccessDeniedHandler())
    )
    .addFilterBefore(jwt, UsernamePasswordAuthenticationFilter.class);

  return http.build();
}

@Bean
public CorsConfigurationSource corsConfigurationSource() {
  CorsConfiguration cfg = new CorsConfiguration();
  // Para debug, podés usar ORIGENES explícitos o patrones:
  // cfg.setAllowedOrigins(List.of("http://localhost:3000","http://127.0.0.1:3000"));
  cfg.setAllowedOriginPatterns(List.of("http://localhost:*","http://127.0.0.1:*")); // 👈 más laxo en dev
  cfg.setAllowedMethods(List.of("GET","POST","PUT","DELETE","PATCH","OPTIONS"));
  cfg.setAllowedHeaders(List.of("Authorization","Content-Type"));
  cfg.setExposedHeaders(List.of("Authorization"));
  cfg.setAllowCredentials(false);
  UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
  source.registerCorsConfiguration("/**", cfg);
  return source;
}

}
