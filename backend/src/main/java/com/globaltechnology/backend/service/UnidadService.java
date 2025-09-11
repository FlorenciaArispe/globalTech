package com.globaltechnology.backend.service;

import com.globaltechnology.backend.domain.*;
import com.globaltechnology.backend.repository.UnidadRepository;
import com.globaltechnology.backend.repository.VarianteRepository;
import com.globaltechnology.backend.web.dto.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;

@Service
public class UnidadService {
  private final UnidadRepository repo;
  private final VarianteRepository varianteRepo;

  public UnidadService(UnidadRepository repo, VarianteRepository varianteRepo){
    this.repo = repo; this.varianteRepo = varianteRepo;
  }

  private UnidadDTO toDTO(Unidad u){
    return new UnidadDTO(
      u.getId(), u.getVariante().getId(), u.getVariante().getSku(), u.getImei(),
      u.getNumeroSerie(), u.getBateriaCondicionPct(), u.getCostoUnitario(),
      u.getEstadoStock(), u.getObservaciones(), u.getCreatedAt(), u.getUpdatedAt()
    );
  }

  public UnidadDTO get(Long id){
    var u = repo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,"Unidad no encontrada"));
    return toDTO(u);
  }

  @Transactional
  public UnidadDTO create(UnidadCreateDTO dto){
    var v = varianteRepo.findById(dto.varianteId())
      .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,"Variante inválida"));

    if (v.getModelo().isTrackeaImei()) {
      if (dto.imei()==null || dto.imei().isBlank())
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"IMEI requerido para este modelo");
      if (repo.findByImei(dto.imei()).isPresent())
        throw new ResponseStatusException(HttpStatus.CONFLICT,"IMEI ya registrado");
    }

    var u = Unidad.builder()
      .variante(v)
      .imei(dto.imei())
      .numeroSerie(dto.numeroSerie())
      .bateriaCondicionPct(dto.bateriaCondicionPct())
      .costoUnitario(dto.costoUnitario())
      .estadoStock(EstadoStock.EN_STOCK)
      .observaciones(dto.observaciones())
      .build();

    return toDTO(repo.save(u));
  }

  @Transactional
  public UnidadDTO update(Long id, UnidadUpdateDTO dto){
    var u = repo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,"Unidad no encontrada"));
    if (dto.bateriaCondicionPct()!=null) u.setBateriaCondicionPct(dto.bateriaCondicionPct());
    if (dto.costoUnitario()!=null) u.setCostoUnitario(dto.costoUnitario());
    if (dto.observaciones()!=null) u.setObservaciones(dto.observaciones());
    if (dto.estadoStock()!=null) u.setEstadoStock(dto.estadoStock());
    return toDTO(repo.save(u));
  }

  public List<UnidadDTO> listByVariante(Long varianteId){
    var v = varianteRepo.findById(varianteId)
      .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,"Variante no encontrada"));
    return repo.findByVarianteAndEstadoStock(v, EstadoStock.EN_STOCK)
      .stream().map(this::toDTO).toList();
  }
}
