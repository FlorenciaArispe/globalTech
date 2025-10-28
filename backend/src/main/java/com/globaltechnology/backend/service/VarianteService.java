package com.globaltechnology.backend.service;

import com.globaltechnology.backend.domain.*;
import com.globaltechnology.backend.repository.*;
import com.globaltechnology.backend.web.dto.*;

import jakarta.transaction.Transactional;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;



@Service
public class VarianteService {
  private final VarianteRepository repo;
  private final ModeloRepository modeloRepo;
  private final ColorRepository colorRepo;
  private final CapacidadRepository capRepo;
  private final UnidadRepository unidadRepo;
   private final MovimientoInventarioRepository movRepo;


     private String uploadDir; 

  private static final List<EstadoStock> DISPONIBLES = List.of(EstadoStock.EN_STOCK);

  public VarianteService(VarianteRepository repo, ModeloRepository modeloRepo,
                         ColorRepository colorRepo, CapacidadRepository capRepo,
                         UnidadRepository unidadRepo,
                         MovimientoInventarioRepository movRepo) { 
    this.repo = repo; this.modeloRepo = modeloRepo;
    this.colorRepo = colorRepo; this.capRepo = capRepo; this.unidadRepo = unidadRepo;
    this.movRepo = movRepo; // ⬅️ NUEVO
  }

   private VarianteDTO toDTO(Variante v) {
    return new VarianteDTO(
        v.getId(),

        // modelo
        v.getModelo() != null ? v.getModelo().getId() : null,
        v.getModelo() != null ? v.getModelo().getNombre() : null,

        // color
        v.getColor() != null ? v.getColor().getId() : null,
        v.getColor() != null ? v.getColor().getNombre() : null,

        // capacidad
        v.getCapacidad() != null ? v.getCapacidad().getId() : null,
        v.getCapacidad() != null ? v.getCapacidad().getEtiqueta() : null,

        // stockDisponible (esto depende de tu lógica, te doy 3 opciones abajo)
        stockDeVariante(v),

        // precioBase
        v.getPrecioBase(), // asumiendo BigDecimal

        // createdAt / updatedAt
        v.getCreatedAt(),
        v.getUpdatedAt(),

        // imagenUrl
        v.getImagenUrl()
    );
  }


   private long stockDeVariante(Variante v) {
    if (v.getModelo().isTrackeaUnidad()) {
      return unidadRepo.countByVariante_IdAndEstadoStockIn(
          v.getId(), DISPONIBLES);
    } else {
      Integer s = movRepo.stockNoTrackeadoDeVariante(v.getId());
      return (s == null ? 0L : s.longValue());
    }
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
      v.getPrecioBase(),
      v.getCreatedAt(),
      v.getUpdatedAt(),
       v.getImagenUrl() 
    );
  }

   public Variante updatePrecioBase(Long varianteId, BigDecimal nuevoPrecio) {
    if (nuevoPrecio == null) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "precioBase es requerido");
    }
    if (nuevoPrecio.signum() < 0) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "precioBase no puede ser negativo");
    }

    var v = repo.findById(varianteId)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Variante no encontrada"));

    // si querés limitar decimales:
    nuevoPrecio = nuevoPrecio.setScale(2, java.math.RoundingMode.HALF_UP);

    v.setPrecioBase(nuevoPrecio);
    return repo.save(v);
  }


  public List<VarianteDTO> list() {
  var variantes = repo.findAll();

  // separo por tipo de tracking
  var tracked   = variantes.stream().filter(v -> v.getModelo().isTrackeaUnidad()).map(Variante::getId).toList();
  var untracked = variantes.stream().filter(v -> !v.getModelo().isTrackeaUnidad()).map(Variante::getId).toList();

  // stock por unidades (tracked)
  var stockUnidadMap = new java.util.HashMap<Long, Long>();
  if (!tracked.isEmpty()) {
    var rows = unidadRepo.stockPorVariante(tracked, DISPONIBLES);
    rows.forEach(r -> stockUnidadMap.put(r.getVarianteId(), r.getStock())); // getStock() debe ser Long
  }

  // stock por movimientos (untracked)
  var stockMovMap = new java.util.HashMap<Long, Long>();
  if (!untracked.isEmpty()) {
    var rows = movRepo.stockNoTrackeadoPorVariante(untracked);
    rows.forEach(r -> stockMovMap.put(r.getVarianteId(), r.getStock() == null ? 0L : r.getStock().longValue()));
  }

  // merge: para cada variante, usa el mapa que corresponda
  return variantes.stream()
      .map(v -> {
        long stock = v.getModelo().isTrackeaUnidad()
            ? stockUnidadMap.getOrDefault(v.getId(), 0L)
            : stockMovMap.getOrDefault(v.getId(), 0L);
        return toDTO(v, stock);
      })
      .toList();
}


  public VarianteDTO get(Long id){
  var v = repo.findById(id)
      .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,"Variante no encontrada"));
  long stock = stockDeVariante(v); // ⬅️ antes contabas sólo unidades
  return toDTO(v, stock);
}


 @Transactional
  public VarianteDTO guardarImagen(Long id, MultipartFile file) {
    Variante variante = repo.findById(id)
        .orElseThrow(() -> new RuntimeException("Variante no encontrada"));

    // 1. carpeta destino: /app/uploads/variantes/{id}
    Path varianteDir = Paths.get(uploadDir, "variantes", String.valueOf(id));
    try {
      Files.createDirectories(varianteDir);
    } catch (IOException e) {
      throw new RuntimeException("No se pudo crear el directorio de subida", e);
    }

    // 2. nombre único para evitar cache y colisiones
    String original = file.getOriginalFilename(); // ej: "foto.jpg"
    String ext = (original != null && original.contains("."))
        ? original.substring(original.lastIndexOf(".")) // ".jpg"
        : ".jpg"; // fallback
    String filename = "foto-" + System.currentTimeMillis() + ext;

    Path destino = varianteDir.resolve(filename);

    try {
      file.transferTo(destino.toFile());
    } catch (IOException e) {
      throw new RuntimeException("Error guardando archivo en disco", e);
    }

    // 3. armar la URL pública que va a consumir el front
    //    OJO: esto es una ruta HTTP servida por Spring, no el path físico
    String publicUrl = "/uploads/variantes/" + id + "/" + filename;
    variante.setImagenUrl(publicUrl);

    Variante saved = repo.save(variante);

    return toDTO(saved);
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

  // ✅ Validar precio
  if (dto.precioBase() == null || dto.precioBase().signum() < 0) {
    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Precio base inválido");
  }

  // ✅ Duplicado robusto (ver repo más abajo)
  if (repo.existsByModeloAndAtributos(modelo.getId(),
      color != null ? color.getId() : null,
      cap != null ? cap.getId() : null)) {
    throw new ResponseStatusException(HttpStatus.CONFLICT, "Ya existe una variante con esos atributos");
  }

  var v = Variante.builder()
      .modelo(modelo)
      .color(color)
      .capacidad(cap)
      .precioBase(dto.precioBase())     // ⬅️ SETEÁS EL PRECIO (era el 500)
      .build();

  try {
    v = repo.save(v);
  } catch (org.springframework.dao.DataIntegrityViolationException ex) {
    // por si la unique de DB salta igual
    throw new ResponseStatusException(HttpStatus.CONFLICT, "Variante duplicada", ex);
  }

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
        u.getBateriaCondicionPct(), u.getPrecioOverride(), u.getEstadoStock(), u.getEstadoProducto(),
        u.getCreatedAt(), u.getUpdatedAt()
      )).toList();
  }
}
