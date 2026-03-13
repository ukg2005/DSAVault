import client from './client';
import type { Pattern } from '../types';

export const getPatterns = () => client.get<Pattern[]>('/api/patterns/');
export const getPattern = (id: number) => client.get<Pattern>(`/api/patterns/${id}/`);
export const createPattern = (data: Partial<Pattern>) => client.post<Pattern>('/api/patterns/', data);
export const updatePattern = (id: number, data: Partial<Pattern>) =>
  client.patch<Pattern>(`/api/patterns/${id}/`, data);
export const deletePattern = (id: number) => client.delete(`/api/patterns/${id}/`);
