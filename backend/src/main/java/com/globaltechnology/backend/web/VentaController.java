package com.globaltechnology.backend.web;

import com.globaltechnology.backend.service.VentaService;
import com.globaltechnology.backend.web.dto.VentaCreateDTO;
import com.globaltechnology.backend.web.dto.VentaDTO;
import jakarta.validation.Valid;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ventas")
public class VentaController {
  private final VentaService service;
  public VentaController(VentaService service){ this.service = service; }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public VentaDTO crearYConfirmar(@Valid @RequestBody VentaCreateDTO dto){
    return service.crearYConfirmar(dto);
  }

    @GetMapping
  public List<VentaDTO> listar(){
    return service.listar(); // implementá en el service
  }
}
