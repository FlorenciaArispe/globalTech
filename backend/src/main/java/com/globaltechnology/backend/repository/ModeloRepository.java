package com.globaltechnology.backend.repository;

import com.globaltechnology.backend.domain.Modelo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ModeloRepository extends JpaRepository<Modelo, Long> {

  List<Modelo> findAllByCategoria_IdAndMarca_Id(Long categoriaId, Long marcaId);
  List<Modelo> findAllByCategoria_Id(Long categoriaId);
  List<Modelo> findAllByMarca_Id(Long marcaId);

  boolean existsByMarca_IdAndNombreIgnoreCase(Long marcaId, String nombre);
  boolean existsByMarca_IdAndNombreIgnoreCaseAndIdNot(Long marcaId, String nombre, Long excludeId);
}
