package com.globaltechnology.backend.repository;

import com.globaltechnology.backend.domain.Capacidad;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CapacidadRepository extends JpaRepository<Capacidad, Long> {
  boolean existsByEtiquetaIgnoreCase(String etiqueta);
}
