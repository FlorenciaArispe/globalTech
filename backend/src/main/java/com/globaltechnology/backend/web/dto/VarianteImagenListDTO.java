package com.globaltechnology.backend.web.dto;

import com.globaltechnology.backend.domain.ImagenSet;
import java.util.List;
import java.util.Map;

public record VarianteImagenListDTO(
  Long varianteId,
  Map<ImagenSet, List<VarianteImagenDTO>> sets
) {}
