package com.globaltechnology.backend.repository;

import com.globaltechnology.backend.domain.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.*;

public interface UnidadRepository extends JpaRepository<Unidad, Long> {

  long countByVariante_IdAndEstadoStockIn(Long varianteId, Collection<EstadoStock> estados);

  @Query("""
        select u.variante.id as varianteId, count(u) as stock
        from Unidad u
        where u.variante.id in :varianteIds and u.estadoStock in :estados
        group by u.variante.id
      """)
  List<VarianteStockRow> stockPorVariante(Collection<Long> varianteIds, Collection<EstadoStock> estados);

  Optional<Unidad> findByImei(String imei);

  boolean existsByImei(String imei);

  boolean existsByVariante_Id(Long varianteId);

  List<Unidad> findByVarianteAndEstadoStock(Variante variante, EstadoStock estado);

  List<Unidad> findAllByVariante_IdAndEstadoStockIn(Long varianteId, Collection<EstadoStock> estados);

  List<Unidad> findAllByVariante_Id(Long varianteId);

  @Query("""
        select u.variante.id as varianteId,
               u.estadoProducto as estadoProducto,
               count(u) as stock
        from Unidad u
        where u.variante.id in :varianteIds
          and u.estadoStock in :estados
        group by u.variante.id, u.estadoProducto
      """)
  List<VarianteStockPorEstadoRow> stockPorVarianteYEstado(Collection<Long> varianteIds,
      Collection<EstadoStock> estados);

  List<Unidad> findAllByVariante_IdIn(Collection<Long> varianteIds);

  public interface VarianteStockPorEstadoRow {
    Long getVarianteId();

    EstadoComercial getEstadoProducto();

    long getStock();
  }

  interface ModeloStockRow {
    Long getModeloId();

    long getStock();
  }

  interface VarianteStockRow {
    Long getVarianteId();

    Long getStock();
  }

}
