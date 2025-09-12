package com.globaltechnology.backend.service;

import com.globaltechnology.backend.domain.Marca;
import com.globaltechnology.backend.repository.MarcaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MarcaService {

    private final MarcaRepository marcaRepository;

    @Transactional(readOnly = true)
    public List<Marca> listar() {
        return marcaRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Marca obtenerPorId(Long id) {
        return marcaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Marca no encontrada: " + id));
    }

    @Transactional
    public Marca crear(String nombre) {
        Marca m = new Marca();
        m.setNombre(nombre);
        return marcaRepository.save(m);
    }

    @Transactional
    public Marca actualizar(Long id, String nombre) {
        Marca m = obtenerPorId(id);
        m.setNombre(nombre);
        return marcaRepository.save(m);
    }

    @Transactional
    public void eliminar(Long id) {
        if (!marcaRepository.existsById(id)) {
            throw new RuntimeException("Marca no encontrada: " + id);
        }
        marcaRepository.deleteById(id);
    }
}
