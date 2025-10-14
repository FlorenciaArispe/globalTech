package com.globaltechnology.backend.repository;

import com.globaltechnology.backend.domain.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Collection;
import java.util.List;

public interface VarianteRepository extends JpaRepository<Variante, Long> {
    boolean existsByModelo_Id(Long modeloId);
  boolean existsByModeloAndColorAndCapacidad(Modelo modelo, Color color, Capacidad capacidad);
  List<Variante> findAllByModelo_Id(Long modeloId);
  List<Variante> findAllByIdIn(Collection<Long> ids);

   @Query("""
    select v.modelo.id as modeloId, count(v) as variantes
    from Variante v
    where v.modelo.id in :modeloIds
    group by v.modelo.id
  """)
  List<ModeloVarianteCountRow> variantesPorModelo(Collection<Long> modeloIds);

  @Query("""
  select (count(v) > 0) from Variante v
  where v.modelo.id = :modeloId
    and coalesce(v.color.id, -1) = coalesce(:colorId, -1)
    and coalesce(v.capacidad.id, -1) = coalesce(:capacidadId, -1)
""")
boolean existsByModeloAndAtributos(Long modeloId, Long colorId, Long capacidadId);


  interface ModeloVarianteCountRow {
    Long getModeloId();
    long getVariantes();
  }
  List<Variante> findByModelo(Modelo modelo);
  List<Variante> findAllByModelo_IdIn(List<Long> modeloIds);

}
