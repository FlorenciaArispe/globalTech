// com/globaltechnology/backend/web/dto/ModeloRenameDTO.java
package com.globaltechnology.backend.web.dto;

import jakarta.validation.constraints.NotBlank;

public record ModeloRenameDTO(@NotBlank String nombre) {}
