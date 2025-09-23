package com.globaltechnology.backend.web;

import com.globaltechnology.backend.service.ModeloService;
import com.globaltechnology.backend.web.dto.ModeloCreateDTO;
import com.globaltechnology.backend.web.dto.ModeloDTO;
import com.globaltechnology.backend.web.dto.ModeloUpdateDTO;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/modelos")
public class ModeloController {
  private final ModeloService service;
  public ModeloController(ModeloService service){ this.service = service; }

  @GetMapping public List<ModeloDTO> list(){ return service.list(); }
  @GetMapping("/{id}") public ModeloDTO get(@PathVariable Long id){ return service.get(id); }

  @PreAuthorize("hasRole('ADMIN')")
  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public ModeloDTO create(@Valid @RequestBody ModeloCreateDTO dto){ return service.create(dto); }

  @PutMapping("/{id}")
  public ModeloDTO update(@PathVariable Long id, @Valid @RequestBody ModeloUpdateDTO dto){ return service.update(id, dto); }

  @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT)
  public void delete(@PathVariable Long id){ service.delete(id); }
}
