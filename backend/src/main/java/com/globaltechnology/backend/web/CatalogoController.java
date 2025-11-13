package com.globaltechnology.backend.web;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.globaltechnology.backend.service.CatalogoService;
import com.globaltechnology.backend.web.dto.ProductoCatalogoDTO;

@RestController
@RequestMapping("/api/catalogo")
public class CatalogoController {

  private final CatalogoService service;

  public CatalogoController(CatalogoService service) {
    this.service = service;
  }

  @GetMapping("/productos")
  public List<ProductoCatalogoDTO> listar() {
    return service.listarProductosCatalogo();
  }

}
