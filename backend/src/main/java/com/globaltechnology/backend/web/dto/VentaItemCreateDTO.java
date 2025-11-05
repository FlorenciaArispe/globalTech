package com.globaltechnology.backend.web.dto;

import java.math.BigDecimal;

public record VentaItemCreateDTO(
    Long unidadId,      // null si no-trackeado
    Long varianteId,    // requerido si no-trackeado
    Integer cantidad,   // requerido si no-trackeado (>=1). Para trackeado ignorar (usar 1)
    BigDecimal precioUnitario,
    BigDecimal descuentoItem
) {}
