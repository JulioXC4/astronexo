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
      <div><span className="pixel-kicker">{t('missionControl.moduleCamerasKicker')}</span><h2 id="module-cameras-title">{t('missionControl.modulesTitle')}</h2></div>
      <strong>{t('missionControl.modulesOnline', { count: state.selectedModules.length, total: MODULE_CATALOG.length })}</strong>
    </div>
    <div className="module-camera-grid">
      {MODULE_CATALOG.map((module, index) => {
        const built = state.selectedModules.includes(module.id);
        const warning = built && warnings.has(module.id);
        const standby = built && module.id === 'GREENHOUSE' && !state.greenhouseActive;
        const statusKey = !built ? 'off' : warning ? 'warning' : standby ? 'suspended' : 'active';
        const status = t(`missionControl.moduleStatus.${statusKey}`);
        const moduleCopy = `baseBuilder.catalog.${module.id}`;
        return <article
          key={module.id}
          className={`module-camera module-camera--${statusKey}`}
          aria-label={t('missionControl.moduleCameraAria', { camera: index + 2, name: t(`${moduleCopy}.name`), status })}
        >
          <div className={`module-camera__feed ${state.destination === 'MARS' ? 'module-camera__feed--mars' : ''}`} style={state.destination === 'MOON' ? { backgroundImage: `linear-gradient(#06132125, #06132150), url('${lunarModuleScenes[module.id]}')` } : undefined} aria-hidden="true">
            {state.destination === 'MARS' && <><span>{module.icon}</span><b>{t('missionControl.marsSignal')}</b></>}
            <i>CAM {String(index + 2).padStart(2, '0')}</i>
          </div>
          <h3>{t(`${moduleCopy}.name`)}</h3>
          <strong>{status}</strong>
          <small>{!built
            ? t('missionControl.moduleNotBuilt')
            : warning
              ? t('missionControl.moduleAffected')
              : standby
                ? t('missionControl.modulePaused')
                : t(`${moduleCopy}.benefit`)}</small>
        </article>;
      })}
    </div>
  </section>;
}
