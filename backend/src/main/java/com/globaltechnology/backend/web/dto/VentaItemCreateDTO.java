package com.globaltechnology.backend.web.dto;

import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record VentaItemCreateDTO(
    @NotNull Long unidadId,
    @NotNull BigDecimal precioUnitario,
    BigDecimal descuentoItem,
    String observaciones
) {}
