package com.globaltechnology.backend.service;

import com.globaltechnology.backend.domain.*;
import com.globaltechnology.backend.repository.*;
import com.globaltechnology.backend.web.dto.*;

import lombok.extern.slf4j.Slf4j;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import org.springframework.data.domain.Sort;


@Slf4j
@Service
public class VentaService {
  private final VentaRepository ventaRepo;
  private final VentaItemRepository itemRepo;
  private final UnidadRepository unidadRepo;
  private final MovimientoInventarioRepository movRepo;
  private final ClienteRepository clienteRepo;

  public VentaService(VentaRepository ventaRepo, VentaItemRepository itemRepo,
      UnidadRepository unidadRepo, MovimientoInventarioRepository movRepo,
      ClienteRepository clienteRepo) {
    this.ventaRepo = ventaRepo;
    this.itemRepo = itemRepo;
    this.unidadRepo = unidadRepo;
    this.movRepo = movRepo;
    this.clienteRepo = clienteRepo;
  }

  private static BigDecimal nz(BigDecimal v) {
    return v == null ? BigDecimal.ZERO : v;
  }

  private VentaDTO toDTO(Venta v, List<VentaItem> items) {
    var itemsDTO = items.stream().map(it -> new VentaItemDTO(
        it.getId(), it.getUnidad().getId(), it.getVariante().getId(),
        it.getPrecioUnitario(), it.getDescuentoItem(), it.getObservaciones())).toList();
    return new VentaDTO(
        v.getId(), v.getFecha(),
        v.getCliente() != null ? v.getCliente().getId() : null,
        v.getCliente() != null ? v.getCliente().getNombre() : null,
        v.getSubtotal(), v.getDescuentoTotal(), v.getImpuestos(), v.getTotal(),
        v.getObservaciones(), itemsDTO);
  }

  @Transactional
  public VentaDTO crearYConfirmar(VentaCreateDTO dto) {
    try {
       Cliente cliente = null;
    if (dto.clienteId() != null) {
      cliente = clienteRepo.findById(dto.clienteId())
          .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cliente inválido"));
    }

    if (dto.items() == null || dto.items().isEmpty())
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La venta debe tener ítems");

    var v = Venta.builder()
        .fecha(Instant.now())
        .cliente(cliente)
        .observaciones(dto.observaciones())
        .build();
    v = ventaRepo.save(v);

    BigDecimal subtotal = BigDecimal.ZERO;
    List<VentaItem> items = new ArrayList<>();

    // por cada item: validar unidad disponible, crear item, marcar unidad vendida,
    // escribir movimiento
    for (var i : dto.items()) {
      var unidad = unidadRepo.findById(i.unidadId())
          .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unidad inválida"));
      if (unidad.getEstadoStock() != EstadoStock.EN_STOCK)
        throw new ResponseStatusException(HttpStatus.CONFLICT, "La unidad no está disponible");

      var variante = unidad.getVariante();
      var precio = i.precioUnitario();
      var desc = nz(i.descuentoItem());

      var item = VentaItem.builder()
          .venta(v).variante(variante).unidad(unidad)
          .precioUnitario(precio).descuentoItem(desc)
          .observaciones(i.observaciones())
          .build();
      
log.debug("Guardando item de venta: unidadId={}, precio={}", i.unidadId(), precio);
      itemRepo.save(item);
      items.add(item);
      unidad.setEstadoStock(EstadoStock.VENDIDO);
      unidadRepo.save(unidad);

      // movimiento inventario
  var mov = MovimientoInventario.builder()
    .fecha(Instant.now())
    .tipo(TipoMovimiento.VENTA)
    .variante(variante)
    .unidad(unidad)            // porque es una unidad específica
    .cantidad(1)               // <— Integer
    .refTipo("venta")
    .refId(v.getId())
    .build();
      log.debug("Guardando movimiento inventario: unidadId={}, tipo={}", unidad.getId(), TipoMovimiento.VENTA);
      movRepo.save(mov);

      subtotal = subtotal.add(precio.subtract(desc));
    }

    var descuentoTotal = nz(dto.descuentoTotal());
    var impuestos = nz(dto.impuestos());
    var total = subtotal.subtract(descuentoTotal).add(impuestos);

    v.setSubtotal(subtotal);
    v.setDescuentoTotal(descuentoTotal);
    v.setImpuestos(impuestos);
    v.setTotal(total);
    log.debug("Guardando venta...");
    v = ventaRepo.save(v);

    return toDTO(v, items);
    } catch (Exception e) {
      log.error("Error al crear/confirmar venta. DTO: {}", dto, e);
      throw e; // deja que Spring devuelva 500, pero con stack claro
    }
  }

  @Transactional(readOnly = true)
public List<VentaDTO> listar() {
  var ventas = ventaRepo.findAll(Sort.by(Sort.Direction.DESC, "fecha"));
  // si necesitás items: itemRepo.findByVentaIdIn(...)
  return ventas.stream()
      .map(v -> toDTO(v, itemRepo.findByVentaId(v.getId())))
      .toList();
}

 
 
}
