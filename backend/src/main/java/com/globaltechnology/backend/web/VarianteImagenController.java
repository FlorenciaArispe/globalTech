package com.globaltechnology.backend.web;

import com.globaltechnology.backend.domain.ImagenSet;
import com.globaltechnology.backend.service.VarianteImagenService;
import com.globaltechnology.backend.web.dto.*;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.MediaType;

import java.io.IOException;
import java.util.*;

@RestController
@RequestMapping("/api/variantes/{varianteId}/imagenes")
public class VarianteImagenController {

  private final VarianteImagenService service;

  public VarianteImagenController(VarianteImagenService service) {
    this.service = service;
  }

  @GetMapping
  public VarianteImagenListDTO list(@PathVariable Long varianteId) {
    return service.list(varianteId);
  }

  @PutMapping(path = "/{set}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public List<VarianteImagenDTO> replaceSet(
      @PathVariable("varianteId") Long varianteId,
      @PathVariable("set") ImagenSet set,
      @RequestParam("files") List<MultipartFile> files,
      @RequestParam(value = "alts", required = false) List<String> alts) throws IOException {
    return service.replaceSet(varianteId, set, files, alts);
  }

  @DeleteMapping("/{imagenId}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void deleteOne(@PathVariable Long varianteId, @PathVariable Long imagenId) {
   
    service.deleteImage(imagenId);
  }

  @PostMapping(path = "/{set}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public List<VarianteImagenDTO> appendSet(
      @PathVariable("varianteId") Long varianteId,
      @PathVariable("set") ImagenSet set,
      @RequestParam("files") List<MultipartFile> files,
      @RequestParam(value = "alts", required = false) List<String> alts) throws IOException {
    return service.appendToSet(varianteId, set, files, alts);
  }

}
