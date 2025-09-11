package com.globaltechnology.backend.web.dto;

import jakarta.validation.constraints.NotBlank;

public record CapacidadCreateDTO(@NotBlank String etiqueta) {}
