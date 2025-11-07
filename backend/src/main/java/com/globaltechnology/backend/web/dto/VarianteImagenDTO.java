package com.globaltechnology.backend.web.dto;

import com.globaltechnology.backend.domain.ImagenSet;
import com.globaltechnology.backend.domain.VarianteImagen;

public record VarianteImagenDTO(
  Long id, ImagenSet set, String url, String altText, int orden, boolean principal
) {
  public static VarianteImagenDTO from(VarianteImagen v) {
    return new VarianteImagenDTO(v.getId(), v.getSetTipo(), v.getUrl(), v.getAltText(), v.getOrden(), v.isPrincipal());
  }
}
