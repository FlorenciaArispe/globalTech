// UnidadRepository.java
package com.globaltechnology.backend.repository;
import com.globaltechnology.backend.domain.*;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface UnidadRepository extends JpaRepository<Unidad, Long> {
  long countByVarianteAndEstadoStock(Variante v, EstadoStock estado);
  List<Unidad> findByVarianteAndEstadoStock(Variante v, EstadoStock estado);
  Optional<Unidad> findByImei(String imei);
}
