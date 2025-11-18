package com.globaltechnology.backend.web.dto;

import java.math.BigDecimal;
import com.globaltechnology.backend.domain.EstadoComercial;

public record UnidadCreateDTO(
  Long varianteId,
  String imei,
  Integer bateriaCondicionPct,
  BigDecimal precioOverride,
  EstadoComercial estadoProducto
) {}

