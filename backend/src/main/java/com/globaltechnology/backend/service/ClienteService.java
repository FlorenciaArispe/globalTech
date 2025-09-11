package com.globaltechnology.backend.service;

import com.globaltechnology.backend.domain.Cliente;
import com.globaltechnology.backend.repository.ClienteRepository;
import com.globaltechnology.backend.web.dto.ClienteCreateDTO;
import com.globaltechnology.backend.web.dto.ClienteDTO;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;

@Service
public class ClienteService {
  private final ClienteRepository repo;
  public ClienteService(ClienteRepository repo){ this.repo = repo; }

  private static ClienteDTO toDTO(Cliente c){
    return new ClienteDTO(c.getId(), c.getNombre(), c.getDocumento(), c.getTelefono(), c.getEmail());
  }

  public List<ClienteDTO> list(){ return repo.findAll().stream().map(ClienteService::toDTO).toList(); }
  public ClienteDTO get(Long id){
    var c = repo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,"Cliente no encontrado"));
    return toDTO(c);
  }
  public ClienteDTO create(ClienteCreateDTO dto){
    var c = Cliente.builder()
      .nombre(dto.nombre().trim())
      .documento(dto.documento())
      .telefono(dto.telefono())
      .email(dto.email())
      .build();
    return toDTO(repo.save(c));
  }
  public ClienteDTO update(Long id, ClienteCreateDTO dto){
    var c = repo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,"Cliente no encontrado"));
    c.setNombre(dto.nombre().trim());
    c.setDocumento(dto.documento());
    c.setTelefono(dto.telefono());
    c.setEmail(dto.email());
    return toDTO(repo.save(c));
  }
  public void delete(Long id){
    if (!repo.existsById(id)) throw new ResponseStatusException(HttpStatus.NOT_FOUND,"Cliente no encontrado");
    repo.deleteById(id);
  }
}
