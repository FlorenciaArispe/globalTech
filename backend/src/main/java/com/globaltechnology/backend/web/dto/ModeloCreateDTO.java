package com.globaltechnology.backend.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ModeloCreateDTO(
    @NotNull Long categoriaId,
    @NotNull Long marcaId,
    @NotBlank String nombre,
    boolean trackeaImei,
    boolean requiereColor,
    boolean requiereCapacidad
) {}
