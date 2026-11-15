import { ArrowLeft, BookOpen, Sun, ShieldWarning, Wind, Plant, Globe } from '@phosphor-icons/react';
import { useI18n, LanguageSelector } from '../../../i18n';
import './earth.css';

interface LearnScreenProps {
  readonly onBack: () => void;
}

const LEARN_TOPICS = [
  {
    icon: <Sun size={28} color="#f6c15b" weight="fill" />,
    id: 'power',
    url: 'https://power.larc.nasa.gov/',
  },
  {
    icon: <ShieldWarning size={28} color="#ba68c8" weight="fill" />,
    id: 'donki',
    url: 'https://ccmc.gsfc.nasa.gov/tools/DONKI/',
  },
  {
    icon: <Wind size={28} color="#64b5f6" weight="fill" />,
    id: 'eclss',
    url: 'https://www.nasa.gov/reference/environmental-control-and-life-support-systems-eclss/',
  },
  {
    icon: <Plant size={28} color="#81c784" weight="fill" />,
    id: 'veggie',
    url: 'https://www.nasa.gov/missions/station/iss-research/veggie-plant-growth-system-study/',
  },
] as const;

export function LearnScreen({ onBack }: LearnScreenProps) {
  const { t } = useI18n();
  return (
    <div className="earth-screen">
      <header className="earth-screen__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button type="button" className="earth-screen__back-btn" onClick={onBack}>
          <ArrowLeft weight="bold" />
          <span>{t('common.back')}</span>
        </button>
        <div className="earth-screen__progress-pill">
          <BookOpen weight="fill" color="#f6c15b" />
          <span>{t('learn.title')}</span>
        </div>
        <LanguageSelector variant="hud" />
      </header>

      <main className="earth-card" style={{ maxWidth: '56rem' }}>
        <h1 className="earth-card__title">
          <BookOpen color="#f6c15b" weight="fill" />
          <span>{t('learn.title')}</span>
        </h1>
        <p className="earth-card__subtitle">
          {t('learn.subtitle')}
        </p>

        <div style={{ display: 'grid', gap: '1.2rem', margin: '1.5rem 0' }}>
          {LEARN_TOPICS.map((topic, i) => (
            <article
              key={i}
              style={{
                background: '#15263a',
                border: '1px solid #33547d',
                borderRadius: '1rem',
                padding: '1.4rem',
                display: 'flex',
                gap: '1.2rem',
                alignItems: 'flex-start'
              }}
            >
              <div style={{
                background: '#1f3854',
                padding: '0.8rem',
                borderRadius: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                {topic.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <h2 style={{ margin: 0, fontFamily: 'Fredoka', fontSize: '1.25rem', color: '#ffffff' }}>
                    {t(`learn.articles.${topic.id}.title`)}
                  </h2>
                  <a
                    href={topic.url}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      fontSize: '0.85rem',
                      color: '#f6c15b',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      fontWeight: 700
                    }}
                  >
                    <Globe size={16} /> {t('learn.sourceLink')}
                  </a>
                </div>
                <span style={{ fontSize: '0.82rem', color: '#7cb5c8', fontWeight: 700, display: 'block', margin: '0.2rem 0 0.6rem 0' }}>
                  {t('learn.sourceLabel', { source: t(`learn.articles.${topic.id}.source`) })}
                </span>
                <p style={{ margin: 0, color: '#c5d8ea', fontSize: '0.92rem', lineHeight: '1.5' }}>
                  {t(`learn.articles.${topic.id}.summary`)}
                </p>
              </div>
            </article>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.5rem' }}>
          <button type="button" className="earth-action-btn" onClick={onBack}>
            <span>{t('learn.back')}</span>
          </button>
        </div>
      </main>
    </div>
  );
}
