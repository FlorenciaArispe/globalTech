package com.globaltechnology.backend.web.dto;

import java.math.BigDecimal;

public record CatalogoItemResumenDTO(
        Long itemId,
        String modeloNombre,
        String color,
        String capacidad,
        Integer bateriaCondicionPct,
        TipoCatalogoItem tipo,
        BigDecimal precio,
        String imagenUrl 
) {
}
