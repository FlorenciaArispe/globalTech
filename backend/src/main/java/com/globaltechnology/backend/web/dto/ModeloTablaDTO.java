package com.globaltechnology.backend.web.dto;

import java.util.List;

public record ModeloTablaDTO(
    Long id,
    String nombre,
    Long categoriaId,
    String categoriaNombre,
    boolean trackeaUnidad,              
    List<VarianteTablaDTO> variantes
) {}
