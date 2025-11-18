package com.globaltechnology.backend.web.dto;

public record ProductoDestacadoCreateDTO(
    TipoCatalogoItem tipo,
    Long itemId,
    Integer orden
) {}
