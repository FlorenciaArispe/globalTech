package com.globaltechnology.backend.web.dto;

import com.globaltechnology.backend.domain.EstadoComercial;
import java.time.Instant;

public record VarianteDTO(
    Long id,
    Long modeloId,
    String modeloNombre,
    Long colorId,
    String colorNombre,
    Long capacidadId,
    String capacidadEtiqueta,
    EstadoComercial estadoComercial,
    boolean activo,
    String sku,
    Instant createdAt,
    Instant updatedAt
) {}
