// /lib/imagenes.ts
import { api } from '@/lib/axios';

export type ImagenSet = 'SELLADO' | 'USADO' | 'CATALOGO';
export type Picked = { file: File; alt?: string };

export type VarianteImagenDTO = {
  id: number;
  set: ImagenSet;
  url: string;
  altText?: string | null;
  orden: number;
  principal: boolean;
};

export type VarianteImagenListDTO = {
  varianteId: number;
  sets: Partial<Record<ImagenSet, VarianteImagenDTO[]>>;
};

// Reemplaza TODO el set por los files provistos (máx 3)
export async function uploadVarianteImages(
  varianteId: number | string,
  set: ImagenSet,
  files: { file: File; alt?: string }[]
): Promise<VarianteImagenDTO[] | void> {
  if (!files.length) return;

  const fd = new FormData();
  for (const f of files) fd.append('files', f.file);

  // Si querés evitar guardar alt vacío como "", podés solo pushear cuando haya texto:
  // files.forEach(f => { if (f.alt) fd.append('alts', f.alt) });

  // Si te da igual "" (backend lo acepta), dejalo así:
  for (const f of files) fd.append('alts', f.alt ?? '');

  const { data } = await api.put<VarianteImagenDTO[]>(
    `/api/variantes/${varianteId}/imagenes/${set}`,
    fd,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return data; // ← te permite refrescar la UI sin otro GET
}

// Lista imágenes separadas por set para una variante
export async function getVarianteImagenes(
  varianteId: number | string
): Promise<VarianteImagenListDTO> {
  const { data } = await api.get<VarianteImagenListDTO>(`/api/variantes/${varianteId}/imagenes`);
  return data;
}

// Borra una imagen puntual
export async function deleteVarianteImage(
  varianteId: number | string, // no se usa en backend pero mantiene convención REST en la ruta
  imagenId: number | string
): Promise<void> {
  await api.delete(`/api/variantes/${varianteId}/imagenes/${imagenId}`);
}

export async function addVarianteImages(
  varianteId: number | string,
  set: ImagenSet,
  files: Picked[]
) {
  if (!files.length) return;
  const fd = new FormData();
  for (const f of files) fd.append('files', f.file);
  for (const f of files) fd.append('alts', f.alt ?? '');
  await api.post(`/api/variantes/${varianteId}/imagenes/${set}`, fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}
