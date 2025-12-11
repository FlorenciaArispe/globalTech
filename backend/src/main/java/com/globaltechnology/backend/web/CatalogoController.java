package com.globaltechnology.backend.web;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.globaltechnology.backend.repository.ProductoDestacadoRepository;
import com.globaltechnology.backend.service.ModeloService;
import com.globaltechnology.backend.web.dto.CatalogoItemDTO;
import com.globaltechnology.backend.web.dto.CatalogoItemResumenDTO;
import com.globaltechnology.backend.web.dto.TipoCatalogoItem;

@RestController
@RequestMapping("/api/catalogo")
public class CatalogoController {
  private final ModeloService modeloService;
  private final ProductoDestacadoRepository destacadoRepo;

  public CatalogoController(
      ModeloService modeloService,
      ProductoDestacadoRepository destacadoRepo) {
    this.modeloService = modeloService;
    this.destacadoRepo = destacadoRepo;
  }

  @GetMapping
  public List<CatalogoItemResumenDTO> listar(
      @RequestParam(required = false) TipoCatalogoItem tipo) {
    return modeloService.listarCatalogo(tipo);
  }

  @GetMapping("/detalle")
  public CatalogoItemDTO detalle(
      @RequestParam Long itemId,
      @RequestParam TipoCatalogoItem tipo) {
    return modeloService.obtenerDetalleCatalogo(itemId, tipo);
  }

  @GetMapping("/destacados")
  public List<CatalogoItemResumenDTO> listarDestacados() {
    var destacados = destacadoRepo.findAllByActivoTrueOrderByOrdenAscIdAsc();
    if (destacados.isEmpty())
      return List.of();

    var catalogo = modeloService.listarCatalogo(null);

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
