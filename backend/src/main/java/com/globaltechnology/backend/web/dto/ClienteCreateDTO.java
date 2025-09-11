package com.globaltechnology.backend.web.dto;

import jakarta.validation.constraints.NotBlank;

public record ClienteCreateDTO(
    @NotBlank String nombre,
    String documento,
    String telefono,
    String email
) {}
