package com.globaltechnology.backend.web.dto;

import com.globaltechnology.backend.domain.EstadoComercial;
import com.globaltechnology.backend.domain.EstadoStock;

import java.math.BigDecimal;
import java.time.Instant;

public record UnidadDTO(
        Long id,
        Long varianteId,
        String imei,
        Integer bateriaCondicionPct,
        BigDecimal precioOverride,
        EstadoStock estadoStock,
        EstadoComercial estadoProducto,
        Instant createdAt,
        Instant updatedAt) {
}
