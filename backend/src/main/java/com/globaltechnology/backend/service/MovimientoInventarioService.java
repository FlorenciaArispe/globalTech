// service/MovimientoInventarioService.java
package com.globaltechnology.backend.service;

import com.globaltechnology.backend.domain.*;
import com.globaltechnology.backend.repository.*;
import com.globaltechnology.backend.web.dto.MovimientoCreateDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.Optional;

@Slf4j
@Service
public class MovimientoInventarioService {
  private final VarianteRepository varianteRepo;
  private final MovimientoInventarioRepository movRepo;

  public MovimientoInventarioService(VarianteRepository varianteRepo,
                                     MovimientoInventarioRepository movRepo) {
    this.varianteRepo = varianteRepo;
    this.movRepo = movRepo;
  }

  // MovimientoInventarioService.java (método crearMovimiento)
@Transactional
public MovimientoInventario crearMovimiento(MovimientoCreateDTO dto) {
  log.info("crearMovimiento dto={}", dto);

  if (dto.varianteId() == null || dto.tipo() == null || dto.cantidad() == null || dto.cantidad() == 0) {
    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Datos incompletos o cantidad 0");
  }

  // Normalizar: ENTRADA => +abs, SALIDA/VENTA => -abs
  int signed = switch (dto.tipo()) {
    case ENTRADA -> Math.abs(dto.cantidad());
    case SALIDA, VENTA -> -Math.abs(dto.cantidad());
  };

  Variante v = varianteRepo.findById(dto.varianteId())
      .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Variante no encontrada"));

  // Este endpoint es para variantes NO trackeadas por unidad:
  if (v.getModelo().isTrackeaUnidad()) {
    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La variante trackea unidad; use alta/baja de Unidad");
  }

  // Validar stock suficiente en movimientos negativos
  int stockActual = Optional.ofNullable(movRepo.stockNoTrackeadoDeVariante(v.getId())).orElse(0);
  long resultante = (long) stockActual + signed;
  if (resultante < 0) {
    throw new ResponseStatusException(HttpStatus.CONFLICT, "Stock insuficiente");
  }

  MovimientoInventario mov = MovimientoInventario.builder()
      .fecha(Instant.now())
      .tipo(dto.tipo())
      .variante(v)
      .unidad(null)
      .cantidad(signed)
      .refTipo(dto.refTipo())
      .refId(dto.refId())
      .notas(dto.notas())
      .build();

  movRepo.save(mov);
  log.info("Movimiento guardado ok. varianteId={}, tipo={}, qty={}", v.getId(), dto.tipo(), signed);
  return mov;
}

}
