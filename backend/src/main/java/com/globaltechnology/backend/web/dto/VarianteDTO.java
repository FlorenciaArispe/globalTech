// VarianteDTO.java
package com.globaltechnology.backend.web.dto;

import java.math.BigDecimal;
import java.time.Instant;

public record VarianteDTO(
  Long id,
  Long modeloId, String modeloNombre,
  Long colorId, String colorNombre,
  Long capacidadId, String capacidadEtiqueta,
  Long stockDisponible,
  BigDecimal precioBase,
  Instant createdAt, Instant updatedAt,
  String imagenUrl // 👈 agregado
) {}


