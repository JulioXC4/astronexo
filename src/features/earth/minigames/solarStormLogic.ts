export type StormPhase = 'briefing' | 'preparation' | 'impact' | 'result';
export type StormStation = 'alarm' | 'hatch' | 'telemetry';
export type StormAction = 'start' | 'modeIntro' | 'modeNormal' | 'alarm' | 'crewA' | 'crewB' | 'blockedA' | 'blockedB' | 'backup' | 'hatch' | 'packet' | 'telemetry' | 'impact' | 'resolve' | 'undo' | 'reset';
export type StormSnapshot = Pick<StormState, 'actions' | 'alarm' | 'crewA' | 'crewB' | 'backup' | 'hatch' | 'telemetry' | 'packets' | 'feedback'>;

export interface StormState {
  phase: StormPhase;
  mode: 'intro' | 'normal';
  actions: number;
  alarm: boolean;
  crewA: boolean;
  crewB: boolean;
  backup: boolean;
  hatch: boolean;
  telemetry: boolean;
  packets: number;
  feedback: string;
  history: StormSnapshot[];
}

export function initialStormState(mode: StormState['mode'] = 'intro'): StormState {
  return { phase: 'briefing', mode, actions: mode === 'intro' ? 8 : 7, alarm: false, crewA: false, crewB: false, backup: false, hatch: false, telemetry: false, packets: 0, feedback: 'alert', history: [] };
}

export function stormFailure(state: StormState): string | null {
  if (!state.alarm) return 'noAlarm';
  if (!state.crewA || !state.crewB) return 'crewOutside';
  if (!state.backup) return 'noBackup';
  if (!state.hatch) return 'hatchOpen';
  if (!state.telemetry) return 'antennaExposed';
  return null;
}

function snapshot(state: StormState): StormSnapshot {
  const { actions, alarm, crewA, crewB, backup, hatch, telemetry, packets, feedback } = state;
  return { actions, alarm, crewA, crewB, backup, hatch, telemetry, packets, feedback };
}

function spend(state: StormState, update: Partial<StormState>, feedback: string): StormState {
  const next: StormState = { ...state, ...update, actions: state.actions - 1, feedback, history: [...state.history, snapshot(state)] };
  return next.actions === 0 ? { ...next, phase: 'impact' } : next;
}

export function stormReducer(state: StormState, action: StormAction): StormState {
  if (action === 'reset') return initialStormState(state.mode);
  if (action === 'modeIntro' && state.phase === 'briefing') return initialStormState('intro');
  if (action === 'modeNormal' && state.phase === 'briefing') return initialStormState('normal');
  if (action === 'start' && state.phase === 'briefing') return { ...state, phase: 'preparation', feedback: 'start' };
  if (action === 'resolve' && state.phase === 'impact') return { ...state, phase: 'result', feedback: stormFailure(state) ?? 'success' };
  if (action === 'undo' && state.phase === 'preparation' && state.history.length) {
    return { ...state, ...state.history[state.history.length - 1], history: state.history.slice(0, -1), feedback: 'undone' };
  }
  if (action === 'impact' && state.phase === 'preparation') return { ...state, phase: 'impact' };
  if (state.phase !== 'preparation' || state.actions <= 0) return state;

  switch (action) {
    case 'alarm': return state.alarm ? { ...state, feedback: 'alreadyOn' } : spend(state, { alarm: true }, 'alarmOn');
    case 'crewA':
    case 'crewB': {
      const crew = action === 'crewA' ? 'crewA' : 'crewB';
      if (!state.alarm) return { ...state, feedback: 'alarmFirst' };
      if (state[crew]) return { ...state, feedback: 'alreadyInside' };
      return spend(state, { [crew]: true }, 'crewMoved');
    }
    case 'blockedA':
    case 'blockedB': {
      if (!state.alarm) return { ...state, feedback: 'alarmFirst' };
      const crew = action === 'blockedA' ? 'crewA' : 'crewB';
      if (state[crew]) return { ...state, feedback: 'alreadyInside' };
      return spend(state, {}, 'blockedRoute');
    }
    case 'backup': return state.backup ? { ...state, feedback: 'alreadyReady' } : spend(state, { backup: true }, 'backupPrepared');
    case 'hatch':
      if (state.hatch) return { ...state, feedback: 'alreadyLocked' };
      if (!state.crewA || !state.crewB) return { ...state, feedback: 'crewOutside' };
      if (!state.backup) return { ...state, feedback: 'backupFirst' };
      return spend(state, { hatch: true }, 'hatchLocked');
    case 'packet':
      if (state.telemetry) return { ...state, feedback: 'antennaRetracted' };
      if (state.packets >= 2) return { ...state, feedback: 'packetsFull' };
      return spend(state, { packets: state.packets + 1 }, 'packetSaved');
    case 'telemetry': return state.telemetry ? { ...state, feedback: 'alreadyProtected' } : spend(state, { telemetry: true }, 'telemetryProtected');
    default: return state;
  }
}
