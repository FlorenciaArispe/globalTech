package com.globaltechnology.backend.web;

import com.globaltechnology.backend.service.ColorService;
import com.globaltechnology.backend.web.dto.ColorCreateDTO;
import com.globaltechnology.backend.web.dto.ColorDTO;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/colores")
public class ColorController {

  private final ColorService service;

  public ColorController(ColorService service) {
    this.service = service;
  }

  @GetMapping
  public List<ColorDTO> list() {
    return service.list();
  }

  @GetMapping("/{id}")
  public ColorDTO get(@PathVariable Long id) {
    return service.get(id);
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public ColorDTO create(@Valid @RequestBody ColorCreateDTO dto) {
    return service.create(dto);
  }

  @PutMapping("/{id}")
  public ColorDTO update(@PathVariable Long id, @Valid @RequestBody ColorCreateDTO dto) {
    return service.update(id, dto);
  }

  @DeleteMapping("/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void delete(@PathVariable Long id) {
    service.delete(id);
  }
}
