// service/InventarioService.java
package com.globaltechnology.backend.service;

import com.globaltechnology.backend.domain.*;
import com.globaltechnology.backend.repository.*;
import com.globaltechnology.backend.web.dto.InventarioRowDTO;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;

@Service
public class InventarioService {

  private final ModeloRepository modeloRepo;
  private final VarianteRepository varianteRepo;
  private final UnidadRepository unidadRepo;
  private final MovimientoInventarioRepository movRepo;

  public InventarioService(ModeloRepository modeloRepo,
                           VarianteRepository varianteRepo,
                           UnidadRepository unidadRepo,
                           MovimientoInventarioRepository movRepo) {
    this.modeloRepo = modeloRepo;
    this.varianteRepo = varianteRepo;
    this.unidadRepo = unidadRepo;
    this.movRepo = movRepo;
  }

  @Transactional(readOnly = true)
  public List<InventarioRowDTO> listarInventario(Long categoriaId, Long marcaId) {
    // 1) filtrar modelos
    List<Modelo> modelos;
    if (categoriaId != null && marcaId != null) {
      modelos = modeloRepo.findAllByCategoria_IdAndMarca_Id(categoriaId, marcaId);
    } else if (categoriaId != null) {
      modelos = modeloRepo.findAllByCategoria_Id(categoriaId);
    } else if (marcaId != null) {
      modelos = modeloRepo.findAllByMarca_Id(marcaId);
    } else {
      modelos = modeloRepo.findAll();
    }
    if (modelos.isEmpty()) return List.of();

    var modeloIds = modelos.stream().map(Modelo::getId).toList();

    // 2) variantes de esos modelos
    var variantes = varianteRepo.findAllByModelo_IdIn(modeloIds);
    if (variantes.isEmpty()) return List.of();

    // separar
    var tracked   = variantes.stream().filter(v -> v.getModelo().isTrackeaUnidad()).toList();
    var untracked = variantes.stream().filter(v -> !v.getModelo().isTrackeaUnidad()).toList();

    var out = new ArrayList<InventarioRowDTO>(variantes.size() * 2);

    // 3) TRACKED: una fila por Unidad
    if (!tracked.isEmpty()) {
      var trackedIds = tracked.stream().map(Variante::getId).toList();
      var unidades = unidadRepo.findAllByVariante_IdIn(trackedIds);

      for (var u : unidades) {
        var v = u.getVariante();
        var m = v.getModelo();

        BigDecimal precioBase = v.getPrecioBase();
        BigDecimal override   = u.getPrecioOverride();
        BigDecimal efectivo   = (override != null ? override : precioBase);

        out.add(new InventarioRowDTO(
            m.getId(), m.getNombre(),
            v.getId(),
            v.getColor()!=null ? v.getColor().getNombre() : null,
            v.getCapacidad()!=null ? v.getCapacidad().getEtiqueta() : null,
            u.getId(),
            u.getImei(),
            u.getBateriaCondicionPct(),
            u.getEstadoProducto(),
            u.getEstadoStock(),
            precioBase,
            override,
            efectivo,
            null,                 // stockAcumulado NO aplica a unidades
            true,                 // trackeaUnidad
            u.getCreatedAt(),
            u.getUpdatedAt()
        ));
      }
    }

    // 4) UNTRACKED: una fila por Variante con stock acumulado (movimientos)
    if (!untracked.isEmpty()) {
      var untrackedIds = untracked.stream().map(Variante::getId).toList();

      // ✅ Usa la proyección StockMovByVarianteRow de tu repo (no Object[])
      Map<Long, Long> stockMap = new HashMap<>();
      for (var row : movRepo.stockNoTrackeadoPorVariante(untrackedIds)) {
        Long varianteId = row.getVarianteId();
        Integer stock   = row.getStock(); // puede venir null? tu query usa coalesce, así que no
        stockMap.put(varianteId, stock == null ? 0L : stock.longValue());
      }

      for (var v : untracked) {
        var m = v.getModelo();
        out.add(new InventarioRowDTO(
            m.getId(), m.getNombre(),
            v.getId(),
            v.getColor()!=null ? v.getColor().getNombre() : null,
            v.getCapacidad()!=null ? v.getCapacidad().getEtiqueta() : null,
            null,                // unidadId
            null, null, null, null,  // imei/bateria/estadoProducto/estadoStock
            v.getPrecioBase(),
            null,                // precioOverride (no hay)
            v.getPrecioBase(),   // precioEfectivo = base
            stockMap.getOrDefault(v.getId(), 0L), // stock acumulado
            false,               // trackeaUnidad
            v.getCreatedAt(),
            v.getUpdatedAt()
        ));
      }
    }

    // 5) orden sugerido: modelo, variante, unidad/stock
    out.sort(Comparator
        .comparing(InventarioRowDTO::modeloNombre, String.CASE_INSENSITIVE_ORDER)
        .thenComparing((InventarioRowDTO r) -> Optional.ofNullable(r.colorNombre()).orElse(""), String.CASE_INSENSITIVE_ORDER)
        .thenComparing((InventarioRowDTO r) -> Optional.ofNullable(r.capacidadEtiqueta()).orElse(""), String.CASE_INSENSITIVE_ORDER)
        .thenComparing(r -> Optional.ofNullable(r.unidadId()).orElse(0L))
    );

    return out;
  }
}
