package com.globaltechnology.backend.web.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record VentaDTO(
    Long id,
    Instant fecha,
    Long clienteId,
    String clienteNombre,
    BigDecimal descuentoTotal,
    BigDecimal total,
    String observaciones,
    List<VentaItemDTO> items
) {}
