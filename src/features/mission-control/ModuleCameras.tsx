import { getModuleWarnings, MODULE_CATALOG } from '../../game';
import type { MissionState } from '../../game';
import { lunarModuleScenes } from '../../assets/moduleScenes';
import { useI18n } from '../../i18n';

interface ModuleCamerasProps { readonly state: MissionState }

export function ModuleCameras({ state }: ModuleCamerasProps) {
  const { t } = useI18n();
  const warnings = new Set(getModuleWarnings(state));
  return <section className="module-cameras pixel-panel" aria-labelledby="module-cameras-title">
    <div className="section-heading">
      <div><span className="pixel-kicker">{t('missionControl.moduleCamerasKicker')}</span><h2 id="module-cameras-title">{t('missionControl.moduleCamerasTitle')}</h2></div>
      <strong>{t('missionControl.modulesOnline', { count: state.selectedModules.length })}</strong>
    </div>
    <div className="module-camera-grid">
      {MODULE_CATALOG.map((module, index) => {
        const built = state.selectedModules.includes(module.id);
        const warning = built && warnings.has(module.id);
        const standby = built && module.id === 'GREENHOUSE' && !state.greenhouseActive;
        const statusKey = !built ? 'off' : warning ? 'warning' : standby ? 'suspended' : 'active';
        const statusClass = !built ? 'apagado' : warning ? 'advertencia' : standby ? 'suspendido' : 'activo';
        const status = t(`missionControl.moduleStatus.${statusKey}`);
        const moduleName = t(`baseBuilder.modules.${module.id}.name`);
        return <article
          key={module.id}
          className={`module-camera module-camera--${statusClass}`}
          aria-label={t('missionControl.cameraAria', { camera: index + 2, name: moduleName, status })}
        >
          <div className={`module-camera__feed ${state.destination === 'MARS' ? 'module-camera__feed--mars' : ''}`} style={state.destination === 'MOON' ? { backgroundImage: `linear-gradient(#06132125, #06132150), url('${lunarModuleScenes[module.id]}')` } : undefined} aria-hidden="true">
            {state.destination === 'MARS' && <><span>{module.icon}</span><b>{t('missionControl.marsSignal')}</b></>}
            <i>{t('missionControl.cameraCode', { camera: String(index + 2).padStart(2, '0') })}</i>
          </div>
          <h3>{moduleName}</h3>
          <strong>{status}</strong>
          <small>{!built
            ? t('missionControl.moduleStatus.notBuilt')
            : warning
              ? t('missionControl.moduleStatus.affected')
              : standby
                ? t('missionControl.moduleStatus.standby')
                : t(`baseBuilder.modules.${module.id}.benefit`)}</small>
        </article>;
      })}
    </div>
  </section>;
}
