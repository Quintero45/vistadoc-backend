import { Injectable, HttpException } from '@nestjs/common';
import axios from 'axios';
import * as FormData from 'form-data';

@Injectable()
export class UnitsDetectorService {
  private detectorUrl = process.env.DETECTOR_URL || 'http://localhost:5001/detect-units';

  async detectFromImageUrl(imageUrl: string) {
    const img = await axios.get(imageUrl, { responseType: 'stream' });
    const form = new FormData();
    form.append('file', img.data, { filename: 'plan.png' });

    try {
      const { data } = await axios.post(this.detectorUrl, form, {
        headers: form.getHeaders(),
        maxBodyLength: Infinity,
      });
      return data; // { units: [...], image_with_boxes: "..." }
    } catch (e: any) {
      throw new HttpException(e.response?.data || e.message, e.response?.status || 500);
    }
  }
}
