package com.globaltechnology.backend.web;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.globaltechnology.backend.repository.ProductoDestacadoRepository;
import com.globaltechnology.backend.service.CatalogoService;
import com.globaltechnology.backend.service.ModeloService;
import com.globaltechnology.backend.web.dto.CatalogoItemDTO;
import com.globaltechnology.backend.web.dto.ProductoCatalogoDTO;

@RestController
@RequestMapping("/api/catalogo")
public class CatalogoController {

  private final CatalogoService service;
    private final ModeloService modeloService;          // ← para el catálogo nuevo
  private final ProductoDestacadoRepository destacadoRepo;

 
  public CatalogoController(
      CatalogoService service,
      ModeloService modeloService,
      ProductoDestacadoRepository destacadoRepo
  ) {
    this.service = service;
    this.modeloService = modeloService;
    this.destacadoRepo = destacadoRepo;
  }
  @GetMapping("/productos")
  public List<ProductoCatalogoDTO> listar() {
    return service.listarProductosCatalogo();
  }

  @GetMapping("/destacados")
  public List<CatalogoItemDTO> listarDestacados() {
    var destacados = destacadoRepo.findAllByActivoTrueOrderByOrdenAscIdAsc();
    if (destacados.isEmpty()) return List.of();

    var catalogo = modeloService.listarCatalogo(null, null);

    Map<String, Integer> ordenPorClave = new HashMap<>();
    int fallback = 1000;

    for (var d : destacados) {
      String key = d.getTipo().name() + "#" + d.getItemId();
      ordenPorClave.put(key, d.getOrden() != null ? d.getOrden() : fallback++);
    }

    return catalogo.stream()
        .filter(item -> {
          String key = item.tipo().name() + "#" + item.itemId();
          return ordenPorClave.containsKey(key);
        })
        .sorted((a, b) -> {
          String ka = a.tipo().name() + "#" + a.itemId();
          String kb = b.tipo().name() + "#" + b.itemId();
          return Integer.compare(ordenPorClave.get(ka), ordenPorClave.get(kb));
        })
        .toList();
  }

  

}
