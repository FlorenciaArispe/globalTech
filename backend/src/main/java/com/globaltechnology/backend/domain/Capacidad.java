package com.globaltechnology.backend.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "capacidades")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(of = "id")
public class Capacidad {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "etiqueta", nullable = false, unique = true, length = 60)
  private String etiqueta;
}
