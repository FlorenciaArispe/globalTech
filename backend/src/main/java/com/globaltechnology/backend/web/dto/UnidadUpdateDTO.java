package com.globaltechnology.backend.web.dto;

import java.math.BigDecimal;
import com.globaltechnology.backend.domain.EstadoComercial;
import com.globaltechnology.backend.domain.EstadoStock;

public record UnidadUpdateDTO(
  Integer bateriaCondicionPct,
  BigDecimal precioOverride,       
  EstadoStock estadoStock,
  EstadoComercial estadoProducto 
) {}
