// VentaItemRepository.java
package com.globaltechnology.backend.repository;
import com.globaltechnology.backend.domain.VentaItem;
import org.springframework.data.jpa.repository.JpaRepository;
public interface VentaItemRepository extends JpaRepository<VentaItem, Long> {}
