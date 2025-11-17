package com.globaltechnology.backend.repository;

import com.globaltechnology.backend.domain.VentaItem;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
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

  @Query("""
        SELECT i
        FROM VentaItem i
        JOIN FETCH i.variante v
        JOIN FETCH v.modelo m
        JOIN i.venta ven
        WHERE ven.fecha BETWEEN :desde AND :hasta
      """)
  List<VentaItem> findByFechaVentaEntre(@Param("desde") Instant desde,
                                        @Param("hasta") Instant hasta);


  // 👇👇 ESTA ES SOLO LA PROJECTION, SIN QUERY
  public interface TopModeloProjection {
    Long getModeloId();
    String getNombre();
    Long getUnidadesVendidas();
  }

  // 👇👇 Y ESTE ES EL MÉTODO DEL REPOSITORY QUE USA ESA PROJECTION
  @Query("""
        SELECT m.id AS modeloId,
               m.nombre AS nombre,
               SUM(i.cantidad) AS unidadesVendidas
        FROM VentaItem i
        JOIN i.variante v
        JOIN v.modelo m
        JOIN i.venta ven
        WHERE ven.fecha BETWEEN :desde AND :hasta
        GROUP BY m.id, m.nombre
        ORDER BY unidadesVendidas DESC
      """)
  List<TopModeloProjection> findTopModelosVendidosEntre(
      @Param("desde") Instant desde,
      @Param("hasta") Instant hasta
  );

  @Query("""
  SELECT m.id AS modeloId,
         m.nombre AS nombre,
         SUM(i.cantidad) AS unidadesVendidas
  FROM VentaItem i
  JOIN i.variante v
  JOIN v.modelo m
  GROUP BY m.id, m.nombre
      ORDER BY unidadesVendidas DESC
""")
List<TopModeloProjection> findVentasTotalesPorModelo();
}
