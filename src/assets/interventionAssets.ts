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
    object('damaged', 'solar-panel-damaged.webp', 'Panel dañado'),
    object('repairPart', 'solar-panel-repair-part.webp', 'Pieza de reparación'),
    object('repaired', 'solar-panel-operational.webp', 'Panel reparado'),
    object('circuitStraight', 'circuit-straight.webp', 'Conexión recta'),
    object('circuitCorner', 'circuit-corner.webp', 'Conexión en esquina'),
    object('circuitJunction', 'circuit-junction.webp', 'Unión de circuito'),
    object('batteryBank', 'solar-battery-bank.webp', 'Banco de baterías solares'),
  ],
  G2: [
    object('dusty', 'solar-panel-dusty.webp', 'Panel con polvo'),
    object('clean', 'solar-panel-operational.webp', 'Panel limpio'),
    object('cleaner', 'solar-cleaner-cartridge.webp', 'Cartucho limpiador solar'),
  ],
  G3: [
    object('leakingPipe', 'oxygen-pipe-leaking.webp', 'Tubería con fuga'),
    object('patch', 'oxygen-patch.webp', 'Parche de oxígeno'),
    object('intactPipe', 'oxygen-pipe-intact.webp', 'Tubería intacta'),
  ],
  G4: [
    object('tank', 'oxygen-tank.webp', 'Tanque de oxígeno'),
    object('supportPipe', 'oxygen-pipe-intact.webp', 'Circuito de soporte vital'),
    object('supportPatch', 'oxygen-patch.webp', 'Elemento de sellado'),
    object('waterReservoir', 'eclss-water-reservoir.webp', 'Depósito de agua ECLSS'),
    object('powerUnit', 'eclss-power-unit.webp', 'Fuente eléctrica ECLSS'),
    object('electrolyzer', 'eclss-electrolyzer.webp', 'Equipo de electrólisis'),
  ],
  G5: [
    object('regolith', 'refuge-regolith-blocks.webp', 'Bloques de regolito'),
    object('openHatch', 'refuge-hatch-open.webp', 'Compuerta abierta'),
    object('closedHatch', 'refuge-hatch-closed.webp', 'Compuerta cerrada'),
    object('protected', 'refuge-protected-structure.webp', 'Refugio protegido'),
    object('supplyCrate', 'supply-crate-full.webp', 'Contenedor de suministros'),
  ],
  G6: [
    object('terminal', 'science-terminal.webp', 'Terminal científica'),
    object('researchDevice', 'science-research-device.webp', 'Dispositivo de investigación'),
    object('sampleBasalt', 'sample-basalt.webp', 'Muestra de basalto'),
    object('sampleAnorthosite', 'sample-anorthosite.webp', 'Muestra de anortosita'),
    object('sampleRegolith', 'sample-regolith.webp', 'Muestra de regolito'),
    object('sampleMarsSedimentary', 'sample-mars-sedimentary.webp', 'Muestra sedimentaria marciana'),
    object('instrumentAnalyzer', 'instrument-mineral-analyzer.webp', 'Analizador mineral'),
    object('instrumentMagnifier', 'instrument-magnifier.webp', 'Lupa de laboratorio'),
    object('instrumentGrainImager', 'instrument-grain-imager.webp', 'Cámara de granos'),
  ],
  G7: [
    object('emptyTray', 'greenhouse-tray-empty.webp', 'Bandeja vacía'),
    object('plantedTray', 'greenhouse-tray-planted.webp', 'Bandeja plantada'),
    object('lightsOff', 'greenhouse-led-off.webp', 'Lámparas apagadas'),
    object('lightsOn', 'greenhouse-led-on.webp', 'Lámparas encendidas'),
  ],
  G8: [
    object('antenna', 'science-earth-antenna.webp', 'Antena terrestre'),
    object('pendingResponse', 'science-pending-response.webp', 'Respuesta pendiente'),
  ],
};
