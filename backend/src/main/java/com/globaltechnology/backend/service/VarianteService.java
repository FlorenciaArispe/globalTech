package com.globaltechnology.backend.service;

import com.globaltechnology.backend.domain.*;
import com.globaltechnology.backend.repository.*;
import com.globaltechnology.backend.web.dto.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;

@Service
public class VarianteService {
  private final VarianteRepository repo;
  private final ModeloRepository modeloRepo;
  private final ColorRepository colorRepo;
  private final CapacidadRepository capRepo;
  private final UnidadRepository unidadRepo;

  public VarianteService(VarianteRepository repo, ModeloRepository modeloRepo,
                         ColorRepository colorRepo, CapacidadRepository capRepo,
                         UnidadRepository unidadRepo) {
    this.repo = repo; this.modeloRepo = modeloRepo;
    this.colorRepo = colorRepo; this.capRepo = capRepo; this.unidadRepo = unidadRepo;
  }

  private VarianteDTO toDTO(Variante v){
    return new VarianteDTO(
      v.getId(),
      v.getModelo().getId(), v.getModelo().getNombre(),
      v.getColor()!=null ? v.getColor().getId():null,
      v.getColor()!=null ? v.getColor().getNombre():null,
      v.getCapacidad()!=null ? v.getCapacidad().getId():null,
      v.getCapacidad()!=null ? v.getCapacidad().getEtiqueta():null,
      v.getEstadoComercial(), v.isActivo(), v.getSku(),
      v.getCreatedAt(), v.getUpdatedAt()
    );
  }

  public List<VarianteDTO> list(){ return repo.findAll().stream().map(this::toDTO).toList(); }
  public VarianteDTO get(Long id){
    var v = repo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,"Variante no encontrada"));
    return toDTO(v);
  }

  public VarianteDTO create(VarianteCreateDTO dto){
    var modelo = modeloRepo.findById(dto.modeloId())
      .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,"Modelo inválido"));

    Color color = null;
    if (modelo.isRequiereColor()) {
      if (dto.colorId()==null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Color requerido por el modelo");
      color = colorRepo.findById(dto.colorId()).orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,"Color inválido"));
    } else if (dto.colorId()!=null) {
      color = colorRepo.findById(dto.colorId()).orElse(null);
    }

    Capacidad cap = null;
    if (modelo.isRequiereCapacidad()) {
      if (dto.capacidadId()==null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Capacidad requerida por el modelo");
      cap = capRepo.findById(dto.capacidadId()).orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,"Capacidad inválida"));
    } else if (dto.capacidadId()!=null) {
      cap = capRepo.findById(dto.capacidadId()).orElse(null);
    }

    var v = Variante.builder()
      .modelo(modelo).color(color).capacidad(cap)
      .estadoComercial(dto.estadoComercial())
      .activo(dto.activo()==null ? true : dto.activo())
      .sku(dto.sku())
      .build();

    return toDTO(repo.save(v));
  }

  public VarianteDTO update(Long id, VarianteUpdateDTO dto){
    var v = repo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,"Variante no encontrada"));
    var modelo = modeloRepo.findById(dto.modeloId())
      .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,"Modelo inválido"));

    Color color = null;
    if (modelo.isRequiereColor()) {
      if (dto.colorId()==null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Color requerido");
      color = colorRepo.findById(dto.colorId()).orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,"Color inválido"));
    } else if (dto.colorId()!=null) {
      color = colorRepo.findById(dto.colorId()).orElse(null);
    }

    Capacidad cap = null;
    if (modelo.isRequiereCapacidad()) {
      if (dto.capacidadId()==null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Capacidad requerida");
      cap = capRepo.findById(dto.capacidadId()).orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,"Capacidad inválida"));
    } else if (dto.capacidadId()!=null) {
      cap = capRepo.findById(dto.capacidadId()).orElse(null);
    }

    v.setModelo(modelo);
    v.setColor(color);
    v.setCapacidad(cap);
    v.setEstadoComercial(dto.estadoComercial());
    if (dto.activo()!=null) v.setActivo(dto.activo());
    v.setSku(dto.sku());
    return toDTO(repo.save(v));
  }

  public void delete(Long id){
    if (!repo.existsById(id)) throw new ResponseStatusException(HttpStatus.NOT_FOUND,"Variante no encontrada");
    repo.deleteById(id);
  }

  public VarianteStockDTO stock(Long id){
    var v = repo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,"Variante no encontrada"));
    long count = unidadRepo.countByVarianteAndEstadoStock(v, EstadoStock.EN_STOCK);
    return new VarianteStockDTO(id, count);
  }

  public List<UnidadDTO> unidadesDisponibles(Long id){
    var v = repo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,"Variante no encontrada"));
    return unidadRepo.findByVarianteAndEstadoStock(v, EstadoStock.EN_STOCK).stream()
      .map(u -> new UnidadDTO(
        u.getId(), v.getId(), v.getSku(), u.getImei(), u.getNumeroSerie(),
        u.getBateriaCondicionPct(), u.getCostoUnitario(), u.getEstadoStock(),
        u.getObservaciones(), u.getCreatedAt(), u.getUpdatedAt()
      )).toList();
  }
}
