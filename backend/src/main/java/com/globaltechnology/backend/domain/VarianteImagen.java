package com.globaltechnology.backend.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
  name = "variante_imagenes",
  indexes = {
    @Index(name = "idx_varimg_variante", columnList = "variante_id")
  },
  uniqueConstraints = {
    @UniqueConstraint(name = "uk_varimg_var_set_orden", columnNames = {"variante_id","set_tipo","orden"})
  }
)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@EqualsAndHashCode(of = "id")
public class VarianteImagen {

  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(optional = false) @JoinColumn(name = "variante_id", nullable = false)
  private Variante variante;

  @Enumerated(EnumType.STRING)
  @Column(name = "set_tipo", nullable = false, length = 16)
  private ImagenSet setTipo; // SELLADO, USADO, CATALOGO

  @Column(name = "url", nullable = false, length = 500)
  private String url;

  @Column(name = "alt_text", length = 200)
  private String altText;

  // 0..2
  @Column(name = "orden", nullable = false)
  private int orden;

  @Column(name = "principal", nullable = false)
  @Builder.Default
  private boolean principal = false;
}
