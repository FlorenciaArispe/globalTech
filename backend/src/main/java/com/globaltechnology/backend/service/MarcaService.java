package com.globaltechnology.backend.service;

import com.globaltechnology.backend.web.dto.MarcaDTO;
import com.globaltechnology.backend.web.dto.MarcaCreateDTO;
import java.util.List;

public interface MarcaService {
  List<MarcaDTO> list();
  MarcaDTO get(Long id);
  MarcaDTO create(MarcaCreateDTO dto);
  MarcaDTO update(Long id, MarcaCreateDTO dto);
  void delete(Long id);
}
