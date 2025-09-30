// ModeloService.java
package com.globaltechnology.backend.service;

import com.globaltechnology.backend.domain.*;
import com.globaltechnology.backend.repository.*;
import com.globaltechnology.backend.web.dto.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import static java.util.stream.Collectors.toMap;
import static java.util.Comparator.nullsLast;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Service
public class ModeloService {
  private final ModeloRepository repo;
  private final CategoriaRepository catRepo;
  private final MarcaRepository marcaRepo;
  private final VarianteRepository varianteRepo;
    private final UnidadRepository unidadRepo;

  public ModeloService(ModeloRepository repo,
                       CategoriaRepository catRepo,
                       MarcaRepository marcaRepo,
                       VarianteRepository varianteRepo,
                       UnidadRepository unidadRepo) {
    this.repo = repo; this.catRepo = catRepo; this.marcaRepo = marcaRepo; this.varianteRepo = varianteRepo; this.unidadRepo= unidadRepo;
  }

   private static final List<EstadoStock> DISPONIBLES = List.of(EstadoStock.EN_STOCK);

  private ModeloDTO toDTO(Modelo m){
    return new ModeloDTO(
      m.getId(),
      m.getCategoria().getId(), m.getCategoria().getNombre(),
      m.getMarca().getId(), m.getMarca().getNombre(),
      m.getNombre(), m.isTrackeaImei(), m.isRequiereColor(), m.isRequiereCapacidad()
    );
  }

