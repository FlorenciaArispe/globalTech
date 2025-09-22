package com.globaltechnology.backend.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.*;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.*;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.*;
import org.springframework.security.web.*;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.*;

import java.util.List;

@Configuration
@EnableMethodSecurity // para @PreAuthorize en controllers si querés
public class SecurityConfig {

  private final JwtAuthFilter jwt;

  public SecurityConfig(JwtAuthFilter jwt) { this.jwt = jwt; }

  @Bean
  public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http
      .csrf(csrf -> csrf.disable())
      .cors(cors -> cors.configurationSource(corsConfigurationSource()))
      .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
      .authorizeHttpRequests(auth -> auth
  .requestMatchers("/actuator/**","/auth/login").permitAll()
  .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

  // categorias
  .requestMatchers(HttpMethod.GET,    "/api/categorias/**").hasAnyRole("ADMIN","OPERADOR")
  .requestMatchers(HttpMethod.POST,   "/api/categorias/**").hasRole("ADMIN")
  .requestMatchers(HttpMethod.PUT,    "/api/categorias/**").hasRole("ADMIN")
  .requestMatchers(HttpMethod.DELETE, "/api/categorias/**").hasRole("ADMIN")

  // clientes
  .requestMatchers(HttpMethod.GET, "/api/clientes/**").hasAnyRole("ADMIN","OPERADOR")

  // modelos
  .requestMatchers(HttpMethod.GET,    "/api/modelos/**").hasRole("ADMIN")
  .requestMatchers(HttpMethod.POST,   "/api/modelos/**").hasRole("ADMIN")
  .requestMatchers(HttpMethod.PUT,    "/api/modelos/**").hasRole("ADMIN")
  .requestMatchers(HttpMethod.DELETE, "/api/modelos/**").hasRole("ADMIN")

  // marcas
  .requestMatchers(HttpMethod.GET,    "/api/marcas/**").hasAnyRole("ADMIN","OPERADOR")
  .requestMatchers(HttpMethod.POST,   "/api/marcas/**").hasRole("ADMIN")
  .requestMatchers(HttpMethod.PUT,    "/api/marcas/**").hasRole("ADMIN")
  .requestMatchers(HttpMethod.DELETE, "/api/marcas/**").hasRole("ADMIN")

  // notas (ajustá si querés más fino)
  .requestMatchers("/api/notes/**").hasAnyRole("ADMIN","OPERADOR")

  // catch-all
  .requestMatchers("/api/**").hasRole("ADMIN")
  .anyRequest().authenticated()
)

      .addFilterBefore(jwt, UsernamePasswordAuthenticationFilter.class);

    return http.build();
  }

  @Bean
  public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
    return config.getAuthenticationManager();
  }

  @Bean
  public BCryptPasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
  }

  @Bean
  public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration cfg = new CorsConfiguration();
    cfg.setAllowedOrigins(List.of("*")); // ajustá en prod
    cfg.setAllowedMethods(List.of("GET","POST","PUT","DELETE","PATCH","OPTIONS"));
    cfg.setAllowedHeaders(List.of("*"));
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", cfg);
    return source;
  }
}
