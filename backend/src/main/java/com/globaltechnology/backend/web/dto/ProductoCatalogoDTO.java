package com.globaltechnology.backend.web.dto;

import java.util.List;

public record ProductoCatalogoDTO(
    Long id,
    String nombre,
    String categoria,
    String marca
) {}
