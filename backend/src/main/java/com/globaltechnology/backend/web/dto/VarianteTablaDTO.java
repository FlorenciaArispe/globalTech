// src/main/java/com/globaltechnology/backend/web/dto/VarianteTablaDTO.java
package com.globaltechnology.backend.web.dto;

import java.util.List;

public record VarianteTablaDTO(
    Long id,
    String colorNombre,
    String capacidadEtiqueta,
    long stock,
    Long stockNuevos,
    Long stockUsados,
    List<VarianteImagenDTO> imagenes   // 👈 plano, igual que Inventario
) {}
