package com.globaltechnology.backend.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "variantes",
       indexes = {
         @Index(name = "idx_variante_modelo", columnList = "modelo_id"),
         @Index(name = "idx_variante_color", columnList = "color_id"),
         @Index(name = "idx_variante_capacidad", columnList = "capacidad_id")
       })
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@EqualsAndHashCode(of = "id")
public class Variante extends Auditable {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(optional = false) @JoinColumn(name = "modelo_id", nullable = false)
  private Modelo modelo;

  @ManyToOne @JoinColumn(name = "color_id")
  private Color color; // nullable

  @ManyToOne @JoinColumn(name = "capacidad_id")
  private Capacidad capacidad; // nullable

  @Column(name = "activo", nullable = false)
  private boolean activo = true;

  @Column(name = "sku", unique = true, length = 80)
  private String sku; // opcional, pero recomendable
}
