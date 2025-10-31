package com.globaltechnology.backend.web;

import com.globaltechnology.backend.domain.EstadoStock;
import com.globaltechnology.backend.service.UnidadService;
import com.globaltechnology.backend.web.dto.*;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/unidades")
public class UnidadController {
  private final UnidadService service;
  public UnidadController(UnidadService service){ this.service = service; }

  @GetMapping("/{id}")
  public UnidadDTO get(@PathVariable Long id){ return service.get(id); }

  @PostMapping @ResponseStatus(HttpStatus.CREATED)
  public UnidadDTO create(@Valid @RequestBody UnidadCreateDTO dto){ return service.create(dto); }

  @PutMapping("/{id}")
  public UnidadDTO update(@PathVariable Long id, @Valid @RequestBody UnidadUpdateDTO dto){ return service.update(id, dto); }

  @GetMapping("/por-variante/{varianteId}")
  public List<UnidadDTO> porVariante(@PathVariable Long varianteId){
    return service.listByVariante(varianteId);
  }

  @GetMapping
  public List<UnidadDTO> list(
      @RequestParam Long varianteId,
      @RequestParam(required = false) List<EstadoStock> estados) {
    return service.listByVariante(varianteId, estados);
  }

  @DeleteMapping("/{id}")
@ResponseStatus(HttpStatus.NO_CONTENT)
public void delete(@PathVariable Long id) {
    service.delete(id);
}

}
