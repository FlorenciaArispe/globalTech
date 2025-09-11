// VarianteRepository.java
package com.globaltechnology.backend.repository;
import com.globaltechnology.backend.domain.*;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface VarianteRepository extends JpaRepository<Variante, Long> {
  boolean existsBySku(String sku);
  List<Variante> findByModeloAndEstadoComercialAndActivoTrue(Modelo modelo, EstadoComercial estado);
}
