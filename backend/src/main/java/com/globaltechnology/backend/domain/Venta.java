package com.globaltechnology.backend.domain;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "ventas",
       indexes = @Index(name = "idx_venta_fecha", columnList = "fecha"))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@EqualsAndHashCode(of = "id")
public class Venta extends Auditable {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "fecha", nullable = false)
  private Instant fecha;

  @ManyToOne @JoinColumn(name = "cliente_id")
  private Cliente cliente; 

  @Column(name = "descuento_total", precision = 14, scale = 2)
  private BigDecimal descuentoTotal;

  @Column(name = "total", precision = 14, scale = 2)
  private BigDecimal total;

  @Column(name = "observaciones", length = 500)
  private String observaciones;
}
