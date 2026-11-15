import type { InterventionId } from '../game';

export interface InterventionAsset {
  readonly role: string;
  readonly path: string;
  readonly fallbackLabel: string;
}

const object = (role: string, file: string, fallbackLabel: string): InterventionAsset => ({
  role,
  path: `/assets/space/objects/${file}`,
  fallbackLabel,
});

/** Typed visual inventory for G1–G8. Mechanics continue to live in the game engine. */
export const interventionAssets: Readonly<Record<InterventionId, readonly InterventionAsset[]>> = {
  G1: [
    object('damaged', 'solar-panel-damaged.png', 'Panel dañado'),
    object('repairPart', 'solar-panel-repair-part.png', 'Pieza de reparación'),
    object('repaired', 'solar-panel-operational.png', 'Panel reparado'),
  ],
  G2: [
    object('dusty', 'solar-panel-dusty.png', 'Panel con polvo'),
    object('clean', 'solar-panel-operational.png', 'Panel limpio'),
  ],
  G3: [
    object('leakingPipe', 'oxygen-pipe-leaking.png', 'Tubería con fuga'),
    object('patch', 'oxygen-patch.png', 'Parche de oxígeno'),
    object('intactPipe', 'oxygen-pipe-intact.png', 'Tubería intacta'),
  ],
  G4: [
    object('tank', 'oxygen-tank.png', 'Tanque de oxígeno'),
    object('supportPipe', 'oxygen-pipe-intact.png', 'Circuito de soporte vital'),
    object('supportPatch', 'oxygen-patch.png', 'Elemento de sellado'),
  ],
  G5: [
    object('regolith', 'refuge-regolith-blocks.png', 'Bloques de regolito'),
    object('openHatch', 'refuge-hatch-open.png', 'Compuerta abierta'),
    object('closedHatch', 'refuge-hatch-closed.png', 'Compuerta cerrada'),
    object('protected', 'refuge-protected-structure.png', 'Refugio protegido'),
  ],
  G6: [
    object('terminal', 'science-terminal.png', 'Terminal científica'),
    object('researchDevice', 'science-research-device.png', 'Dispositivo de investigación'),
  ],
  G7: [
    object('emptyTray', 'greenhouse-tray-empty.png', 'Bandeja vacía'),
    object('plantedTray', 'greenhouse-tray-planted.png', 'Bandeja plantada'),
    object('lightsOff', 'greenhouse-led-off.png', 'Lámparas apagadas'),
    object('lightsOn', 'greenhouse-led-on.png', 'Lámparas encendidas'),
  ],
  G8: [
    object('antenna', 'science-earth-antenna.png', 'Antena terrestre'),
    object('pendingResponse', 'science-pending-response.png', 'Respuesta pendiente'),
  ],
};
