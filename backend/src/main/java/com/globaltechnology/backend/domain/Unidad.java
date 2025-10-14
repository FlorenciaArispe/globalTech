package com.globaltechnology.backend.domain;

import java.math.BigDecimal;

import jakarta.persistence.*;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.*;

@Entity
@Table(name = "unidades", indexes = {
    @Index(name = "idx_unidad_variante", columnList = "variante_id"),
    @Index(name = "idx_unidad_estado", columnList = "estado_stock")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Unidad extends Auditable {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(optional = false)
  @JoinColumn(name = "variante_id", nullable = false)
  private Variante variante;

  @Column(name = "imei", unique = true, length = 20)
  private String imei;

    @Min(0) @Max(100)
  @Column(name = "bateria_condicion_pct")
  private Integer bateriaCondicionPct;

  @Enumerated(EnumType.STRING)
  @Column(name = "estado_stock", nullable = false, length = 20)
  @Builder.Default
  private EstadoStock estadoStock = EstadoStock.EN_STOCK;

  @Enumerated(EnumType.STRING)
  @Column(name = "estado_producto", nullable = false, length = 16)
  @Builder.Default
  private EstadoComercial estadoProducto = EstadoComercial.NUEVO;


  // Si es null, usar Variante.precio
  @Column(name = "precio_override", precision = 12, scale = 2)
  private BigDecimal precioOverride;

   // --- Regla condicional: si es USADO, la batería es obligatoria 0..100
  @AssertTrue(message = "bateriaCondicionPct es obligatoria (0–100) cuando estadoProducto = USADO")
  public boolean isBateriaValidaParaUsado() {
    if (estadoProducto == EstadoComercial.USADO) {
      return bateriaCondicionPct != null
          && bateriaCondicionPct >= 0
          && bateriaCondicionPct <= 100;
    }
    // Si NO es USADO, la batería puede ser null o (si viene) debe estar en rango
    return bateriaCondicionPct == null
        || (bateriaCondicionPct >= 0 && bateriaCondicionPct <= 100);
  }

}
