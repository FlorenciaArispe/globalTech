package com.globaltechnology.backend.security;

import jakarta.servlet.http.*;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;

import java.io.IOException;

public class JsonAccessDeniedHandler implements AccessDeniedHandler {
  @Override
  public void handle(HttpServletRequest req, HttpServletResponse res, AccessDeniedException ex) throws IOException {
    String origin = req.getHeader("Origin");
    if (origin != null) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Vary", "Origin");
      res.setHeader("Access-Control-Allow-Headers", "Authorization,Content-Type");
      res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,PATCH,OPTIONS");
      res.setHeader("Access-Control-Expose-Headers", "Authorization");
    }
    res.setStatus(HttpServletResponse.SC_FORBIDDEN); // 403
    res.setContentType(MediaType.APPLICATION_JSON_VALUE);
    res.getWriter().write("{\"status\":403,\"error\":\"Forbidden\"}");
  }
}
