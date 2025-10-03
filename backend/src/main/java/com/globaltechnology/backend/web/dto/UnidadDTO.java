package com.globaltechnology.backend.web.dto;

import com.globaltechnology.backend.domain.EstadoStock;
import java.time.Instant;

public record UnidadDTO(
    Long id,
    Long varianteId,
    String imei,
    Integer bateriaCondicionPct,
    Long costoUnitario,
    EstadoStock estadoStock,
        Instant createdAt,
    Instant updatedAt
) {}
