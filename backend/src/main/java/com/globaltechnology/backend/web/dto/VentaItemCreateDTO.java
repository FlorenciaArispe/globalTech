package com.globaltechnology.backend.web.dto;

import java.math.BigDecimal;

public record VentaItemCreateDTO(
    Long unidadId,     
    Long varianteId,   
    Integer cantidad,   
    BigDecimal precioUnitario,
    BigDecimal descuentoItem
) {}
