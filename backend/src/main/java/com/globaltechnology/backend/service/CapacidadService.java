package com.globaltechnology.backend.service;

import com.globaltechnology.backend.domain.Capacidad;
import com.globaltechnology.backend.repository.CapacidadRepository;
import com.globaltechnology.backend.web.dto.CapacidadCreateDTO;
import com.globaltechnology.backend.web.dto.CapacidadDTO;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class CapacidadService {
  private final CapacidadRepository repo;

  public CapacidadService(CapacidadRepository repo) { this.repo = repo; }

  private static CapacidadDTO toDTO(Capacidad c) {
    return new CapacidadDTO(c.getId(), c.getEtiqueta());
  }

  public List<CapacidadDTO> list() {
    return repo.findAll().stream().map(CapacidadService::toDTO).toList();
  }

  public CapacidadDTO get(Long id) {
    var c = repo.findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Capacidad no encontrada"));
    return toDTO(c);
  }

  public CapacidadDTO create(CapacidadCreateDTO dto) {
    if (repo.existsByEtiquetaIgnoreCase(dto.etiqueta())) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, "Ya existe una capacidad con esa etiqueta");
    }
    var c = Capacidad.builder()
        .etiqueta(dto.etiqueta().trim())
        .build();
    return toDTO(repo.save(c));
  }

  public CapacidadDTO update(Long id, CapacidadCreateDTO dto) {
    var c = repo.findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Capacidad no encontrada"));
    c.setEtiqueta(dto.etiqueta().trim());
    return toDTO(repo.save(c));
  }

  public void delete(Long id) {
    if (!repo.existsById(id)) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Capacidad no encontrada");
    }
    repo.deleteById(id);
  }
}
