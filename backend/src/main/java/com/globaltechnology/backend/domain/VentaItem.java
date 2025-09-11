package com.globaltechnology.backend.domain;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "ventas_items",
       indexes = {
         @Index(name = "idx_vi_venta", columnList = "venta_id"),
         @Index(name = "idx_vi_unidad", columnList = "unidad_id")
       })
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@EqualsAndHashCode(of = "id")
public class VentaItem {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(optional = false) @JoinColumn(name = "venta_id", nullable = false)
  private Venta venta;

  @ManyToOne(optional = false) @JoinColumn(name = "variante_id", nullable = false)
  private Variante variante;

  @ManyToOne(optional = false) @JoinColumn(name = "unidad_id", nullable = false)
  private Unidad unidad; // 1 fila = 1 unidad física

  @Column(name = "precio_unitario", precision = 14, scale = 2, nullable = false)
  private BigDecimal precioUnitario;

  @Column(name = "descuento_item", precision = 14, scale = 2)
  private BigDecimal descuentoItem;

  @Column(name = "observaciones", length = 500)
  private String observaciones;
}
