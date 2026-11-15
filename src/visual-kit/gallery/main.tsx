import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { getMissionsForCity, type MissionType } from '../../data/missions';
import { EarthBaseScene } from '../EarthBaseScene';
import { SolarCircuitVisual, StormShelterVisual } from '../TrainingVisuals';
import { CharacterPortrait } from '../CharacterPortrait';
import './gallery.css';

function Gallery() {
  const [cityId, setCityId] = useState('AREQUIPA');
  const [selected, setSelected] = useState<MissionType>('SOLAR_DETECTIVE');
  const [completed, setCompleted] = useState<MissionType[]>([]);
  const [trainingActive, setTrainingActive] = useState(false);
  const missions = getMissionsForCity(cityId);
  const active = missions.find((mission) => mission.id === selected) ?? missions[0];
  return <main className="base-gallery">
    <header><a href="/">← Volver al juego</a><h1>Centro espacial terrestre</h1><p>Escena SVG original conectada al mapa de preparación. Prueba las dos ciudades y los estados de cada instalación.</p></header>
    <div className="base-gallery__controls">
      <button type="button" aria-pressed={cityId === 'AREQUIPA'} onClick={() => { setCityId('AREQUIPA'); setSelected('SOLAR_DETECTIVE'); setCompleted([]); }}>Arequipa</button>
      <button type="button" aria-pressed={cityId === 'TROMSO'} onClick={() => { setCityId('TROMSO'); setSelected('DARK_MONTHS_RESERVE'); setCompleted([]); }}>Tromsø</button>
      <button type="button" onClick={() => setCompleted(completed.includes(active.id) ? completed.filter(id => id !== active.id) : [...completed, active.id])}>Alternar completada</button>
      <button type="button" onClick={() => setCompleted(missions.slice(0, 3).map(mission => mission.id))}>Mostrar bloqueadas</button>
      <button type="button" onClick={() => setCompleted([])}>Restablecer</button>
    </div>
    <EarthBaseScene cityId={cityId} missions={missions} selectedMissionId={active.id} completedMissions={completed} missionLimitReached={completed.length >= 3} onSelectMission={setSelected} onOpenMission={mission => setSelected(mission.id)}/>
    <aside><h2>{active.facilityName}</h2><p>{active.name}</p><p><strong>Herramienta:</strong> {active.toolLabel}</p><p><strong>Efecto:</strong> {active.effectOnSpaceMission}</p><p><strong>Estado:</strong> {completed.includes(active.id) ? 'Completada' : completed.length >= 3 ? 'Bloqueada' : 'Disponible'}</p></aside>
    <section className="base-gallery__training"><h2>Escenas de entrenamiento</h2><button type="button" aria-pressed={trainingActive} onClick={() => setTrainingActive(!trainingActive)}>{trainingActive ? 'Mostrar espera' : 'Activar escenas'}</button><div className="base-gallery__training-grid"><div><h3>Detective del Sol</h3><SolarCircuitVisual panelActive={trainingActive} switchOn={trainingActive} charge={trainingActive ? 84 : 18} circuitComplete={trainingActive}/></div><div><h3>Mirador de tormentas</h3><StormShelterVisual alert={trainingActive} doorClosed={trainingActive} crewSafe={trainingActive}/></div></div></section>
    <section className="base-gallery__characters"><h2>Retratos temporales originales</h2><p>Figuras neutras hasta recibir los PNG transparentes con identidades confirmadas.</p><div><CharacterPortrait/><CharacterPortrait selected mood="celebrate"/><CharacterPortrait kind="robot" mood="alert"/></div></section>
  </main>;
}

createRoot(document.getElementById('visual-gallery-root')!).render(<Gallery/>);