  public List<ModeloDTO> list(Long categoriaId, Long marcaId){
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

  public ModeloDTO get(Long id){
    var m = repo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,"Modelo no encontrado"));
    return toDTO(m);
  }

  public ModeloDTO create(ModeloCreateDTO dto){
    var cat = catRepo.findById(dto.categoriaId())
      .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,"Categoría inválida"));
    var marca = marcaRepo.findById(dto.marcaId())
      .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,"Marca inválida"));

    var nombre = dto.nombre().trim();
    if (repo.existsByMarca_IdAndNombreIgnoreCase(marca.getId(), nombre)) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, "Ya existe un modelo con ese nombre en la misma marca");
    }

    var m = Modelo.builder()
      .categoria(cat).marca(marca).nombre(nombre)
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

    var nombre = dto.nombre().trim();
    if (repo.existsByMarca_IdAndNombreIgnoreCaseAndIdNot(marca.getId(), nombre, id)) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, "Ya existe un modelo con ese nombre en la misma marca");
    }

    m.setCategoria(cat);
    m.setMarca(marca);
    m.setNombre(nombre);
    m.setTrackeaImei(dto.trackeaImei());
    m.setRequiereColor(dto.requiereColor());
    m.setRequiereCapacidad(dto.requiereCapacidad());

    return toDTO(repo.save(m));
  }

  public void delete(Long id){
    if (!repo.existsById(id)) throw new ResponseStatusException(HttpStatus.NOT_FOUND,"Modelo no encontrado");
    if (varianteRepo.existsByModelo_Id(id)) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, "No se puede eliminar: el modelo tiene variantes asociadas");
    }
    repo.deleteById(id);
  }


 public List<ModeloTablaDTO> tabla(Long categoriaId, Long marcaId) {
    // 1) Traer modelos (ENTIDADES) con los filtros que ya usa tu front
    List<Modelo> modelos;
    if (categoriaId != null && marcaId != null) {
      modelos = repo.findAll().stream()
          .filter(m -> Objects.equals(m.getCategoria().getId(), categoriaId))
          .filter(m -> Objects.equals(m.getMarca().getId(), marcaId))
          .toList();
    } else if (categoriaId != null) {
      modelos = repo.findAll().stream()
          .filter(m -> Objects.equals(m.getCategoria().getId(), categoriaId))
          .toList();
    } else if (marcaId != null) {
      modelos = repo.findAll().stream()
          .filter(m -> Objects.equals(m.getMarca().getId(), marcaId))
          .toList();
    } else {
      modelos = repo.findAll();
    }

    if (modelos.isEmpty()) return List.of();

    modelos.sort(Comparator.comparing(Modelo::getNombre, String.CASE_INSENSITIVE_ORDER));

    var modeloIds = modelos.stream().map(Modelo::getId).toList();

    // 2) Traer TODAS las variantes activas de esos modelos
    var variantes = varianteRepo.findAllByModelo_IdInAndActivoTrue(modeloIds);
    if (variantes.isEmpty()) {
      // Devolvemos modelos sin variantes
      return modelos.stream()
          .map(m -> new ModeloTablaDTO(
              m.getId(), m.getNombre(),
              m.getCategoria().getId(), m.getCategoria().getNombre(),
              m.getMarca().getId(), m.getMarca().getNombre(),
              List.of()
          ))
          .toList();
    }

    // 3) Stock por variante en batch
    var varianteIds = variantes.stream().map(Variante::getId).toList();
    var stockRows = unidadRepo.stockPorVariante(varianteIds, DISPONIBLES);
    var stockMap = stockRows.stream()
        .collect(toMap(UnidadRepository.VarianteStockRow::getVarianteId,
                       UnidadRepository.VarianteStockRow::getStock));

    // 4) Armar map modeloId -> variantesDTO (ordenadas)
    Map<Long, List<VarianteResumenDTO>> variantesPorModelo = new HashMap<>();
    for (var v : variantes) {
      long stock = stockMap.getOrDefault(v.getId(), 0L);
      String color = v.getColor() != null ? v.getColor().getNombre() : null;
      String cap = v.getCapacidad() != null ? v.getCapacidad().getEtiqueta() : null;

      String label = buildVarianteLabel(color, cap);

      // 👉 Si no tenés precio en DB, dejalo null por ahora:
      Long precio = null;
      Long precioPromo = null;

      var dto = new VarianteResumenDTO(
          v.getId(), label, color, cap, stock, precio, precioPromo
      );

      variantesPorModelo.computeIfAbsent(v.getModelo().getId(), k -> new ArrayList<>()).add(dto);
    }

    // Orden consistente de variantes: por color, luego capacidad, luego id
    Comparator<VarianteResumenDTO> cmp =
        Comparator.comparing((VarianteResumenDTO x) -> safeLower(x.colorNombre()), nullsLast(Comparator.naturalOrder()))
                  .thenComparing(x -> safeLower(x.capacidadEtiqueta()), nullsLast(Comparator.naturalOrder()))
                  .thenComparing(VarianteResumenDTO::id);

    variantesPorModelo.values().forEach(list -> list.sort(cmp));

    // 5) Armar salida final
    List<ModeloTablaDTO> out = new ArrayList<>(modelos.size());
    for (var m : modelos) {
      var list = variantesPorModelo.getOrDefault(m.getId(), List.of());
      out.add(new ModeloTablaDTO(
          m.getId(), m.getNombre(),
          m.getCategoria().getId(), m.getCategoria().getNombre(),
          m.getMarca().getId(), m.getMarca().getNombre(),
          list
      ));
    }
    return out;
  }

    private static String buildVarianteLabel(String color, String cap) {
    if (color != null && cap != null) return color + " " + cap;
    if (color != null) return color;
    if (cap != null) return cap;
    return "Variante";
  }

   private static String safeLower(String s) {
    return s == null ? null : s.toLowerCase();
  }

  //   public List<ModeloStatsDTO> stats(Long categoriaId, Long marcaId) {
  //   var modelos = list(categoriaId, marcaId).stream().toList(); 
  //   if (modelos.isEmpty()) return List.of();

  //   var modeloIds = modelos.stream().map(ModeloDTO::id).toList();

  //   var variantesRows = varianteRepo.variantesPorModelo(modeloIds);
  //   var variantesMap = variantesRows.stream()
  //       .collect(toMap(VarianteRepository.ModeloVarianteCountRow::getModeloId,
  //                      VarianteRepository.ModeloVarianteCountRow::getVariantes));

  //   var stockRows = unidadRepo.stockPorModelo(modeloIds, DISPONIBLES);
  //   var stockMap = stockRows.stream()
  //       .collect(toMap(UnidadRepository.ModeloStockRow::getModeloId,
  //                      UnidadRepository.ModeloStockRow::getStock));

  //   var out = new ArrayList<ModeloStatsDTO>(modelos.size());
  //   for (var m : modelos) {
  //     long variantes = variantesMap.getOrDefault(m.id(), 0L);
  //     long stock = stockMap.getOrDefault(m.id(), 0L);
  //     out.add(new ModeloStatsDTO(
  //         m.id(),
  //         m.nombre(),
  //         m.categoriaId(), m.categoriaNombre(),
  //         m.marcaId(), m.marcaNombre(),
  //         variantes, stock
  //     ));
  //   }
  //   return out;
  // }
}
