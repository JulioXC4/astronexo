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
    object('circuitStraight', 'circuit-straight.png', 'Conexión recta'),
    object('circuitCorner', 'circuit-corner.png', 'Conexión en esquina'),
    object('circuitJunction', 'circuit-junction.png', 'Unión de circuito'),
    object('batteryBank', 'solar-battery-bank.png', 'Banco de baterías solares'),
  ],
  G2: [
    object('dusty', 'solar-panel-dusty.png', 'Panel con polvo'),
    object('clean', 'solar-panel-operational.png', 'Panel limpio'),
    object('cleaner', 'solar-cleaner-cartridge.png', 'Cartucho limpiador solar'),
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
    object('waterReservoir', 'eclss-water-reservoir.png', 'Depósito de agua ECLSS'),
    object('powerUnit', 'eclss-power-unit.png', 'Fuente eléctrica ECLSS'),
    object('electrolyzer', 'eclss-electrolyzer.png', 'Equipo de electrólisis'),
  ],
  G5: [
    object('regolith', 'refuge-regolith-blocks.png', 'Bloques de regolito'),
    object('openHatch', 'refuge-hatch-open.png', 'Compuerta abierta'),
    object('closedHatch', 'refuge-hatch-closed.png', 'Compuerta cerrada'),
    object('protected', 'refuge-protected-structure.png', 'Refugio protegido'),
    object('supplyCrate', 'supply-crate-full.png', 'Contenedor de suministros'),
  ],
  G6: [
    object('terminal', 'science-terminal.png', 'Terminal científica'),
    object('researchDevice', 'science-research-device.png', 'Dispositivo de investigación'),
    object('sampleBasalt', 'sample-basalt.png', 'Muestra de basalto'),
    object('sampleAnorthosite', 'sample-anorthosite.png', 'Muestra de anortosita'),
    object('sampleRegolith', 'sample-regolith.png', 'Muestra de regolito'),
    object('sampleMarsSedimentary', 'sample-mars-sedimentary.png', 'Muestra sedimentaria marciana'),
    object('instrumentAnalyzer', 'instrument-mineral-analyzer.png', 'Analizador mineral'),
    object('instrumentMagnifier', 'instrument-magnifier.png', 'Lupa de laboratorio'),
    object('instrumentGrainImager', 'instrument-grain-imager.png', 'Cámara de granos'),
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
