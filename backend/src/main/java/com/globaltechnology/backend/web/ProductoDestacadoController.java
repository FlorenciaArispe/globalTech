package com.globaltechnology.backend.web;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.globaltechnology.backend.domain.ProductoDestacado;
import com.globaltechnology.backend.repository.ProductoDestacadoRepository;
import com.globaltechnology.backend.web.dto.ProductoDestacadoCreateDTO;
import com.globaltechnology.backend.web.dto.TipoCatalogoItem;

@RestController
@RequestMapping("/api/catalogo/destacados")
public class ProductoDestacadoController {

  private final ProductoDestacadoRepository destacadoRepo;

  public ProductoDestacadoController(ProductoDestacadoRepository destacadoRepo) {
    this.destacadoRepo = destacadoRepo;
  }

  @PostMapping
  public void marcarDestacado(@RequestBody ProductoDestacadoCreateDTO dto) {
    var existente = destacadoRepo.findByTipoAndItemId(dto.tipo(), dto.itemId())
        .orElse(null);

    if (existente == null) {
      destacadoRepo.save(ProductoDestacado.builder()
          .tipo(dto.tipo())
          .itemId(dto.itemId())
          .orden(dto.orden())
          .activo(true)
          .build());
    } else {
      existente.setActivo(true);
      existente.setOrden(dto.orden());
      destacadoRepo.save(existente);
    }
  }

  @DeleteMapping
  public void desmarcarDestacado(@RequestParam TipoCatalogoItem tipo,
                                 @RequestParam Long itemId) {
    var existente = destacadoRepo.findByTipoAndItemId(tipo, itemId).orElse(null);
    if (existente != null) {
      existente.setActivo(false);
      destacadoRepo.save(existente);
    }
  }
}
