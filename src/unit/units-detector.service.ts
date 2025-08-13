// src/unit/units-detector.service.ts
import { Injectable, HttpException, Logger } from '@nestjs/common';
import axios, { AxiosError } from 'axios';
import * as FormData from 'form-data';
import * as path from 'path';
import { URL } from 'url';

function sleep(ms: number) { return new Promise(res => setTimeout(res, ms)); }
function joinUrl(base: string, suffix: string) {
  return `${base.replace(/\/+$/, '')}/${suffix.replace(/^\/+/, '')}`;
}

@Injectable()
export class UnitsDetectorService {
  private readonly logger = new Logger(UnitsDetectorService.name);

  private readonly baseUrl =
    process.env.DETECTOR_BASE_URL ??
    process.env.DETECTOR_URL ??
    'http://localhost:5001';

  private readonly detectUrl = joinUrl(this.baseUrl, '/detect-units');

  async detectFromImageUrl(imageUrl: string) {
    // descarga como stream (Cloudinary u otra URL)
    const fileResp = await axios.get(imageUrl, { responseType: 'stream' });

    // nombre de archivo razonable
    let filename = 'upload';
    try {
      const u = new URL(imageUrl);
      const last = path.basename(u.pathname);
      if (last && last !== '/') filename = last;
    } catch { /* ignore */ }

    const form = new FormData();
    form.append('file', fileResp.data, { filename });

    const headers = form.getHeaders();

    // --- retry con backoff para 503/cold start ---
    const maxAttempts = 4; // 0s, 1s, 2s, 4s (hasta ~7s de espera)
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const { data } = await axios.post(this.detectUrl, form, {
          headers,
          maxBodyLength: Infinity,
          maxContentLength: Infinity,
          timeout: 60000, // más generoso por OCR/CPU
        });
        return data;
      } catch (err) {
        const e = err as AxiosError;
        const status = e.response?.status;
        const retriable =
          status === 503 ||
          e.code === 'ECONNRESET' ||
          e.code === 'ECONNREFUSED' ||
          e.code === 'ENOTFOUND' ||
          e.code === 'ETIMEDOUT';

        this.logger.error('Detector call failed', {
          attempt, status, code: e.code, message: e.message, url: this.detectUrl,
          data: e.response?.data,
        });

        if (!retriable || attempt === maxAttempts) {
          throw new HttpException(
            e.response?.data || e.message || 'Detector error',
            status || 500,
          );
        }
        await sleep(1000 * Math.pow(2, attempt - 1)); // 1s,2s,4s...
      }
    }

    throw new HttpException('Detector error', 500);
  }
}
