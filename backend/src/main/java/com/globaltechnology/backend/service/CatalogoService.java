package com.globaltechnology.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.globaltechnology.backend.domain.VarianteImagen;
import com.globaltechnology.backend.repository.ModeloRepository;
import com.globaltechnology.backend.repository.VarianteImagenRepository;
import com.globaltechnology.backend.web.dto.ProductoCatalogoDTO;
import com.globaltechnology.backend.web.dto.VarianteCatalogoDTO;

@Service
public class CatalogoService {

  private final ModeloRepository modeloRepo;

private final VarianteImagenRepository imgRepo;

public CatalogoService(ModeloRepository modeloRepo, VarianteImagenRepository imgRepo) {
    this.modeloRepo = modeloRepo;
    this.imgRepo = imgRepo;
}


public List<ProductoCatalogoDTO> listarProductosCatalogo() {
  return modeloRepo.findAll().stream()
      .map(m -> new ProductoCatalogoDTO(
          m.getId(),
          m.getNombre(),
          m.getCategoria().getNombre(),
          m.getMarca().getNombre()
      ))
      .toList();
}


}
