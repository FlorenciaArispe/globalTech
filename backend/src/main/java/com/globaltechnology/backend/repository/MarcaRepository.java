package com.globaltechnology.backend.repository;

import com.globaltechnology.backend.domain.Marca;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MarcaRepository extends JpaRepository<Marca, Long> {
}
