package com.globaltechnology.backend.service;

import com.globaltechnology.backend.domain.*;
import com.globaltechnology.backend.repository.*;
import com.globaltechnology.backend.web.dto.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.EnumMap;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
public class ModeloService {
  private final ModeloRepository repo;
  private final CategoriaRepository catRepo;
  private final MarcaRepository marcaRepo;
  private final VarianteRepository varianteRepo;
  private final UnidadRepository unidadRepo;
  private final MovimientoInventarioRepository movRepo;
  private final VarianteImagenRepository varianteImagenRepo;

  public ModeloService(ModeloRepository repo,
      CategoriaRepository catRepo,
      MarcaRepository marcaRepo,
      VarianteRepository varianteRepo,
      UnidadRepository unidadRepo,
      MovimientoInventarioRepository movRepo,
      VarianteImagenRepository varianteImagenRepo) {
    this.repo = repo;
    this.catRepo = catRepo;
    this.marcaRepo = marcaRepo;
    this.varianteRepo = varianteRepo;
    this.unidadRepo = unidadRepo;
    this.movRepo = movRepo;
    this.varianteImagenRepo = varianteImagenRepo;
  }

  private static final List<EstadoStock> DISPONIBLES = List.of(EstadoStock.EN_STOCK);

  private ModeloDTO toDTO(Modelo m) {
    return new ModeloDTO(
        m.getId(),
        m.getCategoria().getId(), m.getCategoria().getNombre(),
        m.getMarca().getId(), m.getMarca().getNombre(),
        m.getNombre(), m.isTrackeaUnidad(), m.isRequiereColor(), m.isRequiereCapacidad());
  }

  public List<ModeloDTO> list(Long categoriaId, Long marcaId) {
    List<Modelo> modelos;
    if (categoriaId != null && marcaId != null) {
      modelos = repo.findAllByCategoria_IdAndMarca_Id(categoriaId, marcaId);
    } else if (categoriaId != null) {
      modelos = repo.findAllByCategoria_Id(categoriaId);
    } else if (marcaId != null) {
      modelos = repo.findAllByMarca_Id(marcaId);
    } else {
      modelos = repo.findAll();
    }
    modelos.sort(Comparator.comparing(Modelo::getNombre, String.CASE_INSENSITIVE_ORDER));
    return modelos.stream().map(this::toDTO).toList();
  }

  public ModeloDTO get(Long id) {
    var m = repo.findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Modelo no encontrado"));
    return toDTO(m);
  }

