package com.globaltechnology.backend.repository;

import com.globaltechnology.backend.domain.MovimientoInventario;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;

public interface MovimientoInventarioRepository extends JpaRepository<MovimientoInventario, Long> {

  @Query("""
        select coalesce(sum(m.cantidad), 0)
        from MovimientoInventario m
        where m.variante.id = :varianteId
      """)
  Integer stockNoTrackeadoDeVariante(Long varianteId);

  @Query("""
        select m.variante.id as varianteId, coalesce(sum(m.cantidad), 0) as stock
        from MovimientoInventario m
        where m.variante.id in :varianteIds
        group by m.variante.id
      """)
  List<StockMovByVarianteRow> stockNoTrackeadoPorVariante(Collection<Long> varianteIds);

  void deleteByVariante_Id(Long varianteId);

  interface StockMovByVarianteRow {
    Long getVarianteId();

    Integer getStock();
  }

  public interface StockMovModeloProjection {
    Long getModeloId();

    String getNombre();

    Long getStock();
  }

  @Query("""
        select mo.id as modeloId,
               mo.nombre as nombre,
               coalesce(
                 sum(
                   case
                     when mov.tipo = com.globaltechnology.backend.domain.TipoMovimiento.ENTRADA
                       then mov.cantidad
                     when mov.tipo = com.globaltechnology.backend.domain.TipoMovimiento.VENTA
                       or mov.tipo = com.globaltechnology.backend.domain.TipoMovimiento.SALIDA
                       then -mov.cantidad
                     else 0
                   end
                 ), 0
               ) as stock
        from Modelo mo
          left join Variante v
            on v.modelo = mo
          left join MovimientoInventario mov
            on mov.variante = v
        where mo.trackeaUnidad = false
        group by mo.id, mo.nombre
      """)
  List<StockMovModeloProjection> findStockActualPorModeloNoTrackeado();
}
