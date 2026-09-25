export type GameModeId = 'boceto' | 'ejercicio' | 'estudio' | 'concierto';

export interface GameMode {
  readonly id: GameModeId;
  readonly label: string;
  readonly tagline: string;
  readonly innocentSteps: number;
  readonly punishableSteps: number;
  readonly fireThreshold: number;
  readonly punishmentPenalty: number;
  readonly minutes: number;
}

export const GAME_MODE_ORDER: readonly GameModeId[] = [
  'boceto',
  'ejercicio',
  'estudio',
  'concierto',
];

export const GAME_MODES: Record<GameModeId, GameMode> = {
  boceto: {
    id: 'boceto',
    label: 'Boceto',
    tagline: 'Calienta sin miedo: 6 fragmentos, un fallo = un bloqueo.',
    innocentSteps: 3,
    punishableSteps: 3,
    fireThreshold: 3,
    punishmentPenalty: 1,
    minutes: 2,
  },
  ejercicio: {
    id: 'ejercicio',
    label: 'Ejercicio',
    tagline: 'La sesión diaria: 10 fragmentos con zona de riesgo real.',
    innocentSteps: 5,
    punishableSteps: 5,
    fireThreshold: 5,
    punishmentPenalty: 1,
    minutes: 4,
  },
  estudio: {
    id: 'estudio',
    label: 'Estudio',
    tagline: 'Trabajo serio: 20 fragmentos sin mirar atrás.',
    innocentSteps: 10,
    punishableSteps: 10,
    fireThreshold: 10,
    punishmentPenalty: 1,
    minutes: 8,
  },
  concierto: {
    id: 'concierto',
    label: 'Concierto',
    tagline: 'Sin red: 40 fragmentos y cada fallo en riesgo suma 2 bloqueos.',
    innocentSteps: 20,
    punishableSteps: 20,
    fireThreshold: 20,
    punishmentPenalty: 2,
    minutes: 15,
  },
};

export const DEFAULT_MODE: GameModeId = 'ejercicio';

export const GAME_CONFIG = {
  feedbackDurationMs: 2000,
  fireDelayMs: 2000,
  defaultMode: DEFAULT_MODE,
  initialInnocentSteps: GAME_MODES.ejercicio.innocentSteps,
  initialPunishableSteps: GAME_MODES.ejercicio.punishableSteps,
  fireThreshold: GAME_MODES.ejercicio.fireThreshold,
} as const;
