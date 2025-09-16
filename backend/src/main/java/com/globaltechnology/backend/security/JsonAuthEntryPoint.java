package com.globaltechnology.backend.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.*;
import org.springframework.http.MediaType;
import org.springframework.security.web.AuthenticationEntryPoint;

import java.io.IOException;
import java.util.Map;

public class JsonAuthEntryPoint implements AuthenticationEntryPoint {
  private final ObjectMapper mapper = new ObjectMapper();

  @Override
  public void commence(HttpServletRequest req, HttpServletResponse res,
                       org.springframework.security.core.AuthenticationException ex) throws IOException {
    addCors(res, req);
    res.setStatus(HttpServletResponse.SC_UNAUTHORIZED); // 401
    res.setContentType(MediaType.APPLICATION_JSON_VALUE);
    mapper.writeValue(res.getOutputStream(), Map.of(
        "status", 401,
        "error", "Unauthorized",
        "message", "No estás autenticado. Enviá el token en Authorization: Bearer <jwt>.",
        "path", req.getRequestURI()
    ));
  }

  private void addCors(HttpServletResponse res, HttpServletRequest req) {
  String origin = req.getHeader("Origin");
  if (origin != null) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Headers", "Authorization,Content-Type");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,PATCH,OPTIONS");
    res.setHeader("Access-Control-Expose-Headers", "Authorization");
  }
}

}
