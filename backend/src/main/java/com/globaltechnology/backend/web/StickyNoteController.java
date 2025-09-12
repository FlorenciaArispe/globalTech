package com.globaltechnology.backend.web;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

// ⚠️ Ajustá estos imports según tu estructura de paquetes
import com.globaltechnology.backend.domain.StickyNote;
import com.globaltechnology.backend.repository.*;;

@RestController
@RequestMapping("/api/notes")
@RequiredArgsConstructor
public class StickyNoteController {

  private final StickyNoteRepository repo;

  private UUID currentUserId() {
    return UUID.fromString("00000000-0000-0000-0000-000000000000");
  }

  public static record CreateNoteReq(String text, String color, Double tilt) {}
  public static record UpdateNoteReq(String text, String color) {}
  public static record NoteRes(UUID id, String text, String color, Double tilt,
                               Instant createdAt, Instant updatedAt) {}

  private static NoteRes toRes(StickyNote n) {
    return new NoteRes(
        n.getId(),
        n.getText(),
        n.getColor(),
        n.getTilt(),
        n.getCreatedAt(),
        n.getUpdatedAt()
    );
  }

  @GetMapping
  public List<NoteRes> list() {
    return repo.findAllByUserIdOrderByCreatedAtDesc(currentUserId())
        .stream()
        .map(StickyNoteController::toRes)
        .collect(Collectors.toList());
  }

  @PostMapping
  public NoteRes create(@RequestBody CreateNoteReq req) {
    StickyNote n = new StickyNote();
    n.setUserId(currentUserId());
    n.setText(req.text());
    n.setColor(req.color());
    n.setTilt(req.tilt() == null ? 0.0 : req.tilt());
    n = repo.save(n);
    return toRes(n);
  }

  @PutMapping("/{id}")
  public NoteRes update(@PathVariable UUID id, @RequestBody UpdateNoteReq req) {
    StickyNote n = repo.findById(id).orElseThrow();
    // Opcional: validar dueño -> if (!n.getUserId().equals(currentUserId())) throw new ResponseStatusException(HttpStatus.FORBIDDEN);
    if (req.text() != null)  n.setText(req.text());
    if (req.color() != null) n.setColor(req.color());
    n = repo.save(n);
    return toRes(n);
  }

  @DeleteMapping("/{id}")
  public void delete(@PathVariable UUID id) {
    // Opcional: validar dueño
    repo.deleteById(id);
  }
}
