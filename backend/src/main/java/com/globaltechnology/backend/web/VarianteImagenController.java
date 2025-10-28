package com.globaltechnology.backend.web;

import com.globaltechnology.backend.service.VarianteService;
import com.globaltechnology.backend.web.dto.VarianteDTO;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/variantes")
public class VarianteImagenController {

  private final VarianteService varianteService;

  public VarianteImagenController(VarianteService varianteService) {
    this.varianteService = varianteService;
  }

  @PostMapping("/{id}/imagen")
  public VarianteDTO uploadImagen(
      @PathVariable Long id,
      @RequestParam("file") MultipartFile file
  ) {
    return varianteService.guardarImagen(id, file);
  }
}
