import axios from 'axios';

const API_BASE_URL = import.meta.env.DEV ? '/api' : import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

export const uploadCsvFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const { data } = await api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const fetchTransactions = async () => {
  const { data } = await api.get('/transactions');
  return data.data || [];
};

export const fetchSummary = async () => {
  const { data } = await api.get('/summary');
  return data.data;
};

export const fetchStructuredInsights = async () => {
  const { data } = await api.get('/insights');
  return data.data;
};

export const fetchAIInsights = async () => {
  const { data } = await api.get('/ai-insights');
  return data.data;
};

export const fetchForecast = async (days = 30) => {
  const { data } = await api.get(`/forecast?days=${days}`);
  return data.data;
};
