package com.globaltechnology.backend.web;

import com.globaltechnology.backend.service.ProductoStatsService;
import com.globaltechnology.backend.web.dto.ProductoStatsDTO;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/productos")
public class ProductoStatsController {

  private final ProductoStatsService service;

  public ProductoStatsController(ProductoStatsService service) {
    this.service = service;
  }

  @GetMapping("/stats")
  public ProductoStatsDTO stats() {
    return service.stats();
  }
}
