// UnidadRepository.java
package com.globaltechnology.backend.repository;

import com.globaltechnology.backend.domain.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.*;

public interface UnidadRepository extends JpaRepository<Unidad, Long> {

  // ---- Agregados por variante (ya tenías este)
  long countByVariante_IdAndEstadoStockIn(Long varianteId, Collection<EstadoStock> estados);

  @Query("""
    select u.variante.id as varianteId, count(u) as stock
    from Unidad u
    where u.variante.id in :varianteIds and u.estadoStock in :estados
    group by u.variante.id
  """)
  List<VarianteStockRow> stockPorVariante(Collection<Long> varianteIds, Collection<EstadoStock> estados);

  interface VarianteStockRow {
    Long getVarianteId();
    long getStock();
  }

  // ---- Métodos que usa tu service (faltaban)
  Optional<Unidad> findByImei(String imei);
  boolean existsByImei(String imei);
  boolean existsByVariante_Id(Long varianteId);

  List<Unidad> findByVarianteAndEstadoStock(Variante variante, EstadoStock estado);

  // Opcionales (útiles):
  List<Unidad> findAllByVariante_IdAndEstadoStockIn(Long varianteId, Collection<EstadoStock> estados);
  List<Unidad> findAllByVariante_Id(Long varianteId);
  

   @Query("""
    select v.modelo.id as modeloId, count(u) as stock
    from Unidad u
    join u.variante v
    where v.modelo.id in :modeloIds and u.estadoStock in :estados
    group by v.modelo.id
  """)
  List<ModeloStockRow> stockPorModelo(Collection<Long> modeloIds, Collection<EstadoStock> estados);

  interface ModeloStockRow {
    Long getModeloId();
    long getStock();
  }

  
}
