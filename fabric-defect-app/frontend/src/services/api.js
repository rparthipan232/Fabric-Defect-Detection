import axios from 'axios';

const BASE_URL = `http://${window.location.hostname}:8000`;

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 60000,
});

/**
 * Run defect prediction on an image file
 * @param {File} imageFile
 * @param {function} onProgress
 * @returns {Promise}
 */
export const predictDefect = async (imageFile, onProgress) => {
  const formData = new FormData();
  formData.append('file', imageFile);

  const response = await api.post('/detect/predict', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      if (onProgress) {
        const pct = Math.round((e.loaded * 100) / e.total);
        onProgress(pct);
      }
    },
  });

  return response.data;
};

/**
 * Fetch detection history from MongoDB
 * @returns {Promise}
 */
export const fetchHistory = async () => {
  const response = await api.get('/detect/history');
  return response.data;
};

/**
 * Send a single webcam frame blob for live defect detection
 * @param {Blob} frameBlob  - JPEG blob from canvas.toBlob()
 * @returns {Promise}
 */
export const liveScan = async (frameBlob) => {
  const formData = new FormData();
  formData.append('file', frameBlob, 'frame.jpg');

  const response = await api.post('/detect/live_scan', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 10000,
  });

  return response.data;
};

export default api;

