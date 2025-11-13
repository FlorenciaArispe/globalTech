package com.globaltechnology.backend.web;

import com.globaltechnology.backend.domain.Marca;
import com.globaltechnology.backend.service.MarcaService;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/marcas")
public class MarcaController {

    private final MarcaService marcaService;

    public MarcaController(MarcaService marcaService) {
        this.marcaService = marcaService;
    }

    @GetMapping
    public List<Marca> listar() {
        return marcaService.listar();
    }

    @PostMapping
    public Marca crear(@RequestBody Marca req) {
        return marcaService.crear(req.getNombre());
    }

     @DeleteMapping("/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void delete(@PathVariable Long id) {
    marcaService.eliminar(id);
  }
}
