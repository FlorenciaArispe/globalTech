package com.globaltechnology.backend.repository;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import com.globaltechnology.backend.domain.StickyNote;

public interface StickyNoteRepository extends JpaRepository<StickyNote, UUID> {
  List<StickyNote> findAllByUserIdOrderByCreatedAtDesc(UUID userId);
}