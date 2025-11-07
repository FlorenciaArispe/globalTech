import { api } from '@/lib/axios';

export async function uploadVarianteImages(
  varianteId: number | string,
  set: 'SELLADO' | 'USADO' | 'CATALOGO',
  files: { file: File; alt?: string }[]
) {
  if (!files.length) return;

  const fd = new FormData();
  for (const f of files) fd.append('files', f.file);
  for (const f of files) fd.append('alts', f.alt ?? '');

  // IMPORTANTE: no fuerces content-type global; aquí overrideamos el header
  await api.put(`/api/variantes/${varianteId}/imagenes/${set}`, fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}
