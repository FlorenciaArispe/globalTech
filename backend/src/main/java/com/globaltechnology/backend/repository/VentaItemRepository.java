package com.globaltechnology.backend.repository;
import com.globaltechnology.backend.domain.VentaItem;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface VentaItemRepository extends JpaRepository<VentaItem, Long> {
  List<VentaItem> findByVentaId(Long ventaId);
}
