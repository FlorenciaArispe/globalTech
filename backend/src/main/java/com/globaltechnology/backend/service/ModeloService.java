package com.globaltechnology.backend.service;

import com.globaltechnology.backend.domain.*;
import com.globaltechnology.backend.repository.*;
import com.globaltechnology.backend.web.dto.*;
import org.springframework.transaction.annotation.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

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

  public ModeloDTO rename(Long id, ModeloRenameDTO dto) {
    var m = repo.findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Modelo no encontrado"));

    var nuevoNombre = dto.nombre().trim();
    if (nuevoNombre.isEmpty()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nombre inválido");
    }

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
      List<Modelo> modelos = (categoriaId != null && marcaId != null)
          ? repo.findAllByCategoria_IdAndMarca_Id(categoriaId, marcaId)
          : (categoriaId != null) ? repo.findAllByCategoria_Id(categoriaId)
              : (marcaId != null) ? repo.findAllByMarca_Id(marcaId)
                  : repo.findAll();

      if (modelos.isEmpty())
        return List.of();
      modelos.sort(Comparator.comparing(Modelo::getNombre, String.CASE_INSENSITIVE_ORDER));

      var modeloIds = modelos.stream().map(Modelo::getId).toList();

      var variantes = varianteRepo.findAllByModelo_IdIn(modeloIds);
      if (variantes.isEmpty()) {
        var out = new ArrayList<ModeloTablaDTO>(modelos.size());
        for (var m : modelos) {
          out.add(new ModeloTablaDTO(
              m.getId(), m.getNombre(),
              m.getCategoria().getId(), m.getCategoria().getNombre(),
              m.isTrackeaUnidad(),
              List.of()));
        }
        return out;
      }

      var varianteIds = variantes.stream().map(Variante::getId).toList();
      var todasImgs = varianteImagenRepo.findAllByVariante_IdIn(varianteIds);

      Map<Long, Map<ImagenSet, List<VarianteImagenDTO>>> imgsByVarAndSet = todasImgs.stream()
          .collect(Collectors.groupingBy(
              vi -> vi.getVariante().getId(),
              Collectors.groupingBy(
                  VarianteImagen::getSetTipo,
                  Collectors.collectingAndThen(
                      Collectors.toList(),
                      list -> list.stream()
                          .sorted(Comparator.comparingInt(VarianteImagen::getOrden))
                          .map(VarianteImagenDTO::from)
                          .toList()))));

      var trackedIds = variantes.stream().filter(v -> v.getModelo().isTrackeaUnidad()).map(Variante::getId).toList();
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

      Map<Long, List<VarianteTablaDTO>> variantesPorModelo = new HashMap<>();

      for (var v : variantes) {
        boolean trackea = v.getModelo().isTrackeaUnidad();

        Long stockNuevos = trackea ? stockNuevoMap.getOrDefault(v.getId(), 0L) : null;
        Long stockUsados = trackea ? stockUsadoMap.getOrDefault(v.getId(), 0L) : null;
        long stockTotal = trackea
            ? (stockNuevos + stockUsados)
            : stockMovMap.getOrDefault(v.getId(), 0L);

        String color = v.getColor() != null ? v.getColor().getNombre() : null;
        String cap = v.getCapacidad() != null ? v.getCapacidad().getEtiqueta() : null;

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
                imagenes));
      }

      var cmp = Comparator
          .comparing((VarianteTablaDTO x) -> safeLower(x.colorNombre()),
              Comparator.nullsLast(Comparator.naturalOrder()))
          .thenComparing(x -> safeLower(x.capacidadEtiqueta()), Comparator.nullsLast(Comparator.naturalOrder()))
          .thenComparing(VarianteTablaDTO::id);
      variantesPorModelo.values().forEach(list -> list.sort(cmp));

      var out = new ArrayList<ModeloTablaDTO>(modelos.size());
      for (var m : modelos) {
        out.add(new ModeloTablaDTO(
            m.getId(),
            m.getNombre(),
            m.getCategoria().getId(),
            m.getCategoria().getNombre(),
            m.isTrackeaUnidad(),
            variantesPorModelo.getOrDefault(m.getId(), List.of())));
      }
      return out;

    } catch (Exception ex) {
      log.error("Fallo en tablaProductos(categoriaId={}, marcaId={}): {}", categoriaId, marcaId, ex.toString(), ex);
      throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error armando la tabla de productos");
    }
  }

  private static <T> List<T> concat(List<T> a, List<T> b) {
    if (a.isEmpty())
      return b;
    if (b.isEmpty())
      return a;
    var out = new ArrayList<T>(a.size() + b.size());
    out.addAll(a);
    out.addAll(b);
    return out;
  }

  private static String safeLower(String s) {
    return s == null ? "" : s.toLowerCase();
  }

  private List<CatalogoItemDTO> buildCatalogo(Long categoriaId, Long marcaId) {

    List<Modelo> modelos = (categoriaId != null && marcaId != null)
        ? repo.findAllByCategoria_IdAndMarca_Id(categoriaId, marcaId)
        : (categoriaId != null) ? repo.findAllByCategoria_Id(categoriaId)
            : (marcaId != null) ? repo.findAllByMarca_Id(marcaId)
                : repo.findAll();

    if (modelos.isEmpty()) {
      return List.of();
    }

    modelos.sort(Comparator.comparing(Modelo::getNombre, String.CASE_INSENSITIVE_ORDER));
    var modeloIds = modelos.stream().map(Modelo::getId).toList();

    var variantes = varianteRepo.findAllByModelo_IdIn(modeloIds);

    Map<Long, Map<ImagenSet, List<VarianteImagenDTO>>> imgsByVarAndSet = Map.of();
    if (!variantes.isEmpty()) {
      var varianteIds = variantes.stream().map(Variante::getId).toList();
      var todasImgs = varianteImagenRepo.findAllByVariante_IdIn(varianteIds);

      imgsByVarAndSet = todasImgs.stream()
          .collect(Collectors.groupingBy(
              vi -> vi.getVariante().getId(),
              Collectors.groupingBy(
                  VarianteImagen::getSetTipo,
                  Collectors.collectingAndThen(
                      Collectors.toList(),
                      list -> list.stream()
                          .sorted(Comparator.comparingInt(VarianteImagen::getOrden))
                          .map(VarianteImagenDTO::from)
                          .toList()))));
    }

    var trackedVariantes = variantes.stream().filter(v -> v.getModelo().isTrackeaUnidad()).toList();
    var untrackedVariantes = variantes.stream().filter(v -> !v.getModelo().isTrackeaUnidad()).toList();

    var out = new ArrayList<CatalogoItemDTO>();

    Map<Long, SelladoAgg> selladoPorModelo = new HashMap<>();

    if (!trackedVariantes.isEmpty()) {
      var trackedIds = trackedVariantes.stream().map(Variante::getId).toList();
      var unidades = unidadRepo.findAllByVariante_IdIn(trackedIds);

      for (var u : unidades) {
        var v = u.getVariante();
        var m = v.getModelo();
        var categoria = m.getCategoria();
        var marca = m.getMarca();

        BigDecimal precioBase = v.getPrecioBase();
        BigDecimal override = u.getPrecioOverride();
        BigDecimal efectivo = (override != null ? override : precioBase);

        ImagenSet set = (u.getEstadoProducto() == EstadoComercial.USADO)
            ? ImagenSet.USADO
            : ImagenSet.SELLADO;

        var porSet = imgsByVarAndSet.getOrDefault(v.getId(), Map.of());
        var imagenes = porSet.getOrDefault(set, List.of());

        if (u.getEstadoProducto() == EstadoComercial.USADO) {
          boolean enStock = (u.getEstadoStock() == EstadoStock.EN_STOCK);
          if (!enStock)
            continue;

          out.add(new CatalogoItemDTO(
              u.getId(),
              m.getId(),
              m.getNombre(),
              categoria.getId(),
              categoria.getNombre(),
              marca.getId(),
              marca.getNombre(),
              TipoCatalogoItem.TRACKED_USADO_UNIDAD,
              v.getColor() != null ? v.getColor().getNombre() : null,
              v.getCapacidad() != null ? v.getCapacidad().getEtiqueta() : null,
              u.getBateriaCondicionPct(),
              efectivo,
              true,
              1L,
              List.of(),
              List.of(),
              imagenes));

        } else {
          var agg = selladoPorModelo.computeIfAbsent(m.getId(), id -> {
            var a = new SelladoAgg();
            a.modelo = m;
            return a;
          });

          if (u.getEstadoStock() == EstadoStock.EN_STOCK) {
            agg.enStock = true;
            agg.stockTotal++;

            String color = (v.getColor() != null) ? v.getColor().getNombre() : null;
            String cap = (v.getCapacidad() != null) ? v.getCapacidad().getEtiqueta() : null;

            if (color != null)
              agg.colores.add(color);

            String key = (color != null ? color : "_") + "|" + (cap != null ? cap : "_");

            var combo = agg.variantes.computeIfAbsent(key, k -> {
              var c = new VarianteOpcionCatalogoAgg();
              c.color = color;
              c.capacidad = cap;
              return c;
            });

            combo.stock++;
          }

          if (efectivo != null) {
            if (agg.precioMin == null || efectivo.compareTo(agg.precioMin) < 0) {
              agg.precioMin = efectivo;
            }
          }

          if (agg.imagenes.isEmpty() && !imagenes.isEmpty()) {
            agg.imagenes = new ArrayList<>(imagenes);
          }
        }
      }

      for (var agg : selladoPorModelo.values()) {
        if (!agg.enStock || agg.stockTotal <= 0)
          continue;

        var m = agg.modelo;
        var categoria = m.getCategoria();
        var marca = m.getMarca();

        var variantesDTO = agg.variantes.values().stream()
            .map(c -> new VarianteOpcionCatalogoDTO(c.color, c.capacidad, c.stock))
            .toList();

        out.add(new CatalogoItemDTO(
            m.getId(),
            m.getId(),
            m.getNombre(),
            categoria.getId(),
            categoria.getNombre(),
            marca.getId(),
            marca.getNombre(),
            TipoCatalogoItem.TRACKED_SELLADO_AGREGADO,
            null,
            null,
            null,
            agg.precioMin,
            true,
            agg.stockTotal,
            new ArrayList<>(agg.colores),
            variantesDTO,
            agg.imagenes != null ? agg.imagenes : List.of()));
      }
    }

    if (!untrackedVariantes.isEmpty()) {
      var untrackedIds = untrackedVariantes.stream().map(Variante::getId).toList();

      Map<Long, Long> stockPorVariante = new HashMap<>();
      for (var row : movRepo.stockNoTrackeadoPorVariante(untrackedIds)) {
        Long varianteId = row.getVarianteId();
        Integer stock = row.getStock();
        stockPorVariante.put(varianteId, stock == null ? 0L : stock.longValue());
      }

      Map<Long, NoTrackAgg> noTrackPorModelo = new HashMap<>();

      for (var v : untrackedVariantes) {
        var m = v.getModelo();

        long stock = stockPorVariante.getOrDefault(v.getId(), 0L);

        var agg = noTrackPorModelo.computeIfAbsent(m.getId(), id -> {
          var a = new NoTrackAgg();
          a.modelo = m;
          return a;
        });

        if (stock > 0) {
          agg.enStock = true;
          agg.stockTotal += stock;

          String color = v.getColor() != null ? v.getColor().getNombre() : null;
          String cap = v.getCapacidad() != null ? v.getCapacidad().getEtiqueta() : null;

          if (color != null)
            agg.colores.add(color);

          String key = (color != null ? color : "_") + "|" + (cap != null ? cap : "_");

          var combo = agg.variantes.computeIfAbsent(key, k -> {
            var c = new VarianteOpcionCatalogoAgg();
            c.color = color;
            c.capacidad = cap;
            return c;
          });

          combo.stock += stock;
        }

        var precioBase = v.getPrecioBase();
        if (precioBase != null) {
          if (agg.precioMin == null || precioBase.compareTo(agg.precioMin) < 0) {
            agg.precioMin = precioBase;
          }
        }

        var porSet = imgsByVarAndSet.getOrDefault(v.getId(), Map.of());
        var imgsCat = porSet.getOrDefault(ImagenSet.CATALOGO, List.of());
        if (agg.imagenes.isEmpty() && !imgsCat.isEmpty()) {
          agg.imagenes = new ArrayList<>(imgsCat);
        }
      }

      for (var agg : noTrackPorModelo.values()) {
        if (!agg.enStock || agg.stockTotal <= 0)
          continue;

        var m = agg.modelo;
        var categoria = m.getCategoria();
        var marca = m.getMarca();

        var variantesDTO = agg.variantes.values().stream()
            .map(c -> new VarianteOpcionCatalogoDTO(c.color, c.capacidad, c.stock))
            .toList();

        out.add(new CatalogoItemDTO(
            m.getId(),
            m.getId(),
            m.getNombre(),
            categoria.getId(),
            categoria.getNombre(),
            marca.getId(),
            marca.getNombre(),
            TipoCatalogoItem.NO_TRACK_AGREGADO,
            null,
            null,
            null,
            agg.precioMin,
            true,
            agg.stockTotal,
            new ArrayList<>(agg.colores),
            variantesDTO,
            agg.imagenes != null ? agg.imagenes : List.of()));
      }
    }

    Set<Long> modelosConStock = out.stream()
        .map(CatalogoItemDTO::modeloId)
        .collect(Collectors.toSet());

    for (var m : modelos) {
      if (!modelosConStock.contains(m.getId())) {
        var categoria = m.getCategoria();
        var marca = m.getMarca();

        var tipo = m.isTrackeaUnidad()
            ? TipoCatalogoItem.TRACKED_SELLADO_AGREGADO
            : TipoCatalogoItem.NO_TRACK_AGREGADO;

        out.add(new CatalogoItemDTO(
            m.getId(),
            m.getId(),
            m.getNombre(),
            categoria.getId(),
            categoria.getNombre(),
            marca.getId(),
            marca.getNombre(),
            tipo,
            null,
            null,
            null,
            null,
            false,
            0L,
            List.of(),
            List.of(),
            List.of()));
      }
    }

    Comparator<CatalogoItemDTO> comparator = Comparator
        .comparing((CatalogoItemDTO dto) -> safeLower(dto.modeloNombre()))
        .thenComparing(dto -> dto.tipo().name())
        .thenComparing(dto -> safeLower(dto.color()))
        .thenComparing(dto -> dto.itemId() == null ? 0L : dto.itemId());

    out.sort(comparator);

    return out;
  }

  @Transactional(readOnly = true)
  public CatalogoItemDTO obtenerDetalleCatalogo(Long itemId, TipoCatalogoItem tipo) {
    try {
      var items = buildCatalogo(null, null); // o con filtros si querés

      return items.stream()
          .filter(it -> Objects.equals(it.itemId(), itemId) && it.tipo() == tipo)
          .findFirst()
          .orElseThrow(() -> new ResponseStatusException(
              HttpStatus.NOT_FOUND,
              "Item de catálogo no encontrado"));
    } catch (Exception ex) {
      log.error("Fallo en obtenerDetalleCatalogo(itemId={}, tipo={}): {}", itemId, tipo, ex.toString(), ex);
      throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error armando detalle de producto");
    }
  }

  @Transactional(readOnly = true)
  public List<CatalogoItemResumenDTO> listarCatalogo(TipoCatalogoItem tipo) {

    try {

      List<Modelo> modelos = repo.findAll();

      if (modelos.isEmpty()) {
        return List.of();
      }

      modelos.sort(Comparator.comparing(Modelo::getNombre, String.CASE_INSENSITIVE_ORDER));
      var modeloIds = modelos.stream().map(Modelo::getId).toList();

      var variantes = varianteRepo.findAllByModelo_IdIn(modeloIds);

      Map<Long, Map<ImagenSet, List<VarianteImagenDTO>>> imgsByVarAndSet = Map.of();
      if (!variantes.isEmpty()) {
        var varianteIds = variantes.stream().map(Variante::getId).toList();
        var todasImgs = varianteImagenRepo.findAllByVariante_IdIn(varianteIds);

        imgsByVarAndSet = todasImgs.stream()
            .collect(Collectors.groupingBy(
                vi -> vi.getVariante().getId(),
                Collectors.groupingBy(
                    VarianteImagen::getSetTipo,
                    Collectors.collectingAndThen(
                        Collectors.toList(),
                        list -> list.stream()
                            .sorted(Comparator.comparingInt(VarianteImagen::getOrden))
                            .map(VarianteImagenDTO::from)
                            .toList()))));
      }

      var trackedVariantes = variantes.stream().filter(v -> v.getModelo().isTrackeaUnidad()).toList();
      var untrackedVariantes = variantes.stream().filter(v -> !v.getModelo().isTrackeaUnidad()).toList();

      var out = new ArrayList<CatalogoItemDTO>();

      Map<Long, SelladoAgg> selladoPorModelo = new HashMap<>();

      if (!trackedVariantes.isEmpty()) {
        var trackedIds = trackedVariantes.stream().map(Variante::getId).toList();
        var unidades = unidadRepo.findAllByVariante_IdIn(trackedIds);

        for (var u : unidades) {
          var v = u.getVariante();
          var m = v.getModelo();
          var categoria = m.getCategoria();
          var marca = m.getMarca();

          BigDecimal precioBase = v.getPrecioBase();
          BigDecimal override = u.getPrecioOverride();
          BigDecimal efectivo = (override != null ? override : precioBase);

          ImagenSet set = (u.getEstadoProducto() == EstadoComercial.USADO)
              ? ImagenSet.USADO
              : ImagenSet.SELLADO;

          var porSet = imgsByVarAndSet.getOrDefault(v.getId(), Map.of());
          var imagenes = porSet.getOrDefault(set, List.of());

          if (u.getEstadoProducto() == EstadoComercial.USADO) {
            boolean enStock = (u.getEstadoStock() == EstadoStock.EN_STOCK);
            if (!enStock)
              continue;

            out.add(new CatalogoItemDTO(
                u.getId(),
                m.getId(),
                m.getNombre(),
                categoria.getId(),
                categoria.getNombre(),
                marca.getId(),
                marca.getNombre(),
                TipoCatalogoItem.TRACKED_USADO_UNIDAD,
                v.getColor() != null ? v.getColor().getNombre() : null,
                v.getCapacidad() != null ? v.getCapacidad().getEtiqueta() : null,
                u.getBateriaCondicionPct(),
                efectivo,
                true,
                1L,
                List.of(),
                List.of(),
                imagenes));

          } else {
            var agg = selladoPorModelo.computeIfAbsent(m.getId(), id -> {
              var a = new SelladoAgg();
              a.modelo = m;
              return a;
            });

            if (u.getEstadoStock() == EstadoStock.EN_STOCK) {
              agg.enStock = true;
              agg.stockTotal++;

              String color = (v.getColor() != null) ? v.getColor().getNombre() : null;
              String cap = (v.getCapacidad() != null) ? v.getCapacidad().getEtiqueta() : null;

              if (color != null)
                agg.colores.add(color);

              String key = (color != null ? color : "_") + "|" + (cap != null ? cap : "_");

              var combo = agg.variantes.computeIfAbsent(key, k -> {
                var c = new VarianteOpcionCatalogoAgg();
                c.color = color;
                c.capacidad = cap;
                return c;
              });

              combo.stock++;
            }

            if (efectivo != null) {
              if (agg.precioMin == null || efectivo.compareTo(agg.precioMin) < 0) {
                agg.precioMin = efectivo;
              }
            }

            if (agg.imagenes.isEmpty() && !imagenes.isEmpty()) {
              agg.imagenes = new ArrayList<>(imagenes);
            }
          }
        }
        for (var agg : selladoPorModelo.values()) {
          if (!agg.enStock || agg.stockTotal <= 0)
            continue;

          var m = agg.modelo;
          var categoria = m.getCategoria();
          var marca = m.getMarca();

          var variantesDTO = agg.variantes.values().stream()
              .map(c -> new VarianteOpcionCatalogoDTO(c.color, c.capacidad, c.stock))
              .toList();

          out.add(new CatalogoItemDTO(
              m.getId(),
              m.getId(),
              m.getNombre(),
              categoria.getId(),
              categoria.getNombre(),
              marca.getId(),
              marca.getNombre(),
              TipoCatalogoItem.TRACKED_SELLADO_AGREGADO,
              null,
              null,
              null,
              agg.precioMin,
              true,
              agg.stockTotal,
              new ArrayList<>(agg.colores),
              variantesDTO,
              agg.imagenes != null ? agg.imagenes : List.of()));
        }
      }

      if (!untrackedVariantes.isEmpty()) {
        var untrackedIds = untrackedVariantes.stream().map(Variante::getId).toList();

        Map<Long, Long> stockPorVariante = new HashMap<>();
        for (var row : movRepo.stockNoTrackeadoPorVariante(untrackedIds)) {
          Long varianteId = row.getVarianteId();
          Integer stock = row.getStock();
          stockPorVariante.put(varianteId, stock == null ? 0L : stock.longValue());
        }

        Map<Long, NoTrackAgg> noTrackPorModelo = new HashMap<>();

        for (var v : untrackedVariantes) {
          var m = v.getModelo();

          long stock = stockPorVariante.getOrDefault(v.getId(), 0L);

          var agg = noTrackPorModelo.computeIfAbsent(m.getId(), id -> {
            var a = new NoTrackAgg();
            a.modelo = m;
            return a;
          });

          if (stock > 0) {
            agg.enStock = true;
            agg.stockTotal += stock;

            String color = v.getColor() != null ? v.getColor().getNombre() : null;
            String cap = v.getCapacidad() != null ? v.getCapacidad().getEtiqueta() : null;

            if (color != null)
              agg.colores.add(color);

            String key = (color != null ? color : "_") + "|" + (cap != null ? cap : "_");

            var combo = agg.variantes.computeIfAbsent(key, k -> {
              var c = new VarianteOpcionCatalogoAgg();
              c.color = color;
              c.capacidad = cap;
              return c;
            });

            combo.stock += stock;
          }

          var precioBase = v.getPrecioBase();
          if (precioBase != null) {
            if (agg.precioMin == null || precioBase.compareTo(agg.precioMin) < 0) {
              agg.precioMin = precioBase;
            }
          }

          var porSet = imgsByVarAndSet.getOrDefault(v.getId(), Map.of());
          var imgsCat = porSet.getOrDefault(ImagenSet.CATALOGO, List.of());
          if (agg.imagenes.isEmpty() && !imgsCat.isEmpty()) {
            agg.imagenes = new ArrayList<>(imgsCat);
          }
        }

        for (var agg : noTrackPorModelo.values()) {
          if (!agg.enStock || agg.stockTotal <= 0)
            continue;

          var m = agg.modelo;
          var categoria = m.getCategoria();
          var marca = m.getMarca();

          var variantesDTO = agg.variantes.values().stream()
              .map(c -> new VarianteOpcionCatalogoDTO(c.color, c.capacidad, c.stock))
              .toList();

          out.add(new CatalogoItemDTO(
              m.getId(),
              m.getId(),
              m.getNombre(),
              categoria.getId(),
              categoria.getNombre(),
              marca.getId(),
              marca.getNombre(),
              TipoCatalogoItem.NO_TRACK_AGREGADO,
              null,
              null,
              null,
              agg.precioMin,
              true,
              agg.stockTotal,
              new ArrayList<>(agg.colores),
              variantesDTO,
              agg.imagenes != null ? agg.imagenes : List.of()));
        }
      }

      Set<Long> modelosConStock = out.stream()
          .map(CatalogoItemDTO::modeloId)
          .collect(Collectors.toSet());

      for (var m : modelos) {
        if (!modelosConStock.contains(m.getId())) {
          var categoria = m.getCategoria();
          var marca = m.getMarca();

          var tipoo = m.isTrackeaUnidad()
              ? TipoCatalogoItem.TRACKED_SELLADO_AGREGADO
              : TipoCatalogoItem.NO_TRACK_AGREGADO;

          out.add(new CatalogoItemDTO(
              m.getId(),
              m.getId(),
              m.getNombre(),
              categoria.getId(),
              categoria.getNombre(),
              marca.getId(),
              marca.getNombre(),
              tipoo,
              null,
              null,
              null,
              null,
              false,
              0L,
              List.of(),
              List.of(),
              List.of()));
        }
      }

      Comparator<CatalogoItemDTO> comparator = Comparator
          .comparing((CatalogoItemDTO dto) -> safeLower(dto.modeloNombre()))
          .thenComparing(dto -> dto.tipo().name())
          .thenComparing(dto -> safeLower(dto.color()))
          .thenComparing(dto -> dto.itemId() == null ? 0L : dto.itemId());

      out.sort(comparator);

      Stream<CatalogoItemDTO> stream = out.stream();
      if (tipo != null) {
        stream = stream.filter(item -> item.tipo() == tipo);
      }

      return stream
          .map(item -> {
            String imagenUrl = null;
            if (item.imagenes() != null && !item.imagenes().isEmpty()) {
              imagenUrl = item.imagenes().get(0).url(); 
            }

            return new CatalogoItemResumenDTO(
                item.itemId(), 
                item.modeloNombre(),
                item.color(),
                item.capacidad(),
                item.bateriaCondicionPct(),
                item.tipo(),
                item.precio(),
                imagenUrl);
          })
          .toList();

    } catch (Exception ex) {
      log.error("Fallo en listarCatalogo(tipo={}): {}", tipo, ex.toString(), ex);
      throw new ResponseStatusException(
          HttpStatus.INTERNAL_SERVER_ERROR,
          "Error armando el catálogo público");
    }
  }

  private static class SelladoAgg {
    Modelo modelo;
    boolean enStock = false;
    long stockTotal = 0L;
    BigDecimal precioMin;
    List<VarianteImagenDTO> imagenes = new ArrayList<>();
    Set<String> colores = new LinkedHashSet<>();
    Map<String, VarianteOpcionCatalogoAgg> variantes = new LinkedHashMap<>();
  }

  private static class NoTrackAgg {
    Modelo modelo;
    boolean enStock = false;
    long stockTotal = 0L;
    BigDecimal precioMin;
    List<VarianteImagenDTO> imagenes = new ArrayList<>();
    Set<String> colores = new LinkedHashSet<>();
    Map<String, VarianteOpcionCatalogoAgg> variantes = new LinkedHashMap<>();
  }

  private static class VarianteOpcionCatalogoAgg {
    String color;
    String capacidad;
    long stock = 0;
  }

}
