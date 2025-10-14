// VarianteTablaDTO.java
package com.globaltechnology.backend.web.dto;

public record VarianteTablaDTO(
    Long id,
    String colorNombre,
    String capacidadEtiqueta,
    long stock,           // total (suma de ambos si trackeaUnidad, o el stock por movimientos)
    Long stockNuevos,     // null si no trackeaUnidad
    Long stockUsados      // null si no trackeaUnidad
) {}
