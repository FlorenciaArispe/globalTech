// VarianteResumenDTO.java
package com.globaltechnology.backend.web.dto;

public record VarianteResumenDTO(
  Long id,
  String nombre,            // etiqueta compuesta: ej. "Blanco 128GB", "Negro", "128GB", etc.
  String colorNombre,       // puede ser null
  String capacidadEtiqueta, // puede ser null
  long stock,               // stock disponible por variante
  Long precio,              // opcional (si aún no lo manejás, puede ir null)
  Long precioPromo          // opcional (si aún no lo manejás, puede ir null)
) {}
