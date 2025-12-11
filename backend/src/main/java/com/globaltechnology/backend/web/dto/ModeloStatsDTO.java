package com.globaltechnology.backend.web.dto;

public record ModeloStatsDTO(
  Long id,
  String nombre,
  Long categoriaId,
  String categoriaNombre,
  Long marcaId,
  String marcaNombre,
  long variantes,
  long stockTotal
) {}
