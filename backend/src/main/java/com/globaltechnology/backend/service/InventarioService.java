// com.globaltechnology.backend.service.InventarioService

package com.globaltechnology.backend.service;

import com.globaltechnology.backend.domain.*;
import com.globaltechnology.backend.repository.*;
import com.globaltechnology.backend.web.dto.InventarioRowDTO;
import com.globaltechnology.backend.web.dto.VarianteImagenDTO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class InventarioService {

  private final ModeloRepository modeloRepo;
  private final VarianteRepository varianteRepo;
  private final UnidadRepository unidadRepo;
  private final MovimientoInventarioRepository movRepo;
  private final VarianteImagenRepository varianteImagenRepo;

  public InventarioService(ModeloRepository modeloRepo,
                           VarianteRepository varianteRepo,
                           UnidadRepository unidadRepo,
                           MovimientoInventarioRepository movRepo,
                           VarianteImagenRepository varianteImagenRepo) {
    this.modeloRepo = modeloRepo;
    this.varianteRepo = varianteRepo;
    this.unidadRepo = unidadRepo;
    this.movRepo = movRepo;
    this.varianteImagenRepo = varianteImagenRepo;
  }

  @Transactional(readOnly = true)
  public List<InventarioRowDTO> listarInventario(Long categoriaId, Long marcaId) {

    // 1) Modelos filtrados
    List<Modelo> modelos = // ... (igual que tu código actual)
        (categoriaId != null && marcaId != null) ? modeloRepo.findAllByCategoria_IdAndMarca_Id(categoriaId, marcaId) :
        (categoriaId != null) ? modeloRepo.findAllByCategoria_Id(categoriaId) :
        (marcaId != null) ? modeloRepo.findAllByMarca_Id(marcaId) :
        modeloRepo.findAll();

    if (modelos.isEmpty()) return List.of();

    var modeloIds = modelos.stream().map(Modelo::getId).toList();

    // 2) Variantes de esos modelos
    var variantes = varianteRepo.findAllByModelo_IdIn(modeloIds);
    if (variantes.isEmpty()) return List.of();

    // 🔎 Pre-carga de imágenes de TODAS las variantes para evitar N+1
    var varianteIds = variantes.stream().map(Variante::getId).toList();
    var todasImgs = varianteImagenRepo.findAllByVariante_IdIn(varianteIds);

    // Agrupar por varianteId y set
    // Agrupar por varianteId y set
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
                                // 👇 usa tu método actual
                                .map(VarianteImagenDTO::from)
                                .toList()
                )
            )
        ));


    // separar variantes tracked/untracked
    var tracked   = variantes.stream().filter(v -> v.getModelo().isTrackeaUnidad()).toList();
    var untracked = variantes.stream().filter(v -> !v.getModelo().isTrackeaUnidad()).toList();

    var out = new ArrayList<InventarioRowDTO>(variantes.size() * 2);

    // 3) TRACKED: una fila por Unidad
    if (!tracked.isEmpty()) {
      var trackedIds = tracked.stream().map(Variante::getId).toList();
      var unidades = unidadRepo.findAllByVariante_IdIn(trackedIds);

      for (var u : unidades) {
        if (u.getEstadoStock() != EstadoStock.EN_STOCK) continue;

        var v = u.getVariante();
        var m = v.getModelo();

        BigDecimal precioBase = v.getPrecioBase();
        BigDecimal override   = u.getPrecioOverride();
        BigDecimal efectivo   = (override != null ? override : precioBase);

        // 👉 set de imágenes según estado del producto (USADO vs SELLADO)
        ImagenSet set = (u.getEstadoProducto() == EstadoComercial.USADO)
            ? ImagenSet.USADO
            : ImagenSet.SELLADO;

        List<VarianteImagenDTO> imagenes = Optional
    .ofNullable(imgsByVarAndSet.get(v.getId()))
    .map(map -> map.getOrDefault(set, Collections.emptyList()))
    .orElse(Collections.emptyList());

        out.add(new InventarioRowDTO(
            m.getId(), m.getNombre(),
            v.getId(),
            v.getColor() != null ? v.getColor().getNombre() : null,
            v.getCapacidad() != null ? v.getCapacidad().getEtiqueta() : null,
            u.getId(),
            u.getImei(),
            u.getBateriaCondicionPct(),
            u.getEstadoProducto(),
            u.getEstadoStock(),
            precioBase,
            override,
            efectivo,
            null,
            true,
            u.getCreatedAt(),
            u.getUpdatedAt(),
            imagenes // 👈 NUEVO
        ));
      }
    }

    // 4) UNTRACKED: una fila por Variante con stock acumulado (movimientos)
    if (!untracked.isEmpty()) {
      var untrackedIds = untracked.stream().map(Variante::getId).toList();

      Map<Long, Long> stockMap = new HashMap<>();
      for (var row : movRepo.stockNoTrackeadoPorVariante(untrackedIds)) {
        Long varianteId = row.getVarianteId();
        Integer stock   = row.getStock();
        stockMap.put(varianteId, stock == null ? 0L : stock.longValue());
      }

      for (var v : untracked) {
        var m = v.getModelo();
        Long stock = stockMap.getOrDefault(v.getId(), 0L);
        if (stock <= 0) continue;

        // 👉 imágenes del set CATALOGO
       List<VarianteImagenDTO> imagenes = Optional
    .ofNullable(imgsByVarAndSet.get(v.getId()))
    .map(map -> map.getOrDefault(ImagenSet.CATALOGO, Collections.emptyList()))
    .orElse(Collections.emptyList());
        out.add(new InventarioRowDTO(
    m.getId(), m.getNombre(),
    v.getId(),
    v.getColor()!=null ? v.getColor().getNombre() : null,
    v.getCapacidad()!=null ? v.getCapacidad().getEtiqueta() : null,
    null,           // unidadId
    null,           // imei
    null,           // bateriaCondicionPct
    null,           // estadoProducto
    null,           // estadoStock  <-- FALTABA ESTE
    v.getPrecioBase(),
    null,
    v.getPrecioBase(),
    stock,
    false,
    v.getCreatedAt(),
    v.getUpdatedAt(),
    imagenes
));

      }
    }

    // 5) orden sugerido
    out.sort(Comparator
        .comparing(InventarioRowDTO::modeloNombre, String.CASE_INSENSITIVE_ORDER)
        .thenComparing(r -> Optional.ofNullable(r.colorNombre()).orElse(""), String.CASE_INSENSITIVE_ORDER)
        .thenComparing(r -> Optional.ofNullable(r.capacidadEtiqueta()).orElse(""), String.CASE_INSENSITIVE_ORDER)
        .thenComparing(r -> Optional.ofNullable(r.unidadId()).orElse(0L))
    );

    return out;
  }
}
