package com.globaltechnology.backend.repository;

import com.globaltechnology.backend.domain.VentaItem;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface VentaItemRepository extends JpaRepository<VentaItem, Long> {

 @Query("""
  SELECT i
  FROM VentaItem i
  JOIN FETCH i.variante v
  JOIN FETCH v.modelo m
  LEFT JOIN FETCH i.unidad u
  WHERE i.venta.id = :ventaId
  ORDER BY i.id
""")
List<VentaItem> findByVentaId(@Param("ventaId") Long ventaId);

}
