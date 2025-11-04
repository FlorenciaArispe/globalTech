package com.globaltechnology.backend.web;

import com.globaltechnology.backend.domain.Variante;
import com.globaltechnology.backend.service.VarianteService;
import com.globaltechnology.backend.web.dto.*;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/variantes")
public class VarianteController {
  private final VarianteService service;

  public VarianteController(VarianteService service) {
    this.service = service;
  }

  @GetMapping
  public List<VarianteDTO> list() {
    return service.list();
  }

  @GetMapping("/{id}")
  public VarianteDTO get(@PathVariable Long id) {
    return service.get(id);
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public VarianteDTO create(@Valid @RequestBody VarianteCreateDTO dto) {
    return service.create(dto);
  }

  @PutMapping("/{id}")
  public VarianteDTO update(@PathVariable Long id, @Valid @RequestBody VarianteUpdateDTO dto) {
    return service.update(id, dto);
  }

  @DeleteMapping("/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void delete(@PathVariable Long id) {
    service.delete(id);
  }

  @GetMapping("/{id}/stock")
  public VarianteStockDTO stock(@PathVariable Long id) {
    return service.stock(id);
  }

  @GetMapping("/{id}/unidades-disponibles")
  public List<UnidadDTO> disponibles(@PathVariable Long id) {
    return service.unidadesDisponibles(id);
  }

  @PatchMapping("/{id}/precio-base")
  public Variante updatePrecioBase(@PathVariable Long id,
      @RequestBody VariantePrecioBaseUpdateDTO body) {
    log.info("PATCH /api/variantes/{}/precio-base precioBase={}", id, body.precioBase());
    return service.updatePrecioBase(id, body.precioBase());
  }
}