package com.globaltechnology.backend.web.dto;

import jakarta.validation.constraints.NotNull;

public record UnidadCreateDTO(
    @NotNull Long varianteId,
    String imei,
    String numeroSerie,
    Integer bateriaCondicionPct,
    Long costoUnitario,
    String observaciones
) {}
