package com.globaltechnology.backend.web.dto;

import com.globaltechnology.backend.domain.EstadoComercial;
import jakarta.validation.constraints.NotNull;

public record VarianteUpdateDTO(
    @NotNull Long modeloId,
    Long colorId,
    Long capacidadId,
    @NotNull EstadoComercial estadoComercial,
    Boolean activo,
    String sku
) {}
