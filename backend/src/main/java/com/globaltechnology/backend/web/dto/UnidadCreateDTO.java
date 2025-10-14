package com.globaltechnology.backend.web.dto;

import java.math.BigDecimal;

import com.globaltechnology.backend.domain.EstadoComercial;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

// UnidadCreateDTO.java
public record UnidadCreateDTO(
  Long varianteId,
  String imei,
  Integer bateriaCondicionPct,
  BigDecimal precioOverride,
  EstadoComercial estadoProducto
) {}

