package com.globaltechnology.backend.repository;

import com.globaltechnology.backend.domain.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface VarianteImagenRepository extends JpaRepository<VarianteImagen, Long> {

  List<VarianteImagen> findAllByVariante_IdOrderBySetTipoAscOrdenAsc(Long varianteId);

  List<VarianteImagen> findAllByVariante_IdAndSetTipoOrderByOrdenAsc(Long varianteId, ImagenSet set);

  long countByVariante_IdAndSetTipo(Long varianteId, ImagenSet set);

  void deleteByVariante_IdAndSetTipo(Long varianteId, ImagenSet set);

  List<VarianteImagen> findAllByVariante_IdIn(List<Long> varianteIds);

  @Query("""
        select coalesce(max(vi.orden), -1)
        from VarianteImagen vi
        where vi.variante.id = :varianteId and vi.setTipo = :set
      """)
  int findMaxOrdenByVarianteIdAndSet(@Param("varianteId") Long varianteId,
      @Param("set") ImagenSet set);

  void deleteByVariante_Id(Long varianteId);
}
