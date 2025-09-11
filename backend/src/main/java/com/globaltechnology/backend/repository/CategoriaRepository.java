// CategoriaRepository.java
package com.globaltechnology.backend.repository;
import com.globaltechnology.backend.domain.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;
public interface CategoriaRepository extends JpaRepository<Categoria, Long> {
  boolean existsByNombreIgnoreCase(String nombre);
}
