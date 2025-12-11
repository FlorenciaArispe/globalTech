package com.globaltechnology.backend.web;

import com.globaltechnology.backend.service.CategoriaService;
import com.globaltechnology.backend.web.dto.CategoriaCreateDTO;
import com.globaltechnology.backend.web.dto.CategoriaDTO;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/categorias")
public class CategoriaController {
  private final CategoriaService service;

  public CategoriaController(CategoriaService service) {
    this.service = service;
  }

  @GetMapping
  public List<CategoriaDTO> list() {
    return service.list();
  }

  @GetMapping("/{id}")
  public CategoriaDTO get(@PathVariable Long id) {
    return service.get(id);
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public CategoriaDTO create(@Valid @RequestBody CategoriaCreateDTO dto) {
    return service.create(dto);
  }

  @PutMapping("/{id}")
  public CategoriaDTO update(@PathVariable Long id, @Valid @RequestBody CategoriaCreateDTO dto) {
    return service.update(id, dto);
  }

  @DeleteMapping("/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void delete(@PathVariable Long id) {
    service.delete(id);
  }
}
