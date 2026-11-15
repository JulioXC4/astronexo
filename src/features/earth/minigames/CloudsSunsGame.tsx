import { useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle, CloudSun, Info, Sparkle } from '@phosphor-icons/react';
import { getSolarDatasetByCity } from '../../../data/nasa/powerData';
import { useI18n, LanguageSelector } from '../../../i18n';
import { createTrainingOutcome, calculateTrainingCost } from '../trainingOutcome';
import type { TrainingOutcome } from '../../../game';
import '../screens/earth.css';

interface CloudsSunsGameProps {
  readonly cityId: string;
  readonly onComplete: (outcome: TrainingOutcome) => void;
  readonly onBack: () => void;
}

/** Reserva sugerida = promedio de lo que cada día pierde respecto al mejor día POWER de la ciudad. */
export function recommendedReservePercent(values: readonly number[]): number {
  const best = Math.max(...values);
  if (!(best > 0)) return 100;
  const shortfall = values.reduce((sum, value) => sum + (1 - value / best), 0) / values.length;
  return Math.round(shortfall * 100);
}

/** Diferencia (puntos %) entre la reserva elegida y la que piden los datos NASA POWER. */
export function reserveMismatch(reservePercent: number, values: readonly number[]): number {
  return Math.abs(reservePercent - recommendedReservePercent(values));
}

export function CloudsSunsGame({ cityId, onComplete, onBack }: CloudsSunsGameProps) {
  const { t } = useI18n();
  const dataset = getSolarDatasetByCity(cityId);
  const values = useMemo(() => dataset.days.map((day) => day.irradianceKwhPerM2), [dataset]);
  const best = Math.max(...values);
  const [reserve, setReserve] = useState<number>(50);
  const [tested, setTested] = useState<boolean>(false);
  const recommended = recommendedReservePercent(values);
  const mismatch = reserveMismatch(reserve, values);
  const passed = tested && mismatch <= 25;
  const cost = calculateTrainingCost('CLOUDS_SUNS', mismatch);
  const first = dataset.days[0].observation;
  const cityName = cityId === 'TROMSO' ? 'Tromsø' : 'Arequipa';

  return (
    <div className="earth-screen" style={{ padding: '0.8rem 1rem' }}>
      <header className="earth-screen__header" style={{ marginBottom: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button type="button" className="earth-screen__back-btn" onClick={onBack}>
          <ArrowLeft weight="bold" />
          <span>{t('common.back')}</span>
        </button>
        <div className="earth-screen__progress-pill">
          <CloudSun weight="fill" color="#f6c15b" />
          <span>{t('minigames.cloudsSuns.title')} · NASA POWER ({cityName})</span>
        </div>
        <LanguageSelector variant="hud" />
      </header>

      <main className="earth-card" style={{ maxWidth: '58rem', padding: '1.2rem' }}>
        <h1 className="earth-card__title" style={{ fontSize: '1.5rem', margin: 0 }}>
          <CloudSun color="#f6c15b" weight="fill" />
          <span>{t('minigames.cloudsSuns.title')}</span>
        </h1>
        <p style={{ margin: '0.3rem 0 0.8rem', color: '#9bc0e4', fontSize: '0.9rem' }}>
          {t('minigames.cloudsSuns.intro', { city: cityName })}
        </p>

        <div role="img" aria-label={t('minigames.cloudsSuns.chartAria')} style={{ display: 'grid', gap: '0.5rem', marginBottom: '0.9rem' }}>
          {dataset.days.map((day) => (
            <div key={day.date} style={{ display: 'grid', gridTemplateColumns: '9rem 1fr 7rem', gap: '0.6rem', alignItems: 'center', fontSize: '0.85rem', color: '#d1e4f6' }}>
              <span>{day.seasonLabel}</span>
              <div style={{ background: '#142539', borderRadius: '0.4rem', height: '1.1rem', overflow: 'hidden' }}>
                <div style={{ width: `${best > 0 ? (day.irradianceKwhPerM2 / best) * 100 : 0}%`, height: '100%', background: '#f6c15b' }} />
              </div>
              <strong>{day.irradianceKwhPerM2} kWh/m²</strong>
            </div>
          ))}
        </div>

        <label htmlFor="clouds-reserve" style={{ display: 'block', color: '#ffffff', fontWeight: 700, marginBottom: '0.3rem' }}>
          {t('minigames.cloudsSuns.reserveLabel', { value: reserve })}
        </label>
        <input
          id="clouds-reserve" type="range" min={0} max={100} step={1} value={reserve}
          onChange={(event) => { setReserve(Number(event.target.value)); setTested(false); }}
          style={{ width: '100%' }}
        />
        <p style={{ margin: '0.3rem 0 0.8rem', color: '#9bc0e4', fontSize: '0.82rem' }}>{t('minigames.cloudsSuns.hint')}</p>

        <button type="button" className="earth-action-btn" onClick={() => setTested(true)}>
          <Sparkle weight="fill" />
          <span>{t('minigames.cloudsSuns.testBtn')}</span>
        </button>

        {tested && !passed && (
          <p role="status" style={{ color: '#ffcdd2', marginTop: '0.8rem' }}>
            {t('minigames.cloudsSuns.tryAgain', { recommended })}
          </p>
        )}
        {passed && (
          <div role="status" style={{ background: '#122e23', border: '2px solid #5bbd78', borderRadius: '0.8rem', padding: '1rem', marginTop: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <strong style={{ color: '#69f0ae', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle weight="fill" size={22} /> {t('minigames.cloudsSuns.passed', { recommended })}
              </strong>
              <p style={{ margin: '0.2rem 0 0', color: '#c8e6c9', fontSize: '0.88rem' }}>{t('minigames.cloudsSuns.benefit')}</p>
            </div>
            <button
              type="button" className="earth-action-btn" style={{ padding: '0.75rem 1.6rem' }}
              onClick={() => onComplete(createTrainingOutcome(
                'CLOUDS_SUNS', `Reserva ${reserve}% (sugerida ${recommended}%)`, 'energy', cost,
                'Guardar reserva para días sin sol deja menos energía libre al despegar.',
              ))}
            >
              <Sparkle weight="fill" />
              <span>{t('minigames.cloudsSuns.confirmBtn', { cost })}</span>
            </button>
          </div>
        )}

        <p style={{ marginTop: '0.8rem', display: 'flex', gap: '0.4rem', color: '#9bc0e4', fontSize: '0.8rem' }}>
          <Info size={16} color="#f6c15b" />
          <span>{t('minigames.cloudsSuns.source', { parameter: first.parameter, unit: first.unit, status: t(`nasaStatus.${first.status ?? 'HISTORICAL'}`) })}</span>
        </p>
      </main>
    </div>
  );
}
