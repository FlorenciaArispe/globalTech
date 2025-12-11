package com.globaltechnology.backend.domain;

import com.globaltechnology.backend.web.dto.TipoCatalogoItem;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "productos_destacados", uniqueConstraints = @UniqueConstraint(name = "uk_producto_destacado_tipo_item", columnNames = {
    "tipo", "item_id" }))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductoDestacado {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Enumerated(EnumType.STRING)
  @Column(name = "tipo", nullable = false, length = 40)
  private TipoCatalogoItem tipo; 

  @Column(name = "item_id", nullable = false)
  private Long itemId; 

  @Column(name = "orden")
  private Integer orden; 

  @Column(name = "activo", nullable = false)
  private boolean activo = true;
}
