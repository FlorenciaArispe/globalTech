package com.globaltechnology.backend.web.dto;

import java.math.BigDecimal;

import com.globaltechnology.backend.domain.EstadoComercial;
import com.globaltechnology.backend.domain.EstadoStock;
import jakarta.validation.constraints.NotNull;

// UnidadUpdateDTO.java
public record UnidadUpdateDTO(
  Integer bateriaCondicionPct,
  BigDecimal precioOverride,         // o BigDecimal
  EstadoStock estadoStock,
  EstadoComercial estadoProducto // <-- nullable: si viene, actualiza
) {}
