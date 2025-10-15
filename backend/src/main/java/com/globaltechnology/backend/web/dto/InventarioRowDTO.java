package com.globaltechnology.backend.web.dto;

import com.globaltechnology.backend.domain.EstadoComercial;
import com.globaltechnology.backend.domain.EstadoStock;
import java.math.BigDecimal;
import java.time.Instant;

public record InventarioRowDTO(
    // Identidad
    Long modeloId,
    String modeloNombre,
    Long varianteId,
    String colorNombre,
    String capacidadEtiqueta,

    // Si trackea unidad => una fila por unidad; sino => null
    Long unidadId,

    // Info de unidad (sólo aplica si trackea unidad)
    String imei,
    Integer bateriaCondicionPct,
    EstadoComercial estadoProducto,
    EstadoStock estadoStock,

    // Precios
    BigDecimal precioBase,      // desde Variante
    BigDecimal precioOverride,  // desde Unidad (si USADO y seteado)
    BigDecimal precioEfectivo,  // calculado: override != null ? override : precioBase

    // Stock agregado (sólo para NO trackeados; para trackeados = null)
    Long stockAcumulado,

    // Metadatos
    boolean trackeaUnidad,
    Instant createdAt,
    Instant updatedAt
) {}
