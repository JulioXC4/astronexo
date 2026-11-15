import { useState } from 'react';
import { getModuleWarnings, MODULE_CATALOG } from '../../game';
import type { MissionState, ModuleId } from '../../game';
import { exteriorModuleScenes, getModuleScene } from '../../assets/moduleScenes';
import { spaceBackgrounds } from '../../assets/manifest';
import { useI18n } from '../../i18n';

interface ModuleCamerasProps { readonly state: MissionState }
type CameraId = 'EXTERIOR' | ModuleId;

export function ModuleCameras({ state }: ModuleCamerasProps) {
  const { t } = useI18n();
  const [selectedCamera, setSelectedCamera] = useState<CameraId>('EXTERIOR');
  const warnings = new Set(getModuleWarnings(state));
  const dustStorm = state.activeAlerts.some((alert) => alert.kind === 'MARS_DUST_STORM');
  const exteriorScene = state.destination === 'MOON'
    ? (state.turn % 2 === 1 ? exteriorModuleScenes.MOON_DAY : exteriorModuleScenes.MOON_NIGHT)
    : dustStorm
      ? exteriorModuleScenes.MARS_DUST_STORM
      : spaceBackgrounds.control.MARS.path!;
  const selectedBuilt = selectedCamera === 'EXTERIOR' || state.selectedModules.includes(selectedCamera);
  const selectedWarning = selectedCamera === 'EXTERIOR'
    ? dustStorm
    : selectedBuilt && warnings.has(selectedCamera);
  const selectedStandby = selectedCamera === 'GREENHOUSE' && selectedBuilt && !state.greenhouseActive;
  const selectedStatusKey = !selectedBuilt ? 'off' : selectedWarning ? 'warning' : selectedStandby ? 'suspended' : 'active';
  const selectedScene = selectedCamera === 'EXTERIOR'
    ? exteriorScene
    : getModuleScene(state.destination, selectedCamera);
  const selectedName = selectedCamera === 'EXTERIOR'
    ? t('missionControl.exteriorCamera')
    : t(`baseBuilder.modules.${selectedCamera}.name`);

  return <section className="module-cameras" aria-labelledby="module-cameras-title">
    <div
      className={`module-camera-view module-camera-view--${selectedStatusKey}`}
      style={{ backgroundImage: `linear-gradient(180deg, rgb(2 8 19 / 5%), rgb(2 8 19 / 38%)), url('${selectedScene}')` }}
    >
      <div className="module-camera-view__topline">
        <div>
          <span>{selectedCamera === 'EXTERIOR' ? t('missionControl.exteriorFeed') : t('missionControl.cameraCode', { camera: String(MODULE_CATALOG.findIndex((module) => module.id === selectedCamera) + 2).padStart(2, '0') })}</span>
          <h2 id="module-cameras-title">{selectedName}</h2>
        </div>
        <strong className={`camera-status camera-status--${selectedStatusKey}`}>
          {t(`missionControl.moduleStatus.${selectedStatusKey}`)}
        </strong>
      </div>
      {!selectedBuilt && <div className="module-camera-view__offline">
        <strong>{t('missionControl.moduleStatus.off')}</strong>
        <span>{t('missionControl.moduleStatus.notBuilt')}</span>
      </div>}
      {selectedWarning && <div className="module-camera-view__warning" role="status">
        <span aria-hidden="true">!</span>
        <strong>{selectedCamera === 'EXTERIOR' ? t('alerts.MARS_DUST_STORM.title') : t('missionControl.moduleStatus.affected')}</strong>
      </div>}
      <div className="module-camera-view__telemetry" aria-label={t('missionControl.secondaryTelemetry')}>
        <span>{t('common.science')} <strong>{state.scienceProgress}/100</strong></span>
        <span>{t('common.food')} <strong>{state.foodSupply}/100</strong></span>
        <span>{t('common.radiation')} <strong>{state.radiationExposure}/100</strong></span>
      </div>
    </div>

    <div className="camera-selector" aria-label={t('missionControl.moduleCamerasTitle')}>
      <button
        type="button"
        className={`camera-selector__button ${selectedCamera === 'EXTERIOR' ? 'camera-selector__button--selected' : ''} ${dustStorm ? 'camera-selector__button--warning' : ''}`}
        aria-pressed={selectedCamera === 'EXTERIOR'}
        onClick={() => setSelectedCamera('EXTERIOR')}
      >
        <img src={exteriorScene} alt="" />
        <span>{t('missionControl.exteriorCamera')}</span>
        <small>{dustStorm ? t('missionControl.moduleStatus.warning') : t('common.online')}</small>
      </button>
      {MODULE_CATALOG.map((module, index) => {
        const built = state.selectedModules.includes(module.id);
        const warning = built && warnings.has(module.id);
        const standby = built && module.id === 'GREENHOUSE' && !state.greenhouseActive;
        const statusKey = !built ? 'off' : warning ? 'warning' : standby ? 'suspended' : 'active';
        const name = t(`baseBuilder.modules.${module.id}.name`);
        return <button
          type="button"
          key={module.id}
          className={`camera-selector__button camera-selector__button--${statusKey} ${selectedCamera === module.id ? 'camera-selector__button--selected' : ''}`}
          aria-label={t('missionControl.cameraAria', { camera: index + 2, name, status: t(`missionControl.moduleStatus.${statusKey}`) })}
          aria-pressed={selectedCamera === module.id}
          onClick={() => setSelectedCamera(module.id)}
        >
          <img src={getModuleScene(state.destination, module.id)} alt="" />
          <span>{name}</span>
          <small>{t(`missionControl.moduleStatus.${statusKey}`)}</small>
        </button>;
      })}
    </div>
  </section>;
}
