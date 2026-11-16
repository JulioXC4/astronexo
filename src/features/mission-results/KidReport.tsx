import {
  ArrowRight, CheckCircle, Flask, Lightbulb, Medal, Rocket, ShieldCheck, Star, ThumbsUp, Wrench,
} from '@phosphor-icons/react';
import { resourceLevel, SCIENCE_TARGET } from '../../game';
import type { MissionResult } from '../../game';
import { hudAssets } from '../../assets/manifest';
import { useI18n, resolveMessage } from '../../i18n';
import { alertTips, earnedMedals, resourceRanOut, starsFor } from './kidReportRules';

export { starsFor } from './kidReportRules';

export function StarRow({ count, size = 'big' }: { readonly count: number; readonly size?: 'big' | 'small' }) {
  const { t } = useI18n();
  return <div className={`kid-stars kid-stars--${size}`} role="img" aria-label={t('kidReport.starsLabel', { count })}>
    {[1, 2, 3].map((index) => <Star key={index} weight="fill" className={index <= count ? 'is-on' : ''} aria-hidden="true" />)}
  </div>;
}

const RESOURCES = [
  { key: 'energy', tone: 'energy', labelKey: 'missionControl.energy' },
  { key: 'oxygen', tone: 'oxygen', labelKey: 'missionControl.oxygen' },
  { key: 'shield', tone: 'shield', labelKey: 'missionControl.shield' },
  { key: 'foodSupply', tone: 'food', labelKey: 'missionControl.food' },
] as const;

interface KidReportProps {
  readonly result: MissionResult;
}

/**
 * Informe para niños: pocas palabras, mucho dibujo. Estrellas, cómo quedó cada barra con una
 * cara que se entiende sin leer números, lo que hizo bien, un consejo para la próxima, las
 * medallas ganadas y cómo le ayudó lo que entrenó en la Tierra (el objetivo del reto).
 */
