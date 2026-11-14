import type { SpaceGameProps } from '../../game/contracts';

export function SpaceGame({ setup, nasaData, onFinish }: SpaceGameProps) {
  return <main className="panel">
    <p className="eyebrow">Prueba de integración · Espacio</p>
    <h1>Entrega recibida</h1>
    <p>Destino: {setup.destination === 'MOON' ? 'Luna' : 'Marte (próximamente)'} · Ciudad: {setup.cityId} · Herramientas: {setup.backpack.join(', ')}</p>
    <p>Datos NASA: {nasaData.validation === 'PENDING' ? 'pendientes de validación' : `${nasaData.observations.length} observaciones verificadas`}.</p>
    <p>La guardia lunar, sus alertas y su motor todavía no están implementados.</p>
    <button onClick={() => onFinish({
      outcome: 'NOT_PLAYED',
      destination: setup.destination,
      finalState: null,
      explanation: 'Solo se comprobó el intercambio de datos entre módulos; no se jugó una misión.',
      evidence: nasaData.observations,
    })}>Devolver resultado de prueba a App</button>
  </main>;
}
