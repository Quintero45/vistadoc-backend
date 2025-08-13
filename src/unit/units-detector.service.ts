// src/unit/units-detector.service.ts
import { Injectable, HttpException, Logger } from '@nestjs/common';
import axios from 'axios';
import * as FormData from 'form-data';
import * as path from 'path';
import { URL } from 'url';

function joinUrl(base: string, suffix: string) {
  return `${base.replace(/\/+$/, '')}/${suffix.replace(/^\/+/, '')}`;
}

@Injectable()
export class UnitsDetectorService {
  private readonly logger = new Logger(UnitsDetectorService.name);

  // Prioriza DETECTOR_BASE_URL (Render), luego DETECTOR_URL. Default solo para dev local.
  private readonly baseUrl =
    process.env.DETECTOR_BASE_URL ??
    process.env.DETECTOR_URL ??
    'http://localhost:5001';

  // Endpoint final normalizado
  private readonly detectUrl = joinUrl(this.baseUrl, '/detect-units');

  async detectFromImageUrl(imageUrl: string) {
    // 1) Descarga el archivo como stream (Cloudinary u otra URL)
    const fileResp = await axios.get(imageUrl, { responseType: 'stream' });

    // 2) Nombre de archivo razonable
    let filename = 'upload';
    try {
      const u = new URL(imageUrl);
      const last = path.basename(u.pathname);
      if (last && last !== '/') filename = last;
    } catch { /* no-op */ }

    // 3) Form-data con el campo 'file'
    const form = new FormData();
    form.append('file', fileResp.data, { filename });

    // 4) POST al microservicio
    try {
      const { data } = await axios.post(this.detectUrl, form, {
        headers: form.getHeaders(),
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
        timeout: 20000,
      });
      return data; // { count, units, image_with_boxes }
    } catch (e: any) {
      this.logger.error('Detector call failed', {
        message: e?.message,
        code: e?.code,
        status: e?.response?.status,
        data: e?.response?.data,
        detectUrl: this.detectUrl,
      });
      throw new HttpException(e?.response?.data || e?.message || 'Detector error', e?.response?.status || 500);
    }
  }
}
