package com.globaltechnology.backend.repository;

import com.globaltechnology.backend.domain.Modelo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ModeloRepository extends JpaRepository<Modelo, Long> {

  List<Modelo> findAllByCategoria_IdAndMarca_Id(Long categoriaId, Long marcaId);

  List<Modelo> findAllByCategoria_Id(Long categoriaId);

  List<Modelo> findAllByMarca_Id(Long marcaId);

  boolean existsByMarca_IdAndNombreIgnoreCase(Long marcaId, String nombre);

  boolean existsByMarca_IdAndNombreIgnoreCaseAndIdNot(Long marcaId, String nombre, Long excludeId);

  @Query("""
        select m.id as modeloId,
               m.nombre as nombre,
               coalesce(
                 sum(
                   case
                     when u.estadoStock = com.globaltechnology.backend.domain.EstadoStock.EN_STOCK
                     then 1
                     else 0
                   end
                 ), 0
               ) as stock
        from Modelo m
          left join Unidad u
            on u.variante.modelo = m
        group by m.id, m.nombre
      """)
  List<ModeloStockProjection> findStockActualPorModelo();

  public interface ModeloStockProjection {
    Long getModeloId();

    String getNombre();

    Long getStock();
  }

  @Query("""
        select m.id as modeloId,
               m.nombre as nombre,
               coalesce(
                 sum(
                   case
                     when u.estadoStock = com.globaltechnology.backend.domain.EstadoStock.EN_STOCK
                     then 1
                     else 0
                   end
                 ), 0
               ) as stock
        from Modelo m
          left join Unidad u
            on u.variante.modelo = m
        where m.trackeaUnidad = true
        group by m.id, m.nombre
      """)
  List<ModeloStockProjection> findStockActualPorModeloTrackeado();
}
