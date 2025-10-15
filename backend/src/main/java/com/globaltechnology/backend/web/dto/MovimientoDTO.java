// web/dto/MovimientoDTO.java (respuesta)
package com.globaltechnology.backend.web.dto;

import com.globaltechnology.backend.domain.TipoMovimiento;
import java.time.Instant;

public record MovimientoDTO(
    Long id,
    Instant fecha,
    TipoMovimiento tipo,
    Long varianteId,
    Long unidadId,      // null en no-trackeados
    Integer cantidad,   // ya con signo (+ entrada, - salida)
    String refTipo,
    Long refId,
    String notas
) {}
