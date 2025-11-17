package com.globaltechnology.backend.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.globaltechnology.backend.repository.ModeloRepository;
import com.globaltechnology.backend.repository.MovimientoInventarioRepository;
import com.globaltechnology.backend.repository.VentaItemRepository;
import com.globaltechnology.backend.web.dto.ModeloStockDTO;
import com.globaltechnology.backend.web.dto.ProductoStatsDTO;
import com.globaltechnology.backend.web.dto.TopModeloDTO;

@Service
public class ProductoStatsService {

  private final ModeloRepository modeloRepo;
  private final MovimientoInventarioRepository movRepo;
  private final VentaItemRepository ventaItemRepo;

  private static final long STOCK_BAJO_UMBRAL = 2L;

  public ProductoStatsService(
      ModeloRepository modeloRepo,
      MovimientoInventarioRepository movRepo,
      VentaItemRepository ventaItemRepo
  ) {
    this.modeloRepo = modeloRepo;
    this.movRepo = movRepo;
    this.ventaItemRepo = ventaItemRepo;
  }

  // 👇 ya NO recibe rangeKey
  public ProductoStatsDTO stats() {
    var sinStock = new ArrayList<ModeloStockDTO>();
    var stockBajo = new ArrayList<ModeloStockDTO>();

    // 1) Modelos que trackean unidad -> stock según UNIDADES EN_STOCK
    var stockTrackeado = modeloRepo.findStockActualPorModeloTrackeado();
    for (var row : stockTrackeado) {
      long stock = row.getStock() != null ? row.getStock() : 0L;

      if (stock == 0) {
        sinStock.add(new ModeloStockDTO(row.getModeloId(), row.getNombre(), stock));
      } else if (stock > 0 && stock <= STOCK_BAJO_UMBRAL) {
        stockBajo.add(new ModeloStockDTO(row.getModeloId(), row.getNombre(), stock));
      }
    }

    // 2) Modelos que NO trackean unidad -> stock según MOVIMIENTOS
    var stockNoTrackeado = movRepo.findStockActualPorModeloNoTrackeado();
    for (var row : stockNoTrackeado) {
      long stock = row.getStock() != null ? row.getStock() : 0L;

      if (stock == 0) {
        sinStock.add(new ModeloStockDTO(row.getModeloId(), row.getNombre(), stock));
      } else if (stock > 0 && stock <= STOCK_BAJO_UMBRAL) {
        stockBajo.add(new ModeloStockDTO(row.getModeloId(), row.getNombre(), stock));
      }
    }

    // 3) Top modelos más vendidos (HISTÓRICO, sin rango)
    var top = topModelosMasVendidos();

    return new ProductoStatsDTO(
        sinStock.size(),
        stockBajo.size(),
        sinStock,
        stockBajo,
        top
    );
  }

  // 👇 ahora sin parámetro y sin fechas
  private List<TopModeloDTO> topModelosMasVendidos() {
    var projs = ventaItemRepo.findVentasTotalesPorModelo();

    return projs.stream()
        .map(p -> new TopModeloDTO(
            p.getModeloId(),
            p.getNombre(),
            p.getUnidadesVendidas()
        ))
        .limit(5)
        .toList();
  }
}
