import { BookOpen, Sun, ShieldWarning, Wind, Plant, Globe } from '@phosphor-icons/react';
import { useI18n } from '../../../i18n';
import { NasaSourcesPanel } from '../../nasa/NasaSourcesPanel';
import { SceneScreen, SCENE_BACKGROUNDS } from './SceneScreen';
import './earth.css';

interface LearnScreenProps {
  readonly onBack: () => void;
}

const LEARN_TOPICS_CONFIG = [
  {
    key: 'solar',
    icon: <Sun size={28} color="#f6c15b" weight="fill" />,
    url: 'https://power.larc.nasa.gov/',
  },
  {
    key: 'donki',
    icon: <ShieldWarning size={28} color="#ba68c8" weight="fill" />,
    url: 'https://ccmc.gsfc.nasa.gov/tools/DONKI/',
  },
  {
    key: 'eclss',
    icon: <Wind size={28} color="#64b5f6" weight="fill" />,
    url: 'https://www.nasa.gov/reference/environmental-control-and-life-support-systems-eclss/',
  },
  {
    key: 'crops',
    icon: <Plant size={28} color="#81c784" weight="fill" />,
    url: 'https://www.nasa.gov/missions/station/iss-research/veggie-plant-growth-system-study/',
  },
] as const;

export function LearnScreen({ onBack }: LearnScreenProps) {
  const { t } = useI18n();
  return (
    <SceneScreen background={SCENE_BACKGROUNDS.briefingRoom} onBack={onBack} status={<><BookOpen weight="fill" aria-hidden="true" /> {t('learn.title')}</>}>
      <main className="earth-card" style={{ maxWidth: '56rem' }}>
        <h1 className="earth-card__title">
          <BookOpen color="#f6c15b" weight="fill" />
          <span>{t('learn.title')}</span>
        </h1>
        <p className="earth-card__subtitle">{t('learn.subtitle')}</p>

        <div style={{ display: 'grid', gap: '1rem', margin: '1.2rem 0' }}>
          {LEARN_TOPICS_CONFIG.map((topic) => {
            const title = t(`learn.topics.${topic.key}.title`);
            const source = t(`learn.topics.${topic.key}.source`);
            const summary = t(`learn.topics.${topic.key}.summary`);
            return (
              <article key={topic.key} className="scene-topic">
                <div className="scene-topic__icon" aria-hidden="true">{topic.icon}</div>
                <div style={{ flex: 1 }}>
                  <div className="scene-topic__head">
                    <h2>{title}</h2>
                    <a className="scene-topic__link" href={topic.url} target="_blank" rel="noreferrer">
                      <Globe size={16} aria-hidden="true" /> {t('learn.viewOnNasaGov')}
                    </a>
                  </div>
                  <span className="scene-topic__source">{t('learn.officialSource', { source })}</span>
                  <p>{summary}</p>
                </div>
              </article>
            );
          })}
        </div>

        <NasaSourcesPanel />

        <div className="scene-actions">
          <button type="button" className="earth-action-btn" onClick={onBack}>
            <span>{t('learn.closeBtn')}</span>
          </button>
        </div>
      </main>
    </SceneScreen>
  );
}
