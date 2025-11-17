package com.globaltechnology.backend.web.dto;

public record ModeloStockDTO(
    Long id,
    String nombre,
    long stockTotal
) {}