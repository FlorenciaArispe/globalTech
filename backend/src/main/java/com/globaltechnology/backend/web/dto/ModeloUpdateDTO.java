package com.globaltechnology.backend.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ModeloUpdateDTO(
    @NotNull Long categoriaId,
    @NotNull Long marcaId,
    @NotBlank String nombre,
    boolean trackeaUnidad,
    boolean requiereColor,
    boolean requiereCapacidad
) {}
