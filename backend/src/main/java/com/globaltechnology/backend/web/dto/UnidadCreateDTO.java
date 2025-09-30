package com.globaltechnology.backend.web.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record UnidadCreateDTO(
  @NotNull Long varianteId,
  String imei,
  String numeroSerie,
  @Min(0) @Max(100) Integer bateriaCondicionPct,
  @Min(0) Long costoUnitario,
  String observaciones
) {}
