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

export async function getVarianteImagenes(
  varianteId: number | string
): Promise<VarianteImagenListDTO> {
  const { data } = await api.get<VarianteImagenListDTO>(`/api/variantes/${varianteId}/imagenes`);
  return data;
}

export async function deleteVarianteImage(
  varianteId: number | string, 
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
