package com.globaltechnology.backend.domain;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity
@Table(name = "movimientos_inventario",
       indexes = {
         @Index(name = "idx_mov_variante", columnList = "variante_id"),
         @Index(name = "idx_mov_unidad", columnList = "unidad_id"),
         @Index(name = "idx_mov_tipo_fecha", columnList = "tipo,fecha")
       })
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@EqualsAndHashCode(of = "id")
public class MovimientoInventario {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "fecha", nullable = false)
  private Instant fecha;

  @Enumerated(EnumType.STRING)
  @Column(name = "tipo", nullable = false, length = 20)
  private TipoMovimiento tipo;

  @ManyToOne(optional = false) @JoinColumn(name = "variante_id", nullable = false)
  private Variante variante;

  @ManyToOne(optional = false) @JoinColumn(name = "unidad_id", nullable = false)
  private Unidad unidad;

  @Column(name = "ref_tipo", length = 30)
  private String refTipo; // "venta", "compra", "ajuste", etc.

  @Column(name = "ref_id")
  private Long refId; // id del documento (venta_id, compra_id, etc.)

  @Column(name = "notas", length = 500)
  private String notas;
}
