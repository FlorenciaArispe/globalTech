package com.globaltechnology.backend.web.dto;

import com.globaltechnology.backend.domain.TipoMovimiento;

import jakarta.validation.constraints.NotNull;

public record MovimientoCreateDTO(
  @NotNull Long varianteId,
  @NotNull TipoMovimiento tipo,
  @NotNull Integer cantidad,  
  String refTipo,
  Long refId,
  String notas
) {}

