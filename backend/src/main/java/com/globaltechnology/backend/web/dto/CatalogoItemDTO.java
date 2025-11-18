package com.globaltechnology.backend.web.dto;

import java.math.BigDecimal;
import java.util.List;

public record CatalogoItemDTO(
    Long itemId,

    Long modeloId,
    String modeloNombre,

    Long categoriaId,
    String categoriaNombre,

    Long marcaId,
    String marcaNombre,

    TipoCatalogoItem tipo,    

    String color,   
       String capacidad,  
    Integer bateriaCondicionPct,

    BigDecimal precio,   

    boolean enStock,          
    Long stockTotal,         

    List<String> coloresEnStock,
        List<VarianteOpcionCatalogoDTO> variantesEnStock,

    List<VarianteImagenDTO> imagenes 
) {}
