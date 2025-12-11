package com.globaltechnology.backend.domain;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity
@Table(name = "movimientos_inventario", indexes = {
    @Index(name = "idx_mov_variante", columnList = "variante_id"),
    @Index(name = "idx_mov_unidad", columnList = "unidad_id"),
    @Index(name = "idx_mov_fecha", columnList = "fecha")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(of = "id")
public class MovimientoInventario {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false)
  private Instant fecha;

  @Enumerated(EnumType.STRING) 
  @Column(nullable = false, length = 30)
  private TipoMovimiento tipo; 

  @ManyToOne(optional = false)
  @JoinColumn(name = "variante_id", nullable = false)
  private Variante variante;

  @ManyToOne
  @JoinColumn(name = "unidad_id")
  private Unidad unidad;

  @Column(name = "cantidad", nullable = false)
  private Integer cantidad;

  @Column(name = "ref_tipo", length = 50)
  private String refTipo;

  @Column(name = "ref_id")
  private Long refId;

  @Column(name = "notas", length = 500)
  private String notas;
}
