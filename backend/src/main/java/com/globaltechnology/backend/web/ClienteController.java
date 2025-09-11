package com.globaltechnology.backend.web;

import com.globaltechnology.backend.service.ClienteService;
import com.globaltechnology.backend.web.dto.ClienteCreateDTO;
import com.globaltechnology.backend.web.dto.ClienteDTO;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/clientes")
public class ClienteController {
  private final ClienteService service;
  public ClienteController(ClienteService service){ this.service = service; }

  @GetMapping public List<ClienteDTO> list(){ return service.list(); }
  @GetMapping("/{id}") public ClienteDTO get(@PathVariable Long id){ return service.get(id); }

  @PostMapping @ResponseStatus(HttpStatus.CREATED)
  public ClienteDTO create(@Valid @RequestBody ClienteCreateDTO dto){ return service.create(dto); }

  @PutMapping("/{id}")
  public ClienteDTO update(@PathVariable Long id, @Valid @RequestBody ClienteCreateDTO dto){ return service.update(id, dto); }

  @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT)
  public void delete(@PathVariable Long id){ service.delete(id); }
}
