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
public class SecurityConfig {

  private final JwtAuthFilter jwt;

  public SecurityConfig(JwtAuthFilter jwt) {
    this.jwt = jwt;
  }

  @Bean
  public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http
        .csrf(csrf -> csrf.disable())
        .cors(cors -> cors.configurationSource(corsConfigurationSource()))
        .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/actuator/**", "/auth/login", "/error").permitAll()
            .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

            // NOTAS
            .requestMatchers(HttpMethod.GET, "/api/notes/**").hasAnyRole("ADMIN", "OPERADOR")
            .requestMatchers(HttpMethod.POST, "/api/notes/**").hasRole("ADMIN")
            .requestMatchers(HttpMethod.PUT, "/api/notes/**").hasRole("ADMIN")
            .requestMatchers(HttpMethod.DELETE, "/api/notes/**").hasRole("ADMIN")

            // CATEGORIAS
            .requestMatchers(HttpMethod.GET, "/api/categorias/**").hasAnyRole("ADMIN", "OPERADOR")
            .requestMatchers(HttpMethod.POST, "/api/categorias/**").hasRole("ADMIN")
            .requestMatchers(HttpMethod.PUT, "/api/categorias/**").hasRole("ADMIN")
            .requestMatchers(HttpMethod.DELETE, "/api/categorias/**").hasRole("ADMIN")

            // CLIENTES
            .requestMatchers(HttpMethod.GET, "/api/clientes/**").hasAnyRole("ADMIN", "OPERADOR")

            // MODELOS
            .requestMatchers(HttpMethod.GET, "/api/modelos/**").hasRole("ADMIN")
            .requestMatchers(HttpMethod.POST, "/api/modelos/**").hasRole("ADMIN")
            .requestMatchers(HttpMethod.PUT, "/api/modelos/**").hasRole("ADMIN")
            .requestMatchers(HttpMethod.DELETE, "/api/modelos/**").hasRole("ADMIN")

            // MARCAS
            .requestMatchers(HttpMethod.GET, "/api/marcas/**").hasAnyRole("ADMIN", "OPERADOR")
            .requestMatchers(HttpMethod.POST, "/api/marcas/**").hasRole("ADMIN")
            .requestMatchers(HttpMethod.PUT, "/api/marcas/**").hasRole("ADMIN")
            .requestMatchers(HttpMethod.DELETE, "/api/marcas/**").hasRole("ADMIN")

            // COLORES
            .requestMatchers(HttpMethod.GET, "/api/colores/**").hasAnyRole("ADMIN", "OPERADOR")
            .requestMatchers(HttpMethod.POST, "/api/colores/**").hasRole("ADMIN")
            .requestMatchers(HttpMethod.PUT, "/api/colores/**").hasRole("ADMIN")
            .requestMatchers(HttpMethod.DELETE, "/api/colores/**").hasRole("ADMIN")

            // CAPACIDADES
            .requestMatchers(HttpMethod.GET, "/api/capacidades/**").hasAnyRole("ADMIN", "OPERADOR")
            .requestMatchers(HttpMethod.POST, "/api/capacidades/**").hasRole("ADMIN")
            .requestMatchers(HttpMethod.PUT, "/api/capacidades/**").hasRole("ADMIN")
            .requestMatchers(HttpMethod.DELETE, "/api/capacidades/**").hasRole("ADMIN")

            // UNIDADES
            .requestMatchers(HttpMethod.GET, "/api/unidades/**").hasAnyRole("ADMIN", "OPERADOR")
            .requestMatchers(HttpMethod.POST, "/api/unidades/**").hasRole("ADMIN")
            .requestMatchers(HttpMethod.PUT, "/api/unidades/**").hasRole("ADMIN")
            .requestMatchers(HttpMethod.DELETE, "/api/unidades/**").hasRole("ADMIN")

            // VARIENTES
            .requestMatchers(HttpMethod.GET, "/api/variantes/**").hasAnyRole("ADMIN", "OPERADOR")
            .requestMatchers(HttpMethod.POST, "/api/variantes/**").hasRole("ADMIN")
            .requestMatchers(HttpMethod.PUT, "/api/variantes/**").hasRole("ADMIN")
            .requestMatchers(HttpMethod.DELETE, "/api/variantes/**").hasRole("ADMIN")

            // INVENTARIO (listado de stock)
            .requestMatchers(HttpMethod.GET, "/api/inventario/**").hasAnyRole("ADMIN", "OPERADOR")

            // MOVIMIENTOS (no trackeados por unidad)
            .requestMatchers(HttpMethod.GET, "/api/movimientos/**").hasAnyRole("ADMIN", "OPERADOR") // si exponés GET
          .requestMatchers(HttpMethod.POST, "/api/movimientos/**").hasRole("ADMIN")

           // VENTAS
    .requestMatchers(HttpMethod.GET,  "/api/ventas/**").hasAnyRole("ADMIN","OPERADOR")
    .requestMatchers(HttpMethod.POST, "/api/ventas/**").hasAnyRole("ADMIN","OPERADOR")
    
            // catch-all (si algo no matcheó arriba)
            .requestMatchers("/api/**").hasRole("ADMIN")

            .anyRequest().authenticated())

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
    cfg.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
    cfg.setAllowedHeaders(List.of("*"));
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", cfg);
    return source;
  }
}
