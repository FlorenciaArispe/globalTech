// MovimientoInventarioRepository.java
package com.globaltechnology.backend.repository;
import com.globaltechnology.backend.domain.MovimientoInventario;
import org.springframework.data.jpa.repository.JpaRepository;
public interface MovimientoInventarioRepository extends JpaRepository<MovimientoInventario, Long> {}
