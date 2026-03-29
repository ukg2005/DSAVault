import client from './client';
import type { Problem, PaginatedResponse } from '../types';

export const getProblems = (patternId: number) =>
  client.get<Problem[]>(`/api/patterns/${patternId}/problems/`);
export const getProblem = (patternId: number, problemId: number) =>
  client.get<Problem>(`/api/patterns/${patternId}/problems/${problemId}/`);
export const createProblem = (patternId: number, data: Partial<Problem>) =>
  client.post<Problem>(`/api/patterns/${patternId}/problems/`, data);
export const updateProblem = (patternId: number, problemId: number, data: Partial<Problem>) =>
  client.patch<Problem>(`/api/patterns/${patternId}/problems/${problemId}/`, data);
export const deleteProblem = (patternId: number, problemId: number) =>
  client.delete(`/api/patterns/${patternId}/problems/${problemId}/`);
export const getAllProblems = (params?: Record<string, any>) => 
  client.get<PaginatedResponse<Problem>>('/api/history/', { params });
