package com.globaltechnology.backend.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
  name = "modelos",
  uniqueConstraints = @UniqueConstraint(name = "uk_modelo_marca_nombre", columnNames = {"marca_id","nombre"}),
  indexes = {
    @Index(name = "idx_modelo_categoria", columnList = "categoria_id"),
    @Index(name = "idx_modelo_marca", columnList = "marca_id")
  }
)

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@EqualsAndHashCode(of = "id")
public class Modelo {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(optional = false) @JoinColumn(name = "categoria_id", nullable = false)
  private Categoria categoria;

  @ManyToOne(optional = false) @JoinColumn(name = "marca_id", nullable = false)
  private Marca marca;

  @Column(name = "nombre", nullable = false, length = 120)
  private String nombre;

  @Column(name = "trackea_imei", nullable = false)
  private boolean trackeaUnidad;

  @Column(name = "requiere_color", nullable = false)
  private boolean requiereColor;

  @Column(name = "requiere_capacidad", nullable = false)
  private boolean requiereCapacidad;
}