export function KidReport({ result }: KidReportProps) {
  const { t } = useI18n();
  const r = (text: string) => resolveMessage(text, t);
  const { finalState } = result;
  const stars = starsFor(result);
  const science = finalState.scienceProgress;
  const scienceMissing = Math.max(0, SCIENCE_TARGET - science);

  const goods = result.helpfulDecisions.slice(0, 3);
  const tips = alertTips(finalState.unresolvedEvents);

  const earned = earnedMedals(result);
  const medals = [
    { id: 'crew', icon: <ShieldCheck weight="fill" />, earned: earned.crew },
    { id: 'science', icon: <Flask weight="fill" />, earned: earned.science },
    { id: 'keeper', icon: <Medal weight="fill" />, earned: earned.keeper },
    { id: 'explorer', icon: <Rocket weight="fill" />, earned: earned.explorer },
  ] as const;
  const tools = [...new Set(result.relevantTools)];

  return <div className="kid-report">
    <header className="kid-report__head">
      <StarRow count={stars} />
      <div>
        <span className="kid-report__kicker">{t('kidReport.kicker')}</span>
        <h1>{t('kidReport.title')}</h1>
        <p>{t(`kidReport.starLine${stars}`)}</p>
      </div>
    </header>

    {/* ¿Cómo quedó tu base? Cuatro barras con su dibujo y una cara: bien / bajo / peligro. */}
    <section className="kid-card kid-card--base" aria-labelledby="kid-base-title">
      <h2 id="kid-base-title">{t('kidReport.baseTitle')}</h2>
      <div className="kid-base">
        {RESOURCES.map(({ key, tone, labelKey }) => {
          const value = finalState[key];
          const level = resourceLevel(value);
          return <div key={key} className={`kid-meter kid-meter--${level}`}>
            {hudAssets[tone].path && <img src={hudAssets[tone].path ?? undefined} alt="" aria-hidden="true" />}
            <strong>{t(labelKey)}</strong>
            <span className="kid-meter__value">{value}</span>
            <span className="kid-meter__bar" aria-hidden="true"><span style={{ width: `${Math.max(3, Math.min(100, value))}%` }} /></span>
            <em>{t(`kidReport.level.${level}`)}</em>
          </div>;
        })}
      </div>
    </section>

    {/* La meta científica, como una barra que se llena hasta la bandera. */}
    <section className={`kid-card kid-science${result.scientificObjectiveAchieved ? ' is-done' : ''}`} aria-labelledby="kid-science-title">
      <Flask className="kid-science__icon" weight="fill" aria-hidden="true" />
      <div>
        <h2 id="kid-science-title">{t('kidReport.scienceTitle')}</h2>
        <div className="kid-science__bar" role="progressbar" aria-valuemin={0} aria-valuemax={SCIENCE_TARGET} aria-valuenow={Math.min(science, SCIENCE_TARGET)}>
          <span style={{ width: `${Math.min(100, (science / SCIENCE_TARGET) * 100)}%` }} />
          <b>{science}/{SCIENCE_TARGET}</b>
        </div>
        <p>{result.scientificObjectiveAchieved ? t('kidReport.scienceDone') : t('kidReport.scienceMissing', { missing: scienceMissing })}</p>
      </div>
    </section>

    <div className="kid-columns">
      <section className="kid-card kid-list kid-list--good" aria-labelledby="kid-good-title">
        <h2 id="kid-good-title"><ThumbsUp weight="fill" aria-hidden="true" />{t('kidReport.goodTitle')}</h2>
        {goods.length
          ? <ul>{goods.map((item, index) => <li key={`${item}-${index}`}><CheckCircle weight="fill" aria-hidden="true" />{r(item)}</li>)}</ul>
          : <p>{t('kidReport.goodEmpty')}</p>}
      </section>
      <section className="kid-card kid-list kid-list--tip" aria-labelledby="kid-tip-title">
        <h2 id="kid-tip-title"><Lightbulb weight="fill" aria-hidden="true" />{t('kidReport.tipTitle')}</h2>
        <ul>
          {tips.map((tip) => <li key={tip.kind}><ArrowRight weight="bold" aria-hidden="true" />
            {t('kidReport.tipAlert', { alert: t(`alerts.${tip.kind}.title`), lost: tip.lost, resource: t(tip.resourceLabelKey).toLowerCase() })}
          </li>)}
          <li><ArrowRight weight="bold" aria-hidden="true" />{t(resourceRanOut(finalState) ? 'kidReport.tipInterrupted' : result.scientificObjectiveAchieved ? 'kidReport.tipWin' : 'kidReport.tipScience')}</li>
        </ul>
      </section>
    </div>

    <section className="kid-card" aria-labelledby="kid-medals-title">
      <h2 id="kid-medals-title">{t('kidReport.medalsTitle')}</h2>
      <ul className="kid-medals">
        {medals.map((medal) => <li key={medal.id} className={medal.earned ? 'is-earned' : ''}>
          <span className="kid-medals__icon" aria-hidden="true">{medal.icon}</span>
          <strong>{t(`kidReport.medals.${medal.id}.name`)}</strong>
          <small>{medal.earned ? t(`kidReport.medals.${medal.id}.earned`) : t(`kidReport.medals.${medal.id}.locked`)}</small>
        </li>)}
      </ul>
    </section>

    {/* El hilo del reto: lo que entrenó en la Tierra le sirvió en el espacio. */}
    {tools.length > 0 && <section className="kid-card" aria-labelledby="kid-tools-title">
      <h2 id="kid-tools-title"><Wrench weight="fill" aria-hidden="true" />{t('kidReport.toolsTitle')}</h2>
      <ul className="kid-tools">
        {tools.map((toolId) => <li key={toolId}>
          <strong>{t(`tools.${toolId}.label`)}</strong>
          <span>{t(`tools.${toolId}.benefit`)}</span>
        </li>)}
      </ul>
    </section>}
  </div>;
}
