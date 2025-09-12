package com.globaltechnology.backend.domain;

import java.time.Instant;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity @Table(name="sticky_note")
@Getter @Setter
public class StickyNote {
  @Id @GeneratedValue
  private UUID id;
  @Column(nullable=false) private UUID userId;
  @Column(nullable=false, length=1000) private String text;
  @Column(nullable=false, length=16) private String color;
  @Column(nullable=false) private Double tilt = 0.0;
  @CreationTimestamp private Instant createdAt;
  @UpdateTimestamp private Instant updatedAt;
}
