package com.globaltechnology.backend.domain;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "ventas_items", indexes = {
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

  // 👇 antes era optional=false; ahora opcional para no-trackeados
  @ManyToOne(optional = true) 
  @JoinColumn(name = "unidad_id", nullable = true)
  private Unidad unidad;

  @Column(name = "cantidad", nullable = false)
  private Integer cantidad; // 1 para trackeados, N para no-trackeados

  @Column(name = "precio_unitario", precision = 14, scale = 2, nullable = false)
  private BigDecimal precioUnitario;

  @Column(name = "descuento_item", precision = 14, scale = 2)
  private BigDecimal descuentoItem;
  
  @Column(name = "ref_tipo", length = 30)
private String refTipo;

@Column(name = "ref_id")
private Long refId;
}
