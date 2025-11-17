package com.globaltechnology.backend.web.dto;

import java.util.List;

public record ProductoStatsDTO(
    long modelosSinStockCount,
    long modelosStockBajoCount,
    List<ModeloStockDTO> modelosSinStock,
    List<ModeloStockDTO> modelosStockBajo,
    List<TopModeloDTO> topModelosMasVendidos
) {}