package com.globaltechnology.backend.service;

import com.globaltechnology.backend.domain.*;
import com.globaltechnology.backend.repository.UnidadRepository;
import com.globaltechnology.backend.repository.VarianteRepository;
import com.globaltechnology.backend.web.dto.*;

import jakarta.persistence.EntityNotFoundException;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;

@Service
public class UnidadService {
  private final UnidadRepository repo;
  private final VarianteRepository varianteRepo;

  public UnidadService(UnidadRepository repo, VarianteRepository varianteRepo) {
    this.repo = repo;
    this.varianteRepo = varianteRepo;
  }

  private UnidadDTO toDTO(Unidad u) {
    return new UnidadDTO(
        u.getId(), u.getVariante().getId(), u.getImei(),
        u.getBateriaCondicionPct(), u.getPrecioOverride(),
        u.getEstadoStock(), u.getEstadoProducto(),  u.getCreatedAt(), u.getUpdatedAt());
  }

  public UnidadDTO get(Long id) {
    var u = repo.findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Unidad no encontrada"));
    return toDTO(u);
  }

@Transactional
public UnidadDTO create(UnidadCreateDTO dto) {
  var v = varianteRepo.findById(dto.varianteId())
      .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Variante inválida"));

  if (v.getModelo().isTrackeaUnidad()) {
    if (dto.imei() == null || dto.imei().isBlank())
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "IMEI requerido para este modelo");
    if (repo.existsByImei(dto.imei()))
      throw new ResponseStatusException(HttpStatus.CONFLICT, "IMEI ya registrado");
  }

  var estado = (dto.estadoProducto() != null) ? dto.estadoProducto() : EstadoComercial.NUEVO;

  if (estado == EstadoComercial.USADO && dto.bateriaCondicionPct() == null) {
    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "bateriaCondicionPct es obligatoria cuando el estado es USADO");
  }
  if (dto.bateriaCondicionPct() != null &&
      (dto.bateriaCondicionPct() < 0 || dto.bateriaCondicionPct() > 100)) {
    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "bateriaCondicionPct debe estar entre 0 y 100");
  }

  var u = Unidad.builder()
      .variante(v)
      .imei(dto.imei())
      .bateriaCondicionPct(dto.bateriaCondicionPct())
      .precioOverride(dto.precioOverride())     
      .estadoProducto(estado)                
      .estadoStock(EstadoStock.EN_STOCK) 
      .build();

  return toDTO(repo.save(u));
}



  @Transactional
public UnidadDTO update(Long id, UnidadUpdateDTO dto) {
  var u = repo.findById(id)
      .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Unidad no encontrada"));

  // qué estado quedaría luego del update (para validar coherente)
  var proximoEstado = dto.estadoProducto() != null ? dto.estadoProducto() : u.getEstadoProducto();
  var proximaBateria = dto.bateriaCondicionPct() != null ? dto.bateriaCondicionPct() : u.getBateriaCondicionPct();

  if (proximoEstado == EstadoComercial.USADO && proximaBateria == null) {
    throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
        "bateriaCondicionPct es obligatoria cuando el estado es USADO");
  }
  if (proximaBateria != null && (proximaBateria < 0 || proximaBateria > 100)) {
    throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
        "bateriaCondicionPct debe estar entre 0 y 100");
  }

  if (dto.bateriaCondicionPct() != null) u.setBateriaCondicionPct(dto.bateriaCondicionPct());
  if (dto.precioOverride()     != null) u.setPrecioOverride(dto.precioOverride());
  if (dto.estadoStock()        != null) u.setEstadoStock(dto.estadoStock());
  if (dto.estadoProducto()     != null) u.setEstadoProducto(dto.estadoProducto());

  return toDTO(repo.save(u));
}


  // Versión “simple” (tuya), sólo EN_STOCK
  public List<UnidadDTO> listByVariante(Long varianteId) {
    var v = varianteRepo.findById(varianteId)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Variante no encontrada"));
    return repo.findByVarianteAndEstadoStock(v, EstadoStock.EN_STOCK)
        .stream().map(this::toDTO).toList();
  }

  // Versión alternativa con filtro opcional de estados (por query param)
  public List<UnidadDTO> listByVariante(Long varianteId, List<EstadoStock> estados) {
    if (!varianteRepo.existsById(varianteId))
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Variante no encontrada");
    var filtros = (estados == null || estados.isEmpty()) ? List.of(EstadoStock.EN_STOCK) : estados;
    return repo.findAllByVariante_IdAndEstadoStockIn(varianteId, filtros)
        .stream().map(this::toDTO).toList();
  }

  @Transactional
public void delete(Long id) {
    Unidad unidad = repo.findById(id)
        .orElseThrow(() -> new EntityNotFoundException("Unidad no encontrada"));
    repo.delete(unidad);
}

}
