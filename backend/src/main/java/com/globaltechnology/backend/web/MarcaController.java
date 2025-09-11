package com.globaltechnology.backend.web;

import com.globaltechnology.backend.service.MarcaService;
import com.globaltechnology.backend.web.dto.MarcaCreateDTO;
import com.globaltechnology.backend.web.dto.MarcaDTO;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/marcas")
public class MarcaController {
  private final MarcaService service;
  public MarcaController(MarcaService service){ this.service = service; }

  @GetMapping public List<MarcaDTO> list(){ return service.list(); }
  @GetMapping("/{id}") public MarcaDTO get(@PathVariable Long id){ return service.get(id); }

  @PostMapping @ResponseStatus(HttpStatus.CREATED)
  public MarcaDTO create(@Valid @RequestBody MarcaCreateDTO dto){ return service.create(dto); }

  @PutMapping("/{id}")
  public MarcaDTO update(@PathVariable Long id, @Valid @RequestBody MarcaCreateDTO dto){ return service.update(id, dto); }

  @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT)
  public void delete(@PathVariable Long id){ service.delete(id); }
}
