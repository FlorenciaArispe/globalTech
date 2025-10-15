// web/dto/MovimientoCreateDTO.java
package com.globaltechnology.backend.web.dto;

import com.globaltechnology.backend.domain.TipoMovimiento;

import jakarta.validation.constraints.NotNull;

// MovimientoCreateDTO.java
public record MovimientoCreateDTO(
  @NotNull Long varianteId,
  @NotNull TipoMovimiento tipo,
  @NotNull Integer cantidad,   // puede venir 1 o -1; lo normaliza el service
  String refTipo,
  Long refId,
  String notas
) {}

