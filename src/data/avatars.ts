export interface AvatarOption {
  readonly id: string;
  readonly name: string;
  readonly roleTitle: string;
  readonly badgeColor: string;
  readonly iconSymbol: string;
  readonly description: string;
}

export const AVATAR_OPTIONS: readonly AvatarOption[] = [
  {
    id: 'ALBA',
    name: 'Cadete Alba',
    roleTitle: 'Especialista en Mando y Decisiones',
    badgeColor: '#4d72b0',
    iconSymbol: '🚀',
    description: 'Enfocada en la seguridad del equipo y el cumplimiento de objetivos.',
  },
  {
    id: 'LEO',
    name: 'Comandante Leo',
    roleTitle: 'Piloto de Exploración y Navegación',
    badgeColor: '#388e3c',
    iconSymbol: '🛰️',
    description: 'Curioso y observador, atento a los datos de telemetría y sensores.',
  },
  {
    id: 'AURORA',
    name: 'Oficial Aurora',
    roleTitle: 'Especialista en Ciencia y Clima Espacial',
    badgeColor: '#7b1fa2',
    iconSymbol: '☀️',
    description: 'Experta en análisis solar y radiación para proteger la base.',
  },
  {
    id: 'NICO',
    name: 'Ingeniero Nico',
    roleTitle: 'Especialista en Soporte Vital y Sistemas',
    badgeColor: '#e65100',
    iconSymbol: '🌱',
    description: 'Cuidadoso con los recursos vitales: aire, agua y energía.',
  },
] as const;

export const DEFAULT_AVATAR = AVATAR_OPTIONS[0];

export const SUGGESTED_CALLSIGNS: readonly string[] = [
  'Comandante Cóndor',
  'Cadete Austral',
  'Explorador/a Solar',
  'Capitana Andina',
  'Vigilante Estelar',
] as const;
