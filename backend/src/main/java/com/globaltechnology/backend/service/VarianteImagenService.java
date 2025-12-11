package com.globaltechnology.backend.service;

import com.globaltechnology.backend.domain.*;
import com.globaltechnology.backend.repository.*;
import com.globaltechnology.backend.web.dto.*;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.*;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class VarianteImagenService {

  private final VarianteRepository varianteRepo;
  private final VarianteImagenRepository imagenRepo;

  @Value("${app.uploads.dir:/app/uploads}")
  private String uploadsDir;

  @Value("${app.uploads.public-base:http://localhost:8086/uploads}")
  private String publicBase;

  @Value("${app.uploads.max-files-per-set:3}")
  private int maxPerSet;

  @Value("${app.uploads.max-file-size-bytes:5242880}")
  private long maxSizeBytes;

  private static final Set<String> ALLOWED = Set.of("image/jpeg", "image/png", "image/webp", "image/avif");

  public VarianteImagenService(VarianteRepository varianteRepo, VarianteImagenRepository imagenRepo) {
    this.varianteRepo = varianteRepo;
    this.imagenRepo = imagenRepo;
  }

  public VarianteImagenListDTO list(Long varianteId) {
    var all = imagenRepo.findAllByVariante_IdOrderBySetTipoAscOrdenAsc(varianteId)
        .stream().map(VarianteImagenDTO::from).collect(Collectors.toList());

    Map<ImagenSet, List<VarianteImagenDTO>> bySet = Arrays.stream(ImagenSet.values())
        .collect(Collectors.toMap(s -> s, s -> new ArrayList<>()));

    for (var dto : all)
      bySet.get(dto.set()).add(dto);
    return new VarianteImagenListDTO(varianteId, bySet);
  }

  @Transactional
  public List<VarianteImagenDTO> replaceSet(Long varianteId, ImagenSet set, List<MultipartFile> files,
      List<String> altTexts) throws IOException {
    if (files == null)
      files = List.of();
    if (files.size() > maxPerSet)
      throw new IllegalArgumentException("Máximo " + maxPerSet + " imágenes por set");

    Variante variante = varianteRepo.findById(varianteId)
        .orElseThrow(() -> new NoSuchElementException("Variante no encontrada"));

    var prev = imagenRepo.findAllByVariante_IdAndSetTipoOrderByOrdenAsc(varianteId, set);
    imagenRepo.deleteAll(prev);

    Path base = Path.of(uploadsDir, "variantes", String.valueOf(varianteId), set.name().toLowerCase());
    Files.createDirectories(base);

    List<VarianteImagen> nuevas = new ArrayList<>();
    for (int i = 0; i < files.size(); i++) {
      MultipartFile f = files.get(i);
      if (f.isEmpty())
        continue;
      if (f.getSize() > maxSizeBytes)
        throw new IllegalArgumentException("Archivo supera el límite de tamaño");
      String ctype = Optional.ofNullable(f.getContentType()).orElse("");
      if (!ALLOWED.contains(ctype))
        throw new IllegalArgumentException("Tipo no permitido: " + ctype);

      String ext = switch (ctype) {
        case "image/jpeg" -> "jpg";
        case "image/png" -> "png";
        case "image/webp" -> "webp";
        case "image/avif" -> "avif";
        default -> "bin";
      };
      String name = i + "-" + UUID.randomUUID() + "." + ext;

      Path target = base.resolve(name);
      Files.copy(f.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

      String url = String.join("/",
          publicBase.replaceAll("/$", ""),
          "variantes", String.valueOf(varianteId), set.name().toLowerCase(), name);

      String alt = (altTexts != null && i < altTexts.size()) ? altTexts.get(i) : null;

      nuevas.add(VarianteImagen.builder()
          .variante(variante)
          .setTipo(set)
          .orden(i)
          .principal(i == 0)
          .url(url)
          .altText(alt)
          .build());
    }

    imagenRepo.saveAll(nuevas);
    return nuevas.stream().map(VarianteImagenDTO::from).toList();
  }

  @Transactional
  public void deleteImage(Long imagenId) {
    imagenRepo.deleteById(imagenId);
  }

  @Transactional
  public List<VarianteImagenDTO> appendToSet(
      Long varianteId, ImagenSet set, List<MultipartFile> files, List<String> altTexts) throws IOException {
    if (files == null || files.isEmpty()) {
      return imagenRepo.findAllByVariante_IdAndSetTipoOrderByOrdenAsc(varianteId, set)
          .stream().map(VarianteImagenDTO::from).toList();
    }

    Variante variante = varianteRepo.findById(varianteId)
        .orElseThrow(() -> new NoSuchElementException("Variante no encontrada"));

    long existentes = imagenRepo.countByVariante_IdAndSetTipo(varianteId, set);
    if (existentes >= maxPerSet) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
          "Ya alcanzaste el máximo de " + maxPerSet + " imágenes en " + set);
    }
    if (existentes + files.size() > maxPerSet) {
      long libres = maxPerSet - existentes;
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
          "Podés subir como máximo " + libres + " imagen(es) más a " + set);
    }

    int maxOrden = imagenRepo.findMaxOrdenByVarianteIdAndSet(varianteId, set); // -1 si vacío
    int startOrden = maxOrden + 1;
    boolean noHabiaImagenes = (maxOrden < 0);

    Path base = Path.of(uploadsDir, "variantes", String.valueOf(varianteId), set.name().toLowerCase());
    Files.createDirectories(base);

    List<VarianteImagen> nuevas = new ArrayList<>();
    for (int i = 0; i < files.size(); i++) {
      MultipartFile f = files.get(i);
      if (f.isEmpty())
        continue;
      if (f.getSize() > maxSizeBytes)
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Archivo supera el límite de tamaño permitido");

      String ctype = Optional.ofNullable(f.getContentType()).orElse("");
      if (!ALLOWED.contains(ctype))
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tipo no permitido: " + ctype);

      String ext = switch (ctype) {
        case "image/jpeg" -> "jpg";
        case "image/png" -> "png";
        case "image/webp" -> "webp";
        case "image/avif" -> "avif";
        default -> "bin";
      };
      String name = (startOrden + i) + "-" + UUID.randomUUID() + "." + ext;

      Files.copy(f.getInputStream(), base.resolve(name), StandardCopyOption.REPLACE_EXISTING);

      String url = String.join("/",
          publicBase.replaceAll("/$", ""),
          "variantes", String.valueOf(varianteId), set.name().toLowerCase(), name);
      String alt = (altTexts != null && i < altTexts.size()) ? altTexts.get(i) : null;

      nuevas.add(VarianteImagen.builder()
          .variante(variante)
          .setTipo(set)
          .orden(startOrden + i) 
          .principal(noHabiaImagenes && i == 0) 
          .url(url)
          .altText(alt)
          .build());
    }

    imagenRepo.saveAll(nuevas);

    return imagenRepo.findAllByVariante_IdAndSetTipoOrderByOrdenAsc(varianteId, set)
        .stream().map(VarianteImagenDTO::from).toList();
  }

}
