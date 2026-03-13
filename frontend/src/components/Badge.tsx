import React from 'react';

type BadgeVariant =
  | 'easy' | 'medium' | 'hard'
  | 'high' | 'low' | 'blind'
  | 'own' | 'partial' | 'hint' | 'failed'
  | 'neutral';

interface BadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
}

export default function Badge({ variant, children }: BadgeProps) {
  return <span className={`badge badge-${variant}`}>{children}</span>;
}

export function difficultyBadge(difficulty: string) {
  return <Badge variant={difficulty.toLowerCase() as BadgeVariant}>{difficulty}</Badge>;
}

export function confidenceBadge(confidence: string) {
  const label = confidence === 'MEDIUM' ? 'MED' : confidence;
  return <Badge variant={confidence.toLowerCase() as BadgeVariant}>{label}</Badge>;
}

export function statusBadge(status: string) {
  return <Badge variant={status.toLowerCase() as BadgeVariant}>{status}</Badge>;
}
