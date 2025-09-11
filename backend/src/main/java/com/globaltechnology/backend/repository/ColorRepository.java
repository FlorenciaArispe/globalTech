// ColorRepository.java
package com.globaltechnology.backend.repository;
import com.globaltechnology.backend.domain.Color;
import org.springframework.data.jpa.repository.JpaRepository;
public interface ColorRepository extends JpaRepository<Color, Long> {
  boolean existsByNombreIgnoreCase(String nombre);
}
