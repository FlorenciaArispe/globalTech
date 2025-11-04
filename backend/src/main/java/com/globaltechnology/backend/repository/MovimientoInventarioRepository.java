package com.globaltechnology.backend.repository;
import com.globaltechnology.backend.domain.MovimientoInventario;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

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

  interface StockMovByVarianteRow {
    Long getVarianteId();
    Integer getStock();
  }
}
