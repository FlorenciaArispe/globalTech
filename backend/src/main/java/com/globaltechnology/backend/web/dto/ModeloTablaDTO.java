// ModeloTablaDTO.java
package com.globaltechnology.backend.web.dto;

import java.util.List;

// ModeloTablaDTO.java
public record ModeloTablaDTO(
    Long id,
    String nombre,
    Long categoriaId,
    String categoriaNombre,
    boolean trackeaUnidad,               // ⬅️ NUEVO
    List<VarianteTablaDTO> variantes
) {}
