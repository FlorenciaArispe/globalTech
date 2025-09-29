package com.globaltechnology.backend.service;

import com.globaltechnology.backend.domain.Categoria;
import com.globaltechnology.backend.domain.Marca;
import com.globaltechnology.backend.domain.Modelo;
import com.globaltechnology.backend.repository.CategoriaRepository;
import com.globaltechnology.backend.repository.MarcaRepository;
import com.globaltechnology.backend.repository.ModeloRepository;
import com.globaltechnology.backend.web.dto.ModeloCreateDTO;
import com.globaltechnology.backend.web.dto.ModeloDTO;
import com.globaltechnology.backend.web.dto.ModeloUpdateDTO;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;

@Service
public class ModeloService {
  private final ModeloRepository repo;
  private final CategoriaRepository catRepo;
  private final MarcaRepository marcaRepo;

  public ModeloService(ModeloRepository repo, CategoriaRepository catRepo, MarcaRepository marcaRepo) {
    this.repo = repo; this.catRepo = catRepo; this.marcaRepo = marcaRepo;
  }

  private ModeloDTO toDTO(Modelo m){
    return new ModeloDTO(
      m.getId(),
      m.getCategoria().getId(), m.getCategoria().getNombre(),
      m.getMarca().getId(), m.getMarca().getNombre(),
      m.getNombre(), m.isTrackeaImei(), m.isRequiereColor(), m.isRequiereCapacidad()
    );
  }

  public List<ModeloDTO> list(){ return repo.findAll().stream().map(this::toDTO).toList(); }
  public ModeloDTO get(Long id){
    var m = repo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,"Modelo no encontrado"));
    return toDTO(m);
  }

  public ModeloDTO create(ModeloCreateDTO dto){
    Categoria cat = catRepo.findById(dto.categoriaId())
      .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,"Categoría inválida"));
    Marca marca = marcaRepo.findById(dto.marcaId())
      .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,"Marca inválida"));


    var m = Modelo.builder()
      .categoria(cat).marca(marca).nombre(dto.nombre().trim())
      .trackeaImei(dto.trackeaImei())
      .requiereColor(dto.requiereColor())
      .requiereCapacidad(dto.requiereCapacidad())
      .build();
    return toDTO(repo.save(m));
  }

  public ModeloDTO update(Long id, ModeloUpdateDTO dto){
    var m = repo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,"Modelo no encontrado"));
    var cat = catRepo.findById(dto.categoriaId())
      .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,"Categoría inválida"));
    var marca = marcaRepo.findById(dto.marcaId())
      .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,"Marca inválida"));

    if (dto.trackeaImei() && !"Teléfonos".equalsIgnoreCase(cat.getNombre()))
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"trackeaImei solo para categoría Teléfonos");

    m.setCategoria(cat);
    m.setMarca(marca);
    m.setNombre(dto.nombre().trim());
    m.setTrackeaImei(dto.trackeaImei());
    m.setRequiereColor(dto.requiereColor());
    m.setRequiereCapacidad(dto.requiereCapacidad());
    return toDTO(repo.save(m));
  }

  public void delete(Long id){
    if (!repo.existsById(id)) throw new ResponseStatusException(HttpStatus.NOT_FOUND,"Modelo no encontrado");
    repo.deleteById(id);
  }
}
