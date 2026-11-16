import { useEffect, useRef } from 'react';
import type { Destination, MissionState } from '../../game';
import {
  playSound, returnVideoFor, useAudioScene, warmVideo,
  type AudioScene, type SoundId,
} from '../audio';
import { isImportantAlert } from '../space-minigames';

/** Qué se está viendo en la guardia: decide música y ambiente. */
export type GuardAudioView = 'builder' | 'play' | 'between' | 'exploration' | 'result';

/** Efectos de la guardia que conviene tener descargados antes del primer turno. */
const GUARD_PRELOAD: readonly SoundId[] = [
  'guardAlertIncoming', 'guardTurnPassed', 'hiddenStar', 'reward', 'success', 'error', 'radio',
];

/**
 * Música y efectos de la guardia espacial (solo y cooperativa comparten esta lógica):
 * - Base lunar o marciana durante la guardia; música de alerta solo con una alerta importante
 *   sin atender (nunca por un simple cronómetro de interfaz).
 * - Ambiente de viento marciano o silencio lunar durante la exploración.
 * - Fanfarria de victoria una vez y luego música de resultado en el informe.
 */
export function useGuardAudio(state: MissionState | null, destination: Destination, view: GuardAudioView) {
  const base = destination === 'MARS' ? 'baseMars' : 'baseMoon';
  const important = view === 'play' && state !== null && !state.actionTakenThisTurn
    && state.activeAlerts.some(isImportantAlert);
  const completed = state?.outcome === 'COMPLETED';

  let scene: AudioScene;
  switch (view) {
    case 'builder': scene = { music: 'builder' }; break;
    case 'result': scene = { music: 'result', intro: completed ? 'victory' : undefined }; break;
    case 'exploration': scene = { music: base, ambient: destination === 'MARS' ? 'marsWind' : 'lunarSilence' }; break;
    default: scene = { music: important ? 'guardAlert' : base, preload: GUARD_PRELOAD };
  }
  useAudioScene(scene);

  // «Alerta entrante»: una vez por alerta nueva, cuando el jugador ya está en la consola.
  const seenAlerts = useRef<Set<string>>(new Set());
  const alerts = state?.activeAlerts;
  useEffect(() => {
    if (view !== 'play' || !alerts) return;
    const fresh = alerts.filter((alert) => !seenAlerts.current.has(alert.id));
    if (fresh.length === 0) return;
    for (const alert of fresh) seenAlerts.current.add(alert.id);
    playSound('guardAlertIncoming');
  }, [view, alerts]);

  // El informe se acerca al regreso: se avisa al navegador del video de vuelta a casa.
  const city = state?.setup.city;
  useEffect(() => {
    if (view === 'result' && city) warmVideo(returnVideoFor(city));
  }, [view, city]);
}
