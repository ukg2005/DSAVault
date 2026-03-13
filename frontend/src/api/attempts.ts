import client from './client';
import type { Attempt } from '../types';

export const getAttempts = (patternId: number, problemId: number) =>
  client.get<Attempt[]>(`/api/patterns/${patternId}/problems/${problemId}/attempts/`);
export const createAttempt = (patternId: number, problemId: number, data: Partial<Attempt>) =>
  client.post<Attempt>(`/api/patterns/${patternId}/problems/${problemId}/attempts/`, data);
