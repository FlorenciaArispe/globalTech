package com.globaltechnology.backend.web;

import com.globaltechnology.backend.service.InventarioService;
import com.globaltechnology.backend.web.dto.InventarioRowDTO;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventario")
public class InventarioController {

  private final InventarioService service;

  public InventarioController(InventarioService service) {
    this.service = service;
  }

  @GetMapping
  public List<InventarioRowDTO> list(
      @RequestParam(required = false) Long categoriaId,
      @RequestParam(required = false) Long marcaId) {
    return service.listarInventario(categoriaId, marcaId);
  }
}
