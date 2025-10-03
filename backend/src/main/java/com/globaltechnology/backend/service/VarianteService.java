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

  private static final List<EstadoStock> DISPONIBLES = List.of(EstadoStock.EN_STOCK);

  public VarianteService(VarianteRepository repo, ModeloRepository modeloRepo,
                         ColorRepository colorRepo, CapacidadRepository capRepo,
                         UnidadRepository unidadRepo) {
    this.repo = repo; this.modeloRepo = modeloRepo;
    this.colorRepo = colorRepo; this.capRepo = capRepo; this.unidadRepo = unidadRepo;
  }

  private VarianteDTO toDTO(Variante v, Long stock) {
    return new VarianteDTO(
      v.getId(),
      v.getModelo().getId(), v.getModelo().getNombre(),
      (v.getColor() != null ? v.getColor().getId() : null),
      (v.getColor() != null ? v.getColor().getNombre() : null),
      (v.getCapacidad() != null ? v.getCapacidad().getId() : null),
      (v.getCapacidad() != null ? v.getCapacidad().getEtiqueta() : null),
      stock,
      v.getCreatedAt(),
      v.getUpdatedAt()
    );
  }

  private VarianteDTO toDTO(Variante v) { return toDTO(v, null); }

  public List<VarianteDTO> list() {
    var variantes = repo.findAll();
    // si querés devolver stock en el listado:
    var ids = variantes.stream().map(Variante::getId).toList();
    var stockRows = unidadRepo.stockPorVariante(ids, DISPONIBLES);
    var stockMap = new java.util.HashMap<Long, Long>();
    stockRows.forEach(r -> stockMap.put(r.getVarianteId(), r.getStock()));
    return variantes.stream()
      .map(v -> toDTO(v, stockMap.getOrDefault(v.getId(), 0L)))
      .toList();
  }

  public VarianteDTO get(Long id){
    var v = repo.findById(id)
      .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,"Variante no encontrada"));
    long stock = unidadRepo.countByVariante_IdAndEstadoStockIn(id, DISPONIBLES);
    return toDTO(v, stock);
  }

  public VarianteDTO create(VarianteCreateDTO dto){
    var modelo = modeloRepo.findById(dto.modeloId())
      .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,"Modelo inválido"));

    Color color = null;
    if (modelo.isRequiereColor()) {
      if (dto.colorId()==null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Color requerido por el modelo");
      color = colorRepo.findById(dto.colorId())
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,"Color inválido"));
    } else if (dto.colorId()!=null) {
      color = colorRepo.findById(dto.colorId()).orElse(null);
    }

    Capacidad cap = null;
    if (modelo.isRequiereCapacidad()) {
      if (dto.capacidadId()==null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Capacidad requerida por el modelo");
      cap = capRepo.findById(dto.capacidadId())
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,"Capacidad inválida"));
    } else if (dto.capacidadId()!=null) {
      cap = capRepo.findById(dto.capacidadId()).orElse(null);
    }

    // Duplicado lógico (modelo + color + capacidad)
    if (repo.existsByModeloAndColorAndCapacidad(modelo, color, cap)) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, "Ya existe una variante con esos atributos");
    }

    var v = Variante.builder()
      .modelo(modelo).color(color).capacidad(cap)
      .build();

    v = repo.save(v);
    long stock = 0;
    return toDTO(v, stock);
  }

  public VarianteDTO update(Long id, VarianteUpdateDTO dto){
    var v = repo.findById(id)
      .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,"Variante no encontrada"));

    var modelo = modeloRepo.findById(dto.modeloId())
      .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,"Modelo inválido"));

    Color color = null;
    if (modelo.isRequiereColor()) {
      if (dto.colorId()==null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Color requerido");
      color = colorRepo.findById(dto.colorId())
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,"Color inválido"));
    } else if (dto.colorId()!=null) {
      color = colorRepo.findById(dto.colorId()).orElse(null);
    }

    Capacidad cap = null;
    if (modelo.isRequiereCapacidad()) {
      if (dto.capacidadId()==null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Capacidad requerida");
      cap = capRepo.findById(dto.capacidadId())
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,"Capacidad inválida"));
    } else if (dto.capacidadId()!=null) {
      cap = capRepo.findById(dto.capacidadId()).orElse(null);
    }

    // Duplicado lógico si cambian a una combinación existente
    if (!modelo.equals(v.getModelo()) ||
        (color != (v.getColor())) ||
        (cap != (v.getCapacidad()))) {
      if (repo.existsByModeloAndColorAndCapacidad(modelo, color, cap)) {
        throw new ResponseStatusException(HttpStatus.CONFLICT, "Ya existe una variante con esos atributos");
      }
    }

    v.setModelo(modelo);
    v.setColor(color);
    v.setCapacidad(cap);
    v = repo.save(v);
    long stock = unidadRepo.countByVariante_IdAndEstadoStockIn(v.getId(), DISPONIBLES);
    return toDTO(v, stock);
  }

  public void delete(Long id){
    if (!repo.existsById(id)) throw new ResponseStatusException(HttpStatus.NOT_FOUND,"Variante no encontrada");
    if (unidadRepo.existsByVariante_Id(id)) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, "No se puede eliminar: la variante tiene unidades asociadas");
    }
    repo.deleteById(id);
  }

  public VarianteStockDTO stock(Long id){
    if (!repo.existsById(id)) throw new ResponseStatusException(HttpStatus.NOT_FOUND,"Variante no encontrada");
    long count = unidadRepo.countByVariante_IdAndEstadoStockIn(id, DISPONIBLES);
    return new VarianteStockDTO(id, count);
  }

  public List<UnidadDTO> unidadesDisponibles(Long id){
    var v = repo.findById(id)
      .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,"Variante no encontrada"));
    return unidadRepo.findByVarianteAndEstadoStock(v, EstadoStock.EN_STOCK)
      .stream()
      .map(u -> new UnidadDTO(
        u.getId(), v.getId(), u.getImei(), 
        u.getBateriaCondicionPct(), u.getCostoUnitario(), u.getEstadoStock(),
        u.getCreatedAt(), u.getUpdatedAt()
      )).toList();
  }
}
