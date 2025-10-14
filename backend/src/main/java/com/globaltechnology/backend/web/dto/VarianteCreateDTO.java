package com.globaltechnology.backend.web.dto;

import java.math.BigDecimal;

public record VarianteCreateDTO(
  Long modeloId,
  Long colorId,
  Long capacidadId,
  Boolean activo,
  BigDecimal precioBase
) {}

