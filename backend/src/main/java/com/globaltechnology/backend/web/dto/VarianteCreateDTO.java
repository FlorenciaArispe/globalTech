package com.globaltechnology.backend.web.dto;

public record VarianteCreateDTO(
  Long modeloId,
  Long colorId,
  Long capacidadId,
  Boolean activo,
  String sku
) {}

