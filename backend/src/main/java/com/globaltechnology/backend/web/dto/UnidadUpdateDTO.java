package com.globaltechnology.backend.web.dto;

import com.globaltechnology.backend.domain.EstadoStock;
import jakarta.validation.constraints.NotNull;

public record UnidadUpdateDTO(
    @NotNull EstadoStock estadoStock,
    Integer bateriaCondicionPct,
    Long costoUnitario,
    String observaciones
) {}