  public ModeloDTO create(ModeloCreateDTO dto) {
    var cat = catRepo.findById(dto.categoriaId())
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Categoría inválida"));
    var marca = marcaRepo.findById(dto.marcaId())
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Marca inválida"));

    var nombre = dto.nombre().trim();
    if (repo.existsByMarca_IdAndNombreIgnoreCase(marca.getId(), nombre)) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, "Ya existe un modelo con ese nombre en la misma marca");
    }

    var m = Modelo.builder()
        .categoria(cat).marca(marca).nombre(nombre)
        .trackeaUnidad(dto.trackeaUnidad())
        .requiereColor(dto.requiereColor())
        .requiereCapacidad(dto.requiereCapacidad())
        .build();

    return toDTO(repo.save(m));
  }

  // com/globaltechnology/backend/service/ModeloService.java
  public ModeloDTO rename(Long id, ModeloRenameDTO dto) {
    var m = repo.findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Modelo no encontrado"));

    var nuevoNombre = dto.nombre().trim();
    if (nuevoNombre.isEmpty()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nombre inválido");
    }

    // evitar duplicado dentro de la misma marca
    if (repo.existsByMarca_IdAndNombreIgnoreCaseAndIdNot(m.getMarca().getId(), nuevoNombre, id)) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, "Ya existe un modelo con ese nombre en la misma marca");
    }

    m.setNombre(nuevoNombre);
    return toDTO(repo.save(m));
  }

  public void delete(Long id) {
    if (!repo.existsById(id))
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Modelo no encontrado");
    if (varianteRepo.existsByModelo_Id(id)) {
      throw new ResponseStatusException(HttpStatus.CONFLICT,
          "No se puede eliminar: el modelo tiene variantes asociadas");
    }
    repo.deleteById(id);
  }

 public List<ModeloTablaDTO> tablaProductos(Long categoriaId, Long marcaId) {
    try {
      // 1) filtrar modelos (igual a tu código)
      List<Modelo> modelos = (categoriaId != null && marcaId != null)
          ? repo.findAllByCategoria_IdAndMarca_Id(categoriaId, marcaId)
          : (categoriaId != null) ? repo.findAllByCategoria_Id(categoriaId)
          : (marcaId != null) ? repo.findAllByMarca_Id(marcaId)
          : repo.findAll();

      if (modelos.isEmpty()) return List.of();
      modelos.sort(Comparator.comparing(Modelo::getNombre, String.CASE_INSENSITIVE_ORDER));

      var modeloIds = modelos.stream().map(Modelo::getId).toList();

      // 2) variantes
      var variantes = varianteRepo.findAllByModelo_IdIn(modeloIds);
      if (variantes.isEmpty()) {
        var out = new ArrayList<ModeloTablaDTO>(modelos.size());
        for (var m : modelos) {
          out.add(new ModeloTablaDTO(
              m.getId(), m.getNombre(),
              m.getCategoria().getId(), m.getCategoria().getNombre(),
              m.isTrackeaUnidad(),
              List.of()
          ));
        }
        return out;
      }

      // 2b) Precargar imágenes y agrupar por varianteId y set (igual que Inventario)
      var varianteIds = variantes.stream().map(Variante::getId).toList();
      var todasImgs = varianteImagenRepo.findAllByVariante_IdIn(varianteIds);

      Map<Long, Map<ImagenSet, List<VarianteImagenDTO>>> imgsByVarAndSet =
          todasImgs.stream()
              .collect(Collectors.groupingBy(
                  vi -> vi.getVariante().getId(),
                  Collectors.groupingBy(
                      VarianteImagen::getSetTipo,
                      Collectors.collectingAndThen(
                          Collectors.toList(),
                          list -> list.stream()
                              .sorted(Comparator.comparingInt(VarianteImagen::getOrden))
                              .map(VarianteImagenDTO::from)     // 👈 igual que Inventario
                              .toList()
                      )
                  )
              ));

      // 3) stock
      var trackedIds   = variantes.stream().filter(v -> v.getModelo().isTrackeaUnidad()).map(Variante::getId).toList();
      var untrackedIds = variantes.stream().filter(v -> !v.getModelo().isTrackeaUnidad()).map(Variante::getId).toList();

      Map<Long, Long> stockNuevoMap = new HashMap<>();
      Map<Long, Long> stockUsadoMap = new HashMap<>();

      if (!trackedIds.isEmpty()) {
        for (var row : unidadRepo.stockPorVarianteYEstado(trackedIds, DISPONIBLES)) {
          if (row.getEstadoProducto() == EstadoComercial.NUEVO) {
            stockNuevoMap.put(row.getVarianteId(), row.getStock());
          } else if (row.getEstadoProducto() == EstadoComercial.USADO) {
            stockUsadoMap.put(row.getVarianteId(), row.getStock());
          }
        }
      }

      Map<Long, Long> stockMovMap = new HashMap<>();
      if (!untrackedIds.isEmpty()) {
        for (var row : movRepo.stockNoTrackeadoPorVariante(untrackedIds)) {
          stockMovMap.put(row.getVarianteId(), row.getStock() == null ? 0L : row.getStock().longValue());
        }
      }

      // 4) armar salida por modelo
      Map<Long, List<VarianteTablaDTO>> variantesPorModelo = new HashMap<>();

      for (var v : variantes) {
        boolean trackea = v.getModelo().isTrackeaUnidad();

        Long stockNuevos = trackea ? stockNuevoMap.getOrDefault(v.getId(), 0L) : null;
        Long stockUsados = trackea ? stockUsadoMap.getOrDefault(v.getId(), 0L) : null;
        long stockTotal  = trackea
            ? (stockNuevos + stockUsados)
            : stockMovMap.getOrDefault(v.getId(), 0L);

        String color = v.getColor() != null ? v.getColor().getNombre() : null;
        String cap   = v.getCapacidad() != null ? v.getCapacidad().getEtiqueta() : null;

        // 👇 IMÁGENES: igual que Inventario
        var porSet = imgsByVarAndSet.getOrDefault(v.getId(), Map.of());
        List<VarianteImagenDTO> imagenes = trackea
            ? concat(porSet.getOrDefault(ImagenSet.SELLADO, List.of()),
                     porSet.getOrDefault(ImagenSet.USADO, List.of()))
            : porSet.getOrDefault(ImagenSet.CATALOGO, List.of());

        variantesPorModelo
            .computeIfAbsent(v.getModelo().getId(), k -> new ArrayList<>())
            .add(new VarianteTablaDTO(
                v.getId(),
                color,
                cap,
                stockTotal,
                stockNuevos,
                stockUsados,
                imagenes              // 👈 lista plana
            ));
      }

      // ordenar variantes
      var cmp = Comparator
          .comparing((VarianteTablaDTO x) -> safeLower(x.colorNombre()), Comparator.nullsLast(Comparator.naturalOrder()))
          .thenComparing(x -> safeLower(x.capacidadEtiqueta()), Comparator.nullsLast(Comparator.naturalOrder()))
          .thenComparing(VarianteTablaDTO::id);
      variantesPorModelo.values().forEach(list -> list.sort(cmp));

      // 5) salida final
      var out = new ArrayList<ModeloTablaDTO>(modelos.size());
      for (var m : modelos) {
        out.add(new ModeloTablaDTO(
            m.getId(),
            m.getNombre(),
            m.getCategoria().getId(),
            m.getCategoria().getNombre(),
            m.isTrackeaUnidad(),
            variantesPorModelo.getOrDefault(m.getId(), List.of())
        ));
      }
      return out;

    } catch (Exception ex) {
      log.error("Fallo en tablaProductos(categoriaId={}, marcaId={}): {}", categoriaId, marcaId, ex.toString(), ex);
      throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error armando la tabla de productos");
    }
  }

  private static <T> List<T> concat(List<T> a, List<T> b) {
    if (a.isEmpty()) return b;
    if (b.isEmpty()) return a;
    var out = new ArrayList<T>(a.size() + b.size());
    out.addAll(a);
    out.addAll(b);
    return out;
  }

  private static String safeLower(String s) {
    return s == null ? null : s.toLowerCase();
  }
}
