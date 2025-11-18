package com.globaltechnology.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.globaltechnology.backend.domain.ProductoDestacado;
import com.globaltechnology.backend.web.dto.TipoCatalogoItem;

public interface ProductoDestacadoRepository extends JpaRepository<ProductoDestacado, Long> {
  List<ProductoDestacado> findAllByActivoTrueOrderByOrdenAscIdAsc();
  Optional<ProductoDestacado> findByTipoAndItemId(TipoCatalogoItem tipo, Long itemId);
}
