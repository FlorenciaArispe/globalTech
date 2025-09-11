package com.globaltechnology.backend.web.dto;

import com.globaltechnology.backend.domain.EstadoStock;
import java.time.Instant;

public record UnidadDTO(
    Long id,
    Long varianteId,
    String varianteSku,
    String imei,
    String numeroSerie,
    Integer bateriaCondicionPct,
    Long costoUnitario,
    EstadoStock estadoStock,
    String observaciones,
    Instant createdAt,
    Instant updatedAt
) {}
