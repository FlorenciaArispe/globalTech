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
   private final VarianteRepository varianteRepo;

  public VentaService(VentaRepository ventaRepo, VentaItemRepository itemRepo,
      UnidadRepository unidadRepo, MovimientoInventarioRepository movRepo,
      ClienteRepository clienteRepo,  VarianteRepository varianteRepo) {
    this.ventaRepo = ventaRepo;
    this.itemRepo = itemRepo;
    this.unidadRepo = unidadRepo;
    this.movRepo = movRepo;
    this.clienteRepo = clienteRepo;
      this.varianteRepo = varianteRepo;
  }

  private static BigDecimal nz(BigDecimal v) {
    return v == null ? BigDecimal.ZERO : v;
  }

private VentaDTO toDTO(Venta v, List<VentaItem> items) {
  var itemsDTO = items.stream().map(it -> new VentaItemDTO(
  it.getId(),
  it.getUnidad() != null ? it.getUnidad().getId() : null,
  it.getVariante().getId(),
  it.getPrecioUnitario(),
  it.getDescuentoItem(),
  it.getVariante().getModelo().getNombre(),
  it.getCantidad()
)).toList();

  return new VentaDTO(
      v.getId(), v.getFecha(),
      v.getCliente() != null ? v.getCliente().getId() : null,
      v.getCliente() != null ? v.getCliente().getNombre() : null,
      v.getDescuentoTotal(), v.getTotal(),
      v.getObservaciones(), itemsDTO
  );
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

    for (var i : dto.items()) {
      final BigDecimal precio = i.precioUnitario();
      final BigDecimal desc   = nz(i.descuentoItem());
      final BigDecimal neto   = precio.subtract(desc);

      if (i.unidadId() != null) {
        // ====== TRACKEADO ======
        var unidad = unidadRepo.findById(i.unidadId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unidad inválida"));
        if (unidad.getEstadoStock() != EstadoStock.EN_STOCK)
          throw new ResponseStatusException(HttpStatus.CONFLICT, "La unidad no está disponible");

        var variante = unidad.getVariante();

        var item = VentaItem.builder()
            .venta(v)
            .variante(variante)
            .unidad(unidad)        // presente
            .cantidad(1)           // fijo 1
            .precioUnitario(precio)
            .descuentoItem(desc)
            .build();

        itemRepo.save(item);
        items.add(item);

        // actualizar stock unidad
        unidad.setEstadoStock(EstadoStock.VENDIDO);
        unidadRepo.save(unidad);

        // movimiento inventario
        var mov = MovimientoInventario.builder()
            .fecha(Instant.now())
            .tipo(TipoMovimiento.VENTA)
            .variante(variante)
            .unidad(unidad)
            .cantidad(1)
            .refTipo("venta")
            .refId(v.getId())
            .build();
        movRepo.save(mov);

        subtotal = subtotal.add(neto);

      } else {
        // ====== NO-TRACKEADO POR VARIANTE ======
        if (i.varianteId() == null || i.cantidad() == null || i.cantidad() <= 0) {
          throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ítem no-trackeado inválido");
        }

        var variante = varianteRepo.findById(i.varianteId())  // <-- asegurate de tener varianteRepo
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Variante inválida"));

        // TODO: validar stock disponible a nivel variante si lo llevás (p.ej. variante.stockAcumulado >= i.cantidad())

        var item = VentaItem.builder()
            .venta(v)
            .variante(variante)
            .unidad(null)              // <- no hay unidad
            .cantidad(i.cantidad())
            .precioUnitario(precio)
            .descuentoItem(desc)
            .build();

        itemRepo.save(item);
        items.add(item);

        // movimiento inventario (cantidad N)
        var mov = MovimientoInventario.builder()
            .fecha(Instant.now())
            .tipo(TipoMovimiento.VENTA)
            .variante(variante)
            .unidad(null)
            .cantidad(i.cantidad())    // 👈 importante
            .refTipo("venta")
            .refId(v.getId())
            .build();
        movRepo.save(mov);

        subtotal = subtotal.add(neto.multiply(BigDecimal.valueOf(i.cantidad())));
      }
    }

    var descuentoTotal = nz(dto.descuentoTotal());
    var total = subtotal.subtract(descuentoTotal);

    v.setDescuentoTotal(descuentoTotal);
    v.setTotal(total);
    v = ventaRepo.save(v);

    return toDTO(v, items);

  } catch (Exception e) {
    log.error("Error al crear/confirmar venta. DTO: {}", dto, e);
    throw e;
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
