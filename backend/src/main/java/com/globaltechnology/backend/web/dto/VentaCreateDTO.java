package com.globaltechnology.backend.web.dto;

import jakarta.validation.constraints.NotEmpty;
import java.math.BigDecimal;
import java.util.List;

public record VentaCreateDTO(
    Long clienteId,                        // null = mostrador
    @NotEmpty List<VentaItemCreateDTO> items,
    BigDecimal descuentoTotal,             // opcional
    BigDecimal impuestos,                  // opcional
    String observaciones
) {}
