import { useEffect, useRef } from 'react';
import { X } from '@phosphor-icons/react';
import { useI18n } from '../../../i18n';
import { welcomeTrailer } from './welcomeTrailer';

export function TrailerDialog({ onClose }: { onClose: () => void }) {
  const { t } = useI18n();
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    dialog.current?.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return <dialog ref={dialog} className="welcome-trailer" data-silent aria-labelledby="trailer-title"
    onCancel={(event) => { event.preventDefault(); onClose(); }}
    onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <div className="welcome-trailer__surface">
      <header>
        <h2 id="trailer-title">{t('welcome.trailer.watch')}</h2>
        <button autoFocus type="button" onClick={onClose} aria-label={t('common.close')}><X aria-hidden="true" /></button>
      </header>
      <div className="welcome-trailer__screen">
        <iframe src={welcomeTrailer.embedUrl} title={t('welcome.trailer.watch')}
          allow="encrypted-media; fullscreen; picture-in-picture" allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin" />
      </div>
      <a href={welcomeTrailer.watchUrl} target="_blank" rel="noreferrer">{t('welcome.trailer.openYouTube')}</a>
    </div>
  </dialog>;
}
