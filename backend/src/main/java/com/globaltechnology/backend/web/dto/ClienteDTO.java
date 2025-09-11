package com.globaltechnology.backend.web.dto;

public record ClienteDTO(
    Long id,
    String nombre,
    String documento,
    String telefono,
    String email
) {}
