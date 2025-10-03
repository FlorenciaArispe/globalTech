// VarianteDTO.java
package com.globaltechnology.backend.web.dto;

import java.time.Instant;

public record VarianteDTO(
  Long id,
  Long modeloId, String modeloNombre,
  Long colorId, String colorNombre,
  Long capacidadId, String capacidadEtiqueta,
  Long stockDisponible,    
  Instant createdAt, Instant updatedAt
) {}
