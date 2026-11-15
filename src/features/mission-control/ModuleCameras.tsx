import { getModuleWarnings, MODULE_CATALOG } from '../../game';
import type { MissionState } from '../../game';
import { lunarModuleScenes } from '../../assets/moduleScenes';

interface ModuleCamerasProps { readonly state: MissionState }

export function ModuleCameras({ state }: ModuleCamerasProps) {
  const warnings = new Set(getModuleWarnings(state));
  return <section className="module-cameras pixel-panel" aria-labelledby="module-cameras-title">
    <div className="section-heading">
      <div><span className="pixel-kicker">CÁMARAS 02–06</span><h2 id="module-cameras-title">Módulos de la base</h2></div>
      <strong>{state.selectedModules.length}/5 EN LÍNEA</strong>
    </div>
    <div className="module-camera-grid">
      {MODULE_CATALOG.map((module, index) => {
        const built = state.selectedModules.includes(module.id);
        const warning = built && warnings.has(module.id);
        const standby = built && module.id === 'GREENHOUSE' && !state.greenhouseActive;
        const status = !built ? 'APAGADO' : warning ? 'ADVERTENCIA' : standby ? 'SUSPENDIDO' : 'ACTIVO';
        return <article
          key={module.id}
          className={`module-camera module-camera--${status.toLowerCase()}`}
          aria-label={`Cámara ${index + 2}, ${module.name}: ${status}`}
        >
          <div className={`module-camera__feed ${state.destination === 'MARS' ? 'module-camera__feed--mars' : ''}`} style={state.destination === 'MOON' ? { backgroundImage: `linear-gradient(#06132125, #06132150), url('${lunarModuleScenes[module.id]}')` } : undefined} aria-hidden="true">
            {state.destination === 'MARS' && <><span>{module.icon}</span><b>SEÑAL MARTE</b></>}
            <i>CAM {String(index + 2).padStart(2, '0')}</i>
          </div>
          <h3>{module.name}</h3>
          <strong>{status}</strong>
          <small>{!built ? 'No construido' : warning ? 'Una alerta afecta este sistema' : standby ? 'Sin consumo ni producción' : module.benefit}</small>
        </article>;
      })}
    </div>
  </section>;
}
