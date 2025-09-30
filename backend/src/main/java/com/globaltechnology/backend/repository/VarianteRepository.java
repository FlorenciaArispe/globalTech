// VarianteRepository.java
package com.globaltechnology.backend.repository;

import com.globaltechnology.backend.domain.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Collection;
import java.util.List;

public interface VarianteRepository extends JpaRepository<Variante, Long> {
  List<Variante> findByModeloAndActivoTrue(Modelo modelo);
    boolean existsByModelo_Id(Long modeloId);
  boolean existsByModeloAndColorAndCapacidad(Modelo modelo, Color color, Capacidad capacidad);
  boolean existsBySku(String sku);
  List<Variante> findAllByModelo_Id(Long modeloId);
  List<Variante> findAllByIdIn(Collection<Long> ids);

   @Query("""
    select v.modelo.id as modeloId, count(v) as variantes
    from Variante v
    where v.modelo.id in :modeloIds
    group by v.modelo.id
  """)
  List<ModeloVarianteCountRow> variantesPorModelo(Collection<Long> modeloIds);

  interface ModeloVarianteCountRow {
    Long getModeloId();
    long getVariantes();
  }

    List<Variante> findAllByModelo_IdInAndActivoTrue(Collection<Long> modeloIds);
}
