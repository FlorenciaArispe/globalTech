package com.globaltechnology.backend.service;

import com.globaltechnology.backend.domain.Categoria;
import com.globaltechnology.backend.repository.CategoriaRepository;
import com.globaltechnology.backend.web.dto.CategoriaCreateDTO;
import com.globaltechnology.backend.web.dto.CategoriaDTO;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;

@Service
public class CategoriaService {
  private final CategoriaRepository repo;
  public CategoriaService(CategoriaRepository repo){ this.repo = repo; }

  private static CategoriaDTO toDTO(Categoria c){ return new CategoriaDTO(c.getId(), c.getNombre()); }

  public List<CategoriaDTO> list(){ return repo.findAll().stream().map(CategoriaService::toDTO).toList(); }
  public CategoriaDTO get(Long id){
    var c = repo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,"Categoría no encontrada"));
    return toDTO(c);
  }
  public CategoriaDTO create(CategoriaCreateDTO dto){
    if (repo.existsByNombreIgnoreCase(dto.nombre()))
      throw new ResponseStatusException(HttpStatus.CONFLICT,"Ya existe una categoría con ese nombre");
    var c = Categoria.builder().nombre(dto.nombre().trim()).build();
    return toDTO(repo.save(c));
  }
  public CategoriaDTO update(Long id, CategoriaCreateDTO dto){
    var c = repo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,"Categoría no encontrada"));
    c.setNombre(dto.nombre().trim());
    return toDTO(repo.save(c));
  }
  public void delete(Long id){
    if (!repo.existsById(id)) throw new ResponseStatusException(HttpStatus.NOT_FOUND,"Categoría no encontrada");
    repo.deleteById(id);
  }
}
