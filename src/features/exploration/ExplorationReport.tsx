import type { Destination, ExplorationResult } from '../../game';
import { explorationScience } from '../../game';
import { useI18n } from '../../i18n';
import { SceneScreen, SCENE_BACKGROUNDS } from '../earth/screens/SceneScreen';
import { formatMinutes } from './explorationEngine';
import { findingImage, MARKERS, UI } from './explorationAssets';
import { AssetImage } from './AssetImage';

const KIND_MARKER = {
  SAMPLE: MARKERS.sample,
  VIEWPOINT: MARKERS.viewpoint,
  MISSION_TRACE: MARKERS.trace,
  NASA_CURIOSITY: MARKERS.curiosity,
} as const;

interface ExplorationReportProps {
  readonly result: ExplorationResult;
  readonly destination: Destination;
  readonly clock: string;
  readonly onContinue: () => void;
}

/** Informe de la salida: antes y después de cada barra, hallazgos y puntos. */
export function ExplorationReport({ result, destination, clock, onContinue }: ExplorationReportProps) {
  const { t } = useI18n();
  const pieces = result.findings.reduce((total, finding) => total + finding.pieces, 0);
  const science = explorationScience(result.points);
  const rows = [
    { key: 'missionControl.energy', before: result.before.energy, after: result.after.energy },
    { key: 'missionControl.oxygen', before: result.before.oxygen, after: result.after.oxygen },
    { key: 'missionControl.shield', before: result.before.shield, after: result.after.shield },
  ];

  return <SceneScreen background={destination === 'MOON' ? SCENE_BACKGROUNDS.moon : SCENE_BACKGROUNDS.mars}>
    <main className="explore-report earth-card">
    <div className="explore-report__box">
      <h1>{t('exploration.report.title', { clock })}</h1>
      <p>
        <strong>{t('exploration.report.how')}</strong>{' '}
        {result.mode === 'ROVER'
          ? t('exploration.report.inRover', { battery: result.batteryAllocated })
          : t('exploration.report.onFoot')}
        {' · '}<strong>{t('exploration.report.time')}</strong> {formatMinutes(result.minutes)}
        {' · '}<strong>{t('exploration.report.distance')}</strong> {result.distanceMeters} m
      </p>

      {result.rescued
        ? <div className="explore-report__banner explore-report__banner--rescue" role="status">
          <AssetImage src={MARKERS.beacon} className="explore-report__icon" />
          <strong>{t('exploration.report.rescuedTitle')}</strong> {t('exploration.report.rescuedText')}
        </div>
        : <div className="explore-report__banner explore-report__banner--ok" role="status">
          <strong>{t('exploration.report.returnedTitle')}</strong>
          {result.mode === 'ROVER' && result.batteryReturned > 0
            && <> <AssetImage src={UI.battery[result.batteryAllocated]} className="explore-report__icon" />{t('exploration.report.returnedBattery', { amount: result.batteryReturned })}</>}
        </div>}

      <h2>{t('exploration.report.resources')}</h2>
      {/* Solo «Antes» y «Después»: sin columna de cambio (decisión de JD). */}
      <table>
        <thead><tr>
          <th>{t('exploration.report.resource')}</th>
          <th>{t('exploration.report.before')}</th>
          <th>{t('exploration.report.after')}</th>
        </tr></thead>
        <tbody>{rows.map((row) => <tr key={row.key}>
          <td>{t(row.key)}</td><td>{row.before}</td><td>{row.after}</td>
        </tr>)}</tbody>
      </table>

      <h2>{t('exploration.report.findings', { pieces, places: result.findings.length })}</h2>
      {result.findings.length === 0
        ? <p>{t('exploration.report.noFindings')}</p>
        : <table>
          <thead><tr>
            <th>{t('exploration.report.finding')}</th>
            <th>{t('exploration.report.kind')}</th>
            <th>{t('exploration.report.whatIs')}</th>
            <th>{t('exploration.report.points')}</th>
          </tr></thead>
          <tbody>{result.findings.map((finding) => {
            const key = `exploration.collections.${destination}.${finding.index}`;
            return <tr key={finding.index}>
              <td>
                <span className="explore-report__finding">
                  <AssetImage src={findingImage(destination, finding.index)} className="explore-report__thumb" />
                  <span>{t(`${key}.name`)}{finding.pieces > 1 ? ` ×${finding.pieces}` : ''}</span>
                </span>
              </td>
              <td>
                <span className="explore-report__finding">
                  <AssetImage src={KIND_MARKER[finding.kind]} className="explore-report__icon" />
                  <span>{t(`exploration.kinds.${finding.kind}`)}</span>
                </span>
              </td>
              <td>{t(`${key}.text`)}</td>
              <td>{finding.points}</td>
            </tr>;
          })}</tbody>
        </table>}

      <p className="explore-report__score">
        <AssetImage src={UI.scienceBadge} className="explore-report__badge" />
        <strong>{t('exploration.report.scoreGained')}</strong> +{result.points}
        {science > 0 && <small> · {t('exploration.report.scienceAdded', { amount: science })}</small>}
      </p>
      <button type="button" className="pixel-button pixel-button--primary" autoFocus onClick={onContinue}>
        {t('exploration.report.continue')}
      </button>
    </div>
    </main>
  </SceneScreen>;
}
