package com.globaltechnology.backend.service;

import java.util.List;
import org.springframework.stereotype.Service;
import com.globaltechnology.backend.repository.ModeloRepository;
import com.globaltechnology.backend.web.dto.ProductoCatalogoDTO;

@Service
public class CatalogoService {

  private final ModeloRepository modeloRepo;

  public CatalogoService(ModeloRepository modeloRepo) {
    this.modeloRepo = modeloRepo;
  }

  public List<ProductoCatalogoDTO> listarProductosCatalogo() {
    return modeloRepo.findAll().stream()
        .map(m -> new ProductoCatalogoDTO(
            m.getId(),
            m.getNombre(),
            m.getCategoria().getNombre(),
            m.getMarca().getNombre()))
        .toList();
  }
}