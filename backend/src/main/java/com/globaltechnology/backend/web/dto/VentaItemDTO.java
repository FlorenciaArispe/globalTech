package com.globaltechnology.backend.web.dto;

import java.math.BigDecimal;

public record VentaItemDTO(
    Long id,
    Long unidadId,
    Long varianteId,
    BigDecimal precioUnitario,
    BigDecimal descuentoItem,
    String observaciones
) {}
