package com.globaltechnology.backend.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "unidades",
       indexes = {
         @Index(name = "idx_unidad_variante", columnList = "variante_id"),
         @Index(name = "idx_unidad_estado", columnList = "estado_stock")
       })
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@EqualsAndHashCode(of = "id")
public class Unidad extends Auditable {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(optional = false) @JoinColumn(name = "variante_id", nullable = false)
  private Variante variante;

  @Column(name = "imei", unique = true, length = 20)
  private String imei; // nullable si no aplica

  @Column(name = "numero_serie", length = 50)
  private String numeroSerie;

  @Column(name = "bateria_condicion_pct")
  private Integer bateriaCondicionPct; 

  @Column(name = "costo_unitario")
  private Long costoUnitario;

  @Enumerated(EnumType.STRING)
  @Column(name = "estado_stock", nullable = false, length = 20)
  private EstadoStock estadoStock = EstadoStock.EN_STOCK;

  @Column(name = "observaciones", length = 500)
  private String observaciones;
}
