package com.globaltechnology.backend.web;

import com.globaltechnology.backend.service.ModeloService;
import com.globaltechnology.backend.web.dto.ModeloCreateDTO;
import com.globaltechnology.backend.web.dto.ModeloDTO;
import com.globaltechnology.backend.web.dto.ModeloTablaDTO;
import com.globaltechnology.backend.web.dto.ModeloUpdateDTO;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/modelos")

public class ModeloController {
  private final ModeloService service;
  public ModeloController(ModeloService service){ this.service = service; }

  @GetMapping
  public List<ModeloDTO> list(@RequestParam(required = false) Long categoriaId,
                              @RequestParam(required = false) Long marcaId){
    return service.list(categoriaId, marcaId);
  }

  @GetMapping("/{id}") public ModeloDTO get(@PathVariable Long id){ return service.get(id); }

   @GetMapping("/tabla")
  public List<ModeloTablaDTO> tabla(@RequestParam(required = false) Long categoriaId,
                                    @RequestParam(required = false) Long marcaId) {
    return service.tablaProductos(categoriaId, marcaId);
  }

  @PostMapping @ResponseStatus(HttpStatus.CREATED)
  public ModeloDTO create(@Valid @RequestBody ModeloCreateDTO dto){ return service.create(dto); }

  @PutMapping("/{id}")
  public ModeloDTO update(@PathVariable Long id, @Valid @RequestBody ModeloUpdateDTO dto){ return service.update(id, dto); }

  @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT)
  public void delete(@PathVariable Long id){ service.delete(id); }
}
