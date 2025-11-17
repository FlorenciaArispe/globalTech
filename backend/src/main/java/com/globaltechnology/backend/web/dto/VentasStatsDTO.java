package com.globaltechnology.backend.web.dto;

public record VentasStatsDTO(
    long total,       // total equipos vendidos
    long iphones,     // iPhones / celulares
    long otros        // otras categorías
) {}
