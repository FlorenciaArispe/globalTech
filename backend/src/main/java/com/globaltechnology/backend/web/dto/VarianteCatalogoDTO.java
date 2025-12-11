package com.globaltechnology.backend.web.dto;
import java.util.List;

public record VarianteCatalogoDTO(
    Long id,
    String color,
    String capacidad,
    Integer precio,         
    List<String> imagenes   
) {}