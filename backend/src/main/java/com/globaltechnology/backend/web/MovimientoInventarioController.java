package com.globaltechnology.backend.web;

import com.globaltechnology.backend.service.MovimientoInventarioService;
import com.globaltechnology.backend.web.dto.MovimientoCreateDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/movimientos")
public class MovimientoInventarioController {

  private final MovimientoInventarioService service;

  public MovimientoInventarioController(MovimientoInventarioService service) {
    this.service = service;
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public void crear(@RequestBody MovimientoCreateDTO dto) {
    log.info("POST /api/movimientos varianteId={}, tipo={}, cantidad={}", dto.varianteId(), dto.tipo(), dto.cantidad());
    service.crearMovimiento(dto);
  }
}
