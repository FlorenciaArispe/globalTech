package com.globaltechnology.backend.web.dto;

import jakarta.validation.constraints.NotBlank;

public record CategoriaCreateDTO(@NotBlank String nombre) {}
