package com.globaltechnology.backend.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "marcas")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(of = "id")
public class Marca {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "nombre", nullable = false, unique = true, length = 100)
  private String nombre;
}
