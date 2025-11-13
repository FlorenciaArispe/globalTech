package com.globaltechnology.backend.web.dto;
import java.util.List;

public record VarianteCatalogoDTO(
    Long id,
    String color,
    String capacidad,
    Integer precio,          // o BigDecimal
    List<String> imagenes    // URLs públicas
) {}