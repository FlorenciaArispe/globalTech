package com.globaltechnology.backend.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.*;
import org.springframework.http.MediaType;
import org.springframework.security.web.access.AccessDeniedHandler;
import java.io.IOException;
import java.util.Map;

public class JsonAccessDeniedHandler implements AccessDeniedHandler {
  private final ObjectMapper mapper = new ObjectMapper();

  @Override
  public void handle(HttpServletRequest req, HttpServletResponse res,
      org.springframework.security.access.AccessDeniedException ex) throws IOException {
    res.setStatus(HttpServletResponse.SC_FORBIDDEN); 
    res.setContentType(MediaType.APPLICATION_JSON_VALUE);
    mapper.writeValue(res.getOutputStream(), Map.of(
        "status", 403,
        "error", "Forbidden",
        "message", "No tenés permisos para acceder a este recurso.",
        "path", req.getRequestURI()));
  }
}
