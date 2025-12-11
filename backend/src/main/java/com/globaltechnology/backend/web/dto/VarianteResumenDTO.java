package com.globaltechnology.backend.web.dto;

public record VarianteResumenDTO(
  Long id,
  String nombre,          
  String colorNombre,     
  String capacidadEtiqueta, 
  long stock,             
  Long precio,           
  Long precioPromo        
) {}
