package com.globaltechnology.backend.web.dto;

import com.globaltechnology.backend.domain.EstadoComercial;
import com.globaltechnology.backend.domain.EstadoStock;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record InventarioRowDTO(
        Long modeloId,
        String modeloNombre,
        Long varianteId,
        String colorNombre,
        String capacidadEtiqueta,
        Long unidadId,
        String imei,
        Integer bateriaCondicionPct,
        EstadoComercial estadoProducto,
        EstadoStock estadoStock,
        BigDecimal precioBase,
        BigDecimal precioOverride,
        BigDecimal precioEfectivo,
        Long stockAcumulado,
        boolean trackeaUnidad,
        Instant createdAt,
        Instant updatedAt,
        List<VarianteImagenDTO> imagenes) {
}
