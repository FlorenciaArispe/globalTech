package com.globaltechnology.backend.web;

import com.globaltechnology.backend.service.CapacidadService;
import com.globaltechnology.backend.web.dto.CapacidadCreateDTO;
import com.globaltechnology.backend.web.dto.CapacidadDTO;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/capacidades")
public class CapacidadController {

  private final CapacidadService service;

  public CapacidadController(CapacidadService service) {
    this.service = service;
  }

  @GetMapping
  public List<CapacidadDTO> list() {
    return service.list();
  }

  @GetMapping("/{id}")
  public CapacidadDTO get(@PathVariable Long id) {
    return service.get(id);
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public CapacidadDTO create(@Valid @RequestBody CapacidadCreateDTO dto) {
    return service.create(dto);
  }

  @PutMapping("/{id}")
  public CapacidadDTO update(@PathVariable Long id, @Valid @RequestBody CapacidadCreateDTO dto) {
    return service.update(id, dto);
  }

  @DeleteMapping("/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void delete(@PathVariable Long id) {
    service.delete(id);
  }
}
