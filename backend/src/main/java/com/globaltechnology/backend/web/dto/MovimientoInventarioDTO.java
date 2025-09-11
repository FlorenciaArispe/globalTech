package com.globaltechnology.backend.web.dto;

import com.globaltechnology.backend.domain.TipoMovimiento;
import java.time.Instant;

public record MovimientoInventarioDTO(
    Long id,
    Instant fecha,
    TipoMovimiento tipo,
    Long varianteId,
    Long unidadId,
    String refTipo,
    Long refId,
    String notas
) {}
