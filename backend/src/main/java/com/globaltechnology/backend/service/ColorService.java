package com.globaltechnology.backend.service;

import com.globaltechnology.backend.domain.Color;
import com.globaltechnology.backend.repository.ColorRepository;
import com.globaltechnology.backend.web.dto.ColorCreateDTO;
import com.globaltechnology.backend.web.dto.ColorDTO;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class ColorService {
  private final ColorRepository repo;

  public ColorService(ColorRepository repo) { this.repo = repo; }

  private static ColorDTO toDTO(Color c) {
    return new ColorDTO(c.getId(), c.getNombre());
  }

  public List<ColorDTO> list() {
    return repo.findAll().stream().map(ColorService::toDTO).toList();
  }

  public ColorDTO get(Long id) {
    var c = repo.findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Color no encontrado"));
    return toDTO(c);
  }

  public ColorDTO create(ColorCreateDTO dto) {
    if (repo.existsByNombreIgnoreCase(dto.nombre())) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, "Ya existe un color con ese nombre");
    }
    var c = Color.builder()
        .nombre(dto.nombre().trim())
        .build();
    return toDTO(repo.save(c));
  }

  public ColorDTO update(Long id, ColorCreateDTO dto) {
    var c = repo.findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Color no encontrado"));
    c.setNombre(dto.nombre().trim());
    return toDTO(repo.save(c));
  }

  public void delete(Long id) {
    if (!repo.existsById(id)) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Color no encontrado");
    }
    repo.deleteById(id);
  }
}
