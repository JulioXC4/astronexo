/** Primer guion de Primera Luz. Eventos y efectos se conectarán al motor puro. */
export const moonMission = {
  id: 'FIRST_LIGHT',
  destination: 'MOON',
  maxTurns: 5,
  turns: [
    { turn: 1, objective: 'Repartir electricidad durante el arranque de la base.' },
    { turn: 2, objective: 'Priorizar una fuga de aire y una oportunidad científica simultáneas.' },
    { turn: 3, objective: 'Preparar el refugio ante un evento espacial histórico verificado.' },
    { turn: 4, objective: 'Priorizar soporte vital frente a cultivos e investigación.' },
    { turn: 5, objective: 'Cerrar la misión con sistemas vitales seguros y progreso científico.' },
  ],
} as const;
