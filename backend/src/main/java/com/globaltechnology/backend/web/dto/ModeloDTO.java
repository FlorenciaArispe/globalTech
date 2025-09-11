package com.globaltechnology.backend.web.dto;

public record ModeloDTO(
    Long id,
    Long categoriaId,
    String categoriaNombre,
    Long marcaId,
    String marcaNombre,
    String nombre,
    boolean trackeaImei,
    boolean requiereColor,
    boolean requiereCapacidad
) {}
