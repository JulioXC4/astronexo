import { useEffect, useState } from 'react';
import { assetManifest } from '../assets/manifest';

export type PortraitIdentity = 'ALBA' | 'LEO' | 'AURORA' | 'NICO' | 'CHISPA';

export interface CharacterPortraitProps {
  readonly identity?: PortraitIdentity;
  readonly kind?: 'cadet' | 'robot';
  readonly selected?: boolean;
  readonly mood?: 'normal' | 'alert' | 'celebrate';
  readonly label?: string;
  readonly source?: string | null;
}

const accents: Record<PortraitIdentity, string> = {
  ALBA: '#76b7bd', LEO: '#70bd87', AURORA: '#bd92d0', NICO: '#e7a872', CHISPA: '#f6c15b',
};

const pixelPortraits: Partial<Record<PortraitIdentity, string>> = {
  ALBA: assetManifest['character.alba'].path ?? undefined,
  LEO: '/assets/pixel-art/commander-leo.webp',
  AURORA: assetManifest['character.aurora'].path ?? undefined,
  NICO: assetManifest['character.nico'].path ?? undefined,
  CHISPA: assetManifest['character.chispa'].path ?? undefined,
};

/** Uses the asset catalog and falls back to the original SVG stand-in if an image cannot load. */
export function CharacterPortrait({ identity, kind = 'cadet', selected = false, mood = 'normal', label, source }: CharacterPortraitProps) {
  const robot = kind === 'robot' || identity === 'CHISPA';
  const accent = accents[identity ?? (robot ? 'CHISPA' : 'ALBA')];
  const accessibleLabel = label ?? (robot ? 'Robot acompañante' : 'Cadete astronauta');
  const pixelPortrait = source ?? (identity && pixelPortraits[identity]);
  const [imageFailed, setImageFailed] = useState(false);
  useEffect(() => setImageFailed(false), [pixelPortrait]);
  if (pixelPortrait && !imageFailed) return <span className={`character-portrait character-portrait--pixel${selected ? ' character-portrait--selected' : ''}`} role="img" aria-label={`${accessibleLabel}, ${mood === 'alert' ? 'alerta' : mood === 'celebrate' ? 'celebración' : 'normal'}${selected ? ', seleccionado' : ''}`}>
    <img src={pixelPortrait} alt="" onError={() => setImageFailed(true)} />
  </span>;
  return <svg className="character-portrait" viewBox="0 0 240 240" role="img" aria-label={`${accessibleLabel}, ${mood === 'alert' ? 'alerta' : mood === 'celebrate' ? 'celebración' : 'normal'}${selected ? ', seleccionado' : ''}`}>
    <circle cx="120" cy="120" r="112" fill={selected ? '#f6c15b' : '#527d8d'}/>
    <circle cx="120" cy="120" r="104" fill="#1e3c54"/>
    {robot ? <>
      <path d="M62 169V91q0-29 29-29h58q29 0 29 29v78l-58 29Z" fill="#bcd6d1" stroke="#e9f0db" strokeWidth="8"/>
      <path d="M120 64V42" stroke="#d5e8dd" strokeWidth="8"/><circle cx="120" cy="37" r="9" fill={accent}/>
      <rect x="76" y="91" width="88" height="57" rx="20" fill="#315b71"/>
      <circle cx="99" cy="119" r="10" fill={mood === 'alert' ? '#ee9472' : '#80d0d1'}/><circle cx="141" cy="119" r="10" fill={mood === 'alert' ? '#ee9472' : '#80d0d1'}/>
      <path d={mood === 'celebrate' ? 'M101 160q19 19 38 0' : 'M105 160h30'} fill="none" stroke="#356578" strokeWidth="6" strokeLinecap="round"/>
      <path d="M59 112h-18m140 0h18" stroke="#e2ecdc" strokeWidth="9" strokeLinecap="round"/>
    </> : <>
      <path d="M53 223q4-61 67-62 63 1 67 62" fill="#dce8dc" stroke={accent} strokeWidth="8"/>
      <path d="M69 128V92q0-57 51-57t51 57v36q0 45-51 49-51-4-51-49Z" fill="#edf2e5" stroke="#f6c15b" strokeWidth="9"/>
      <path d="M78 119V91q0-43 42-43t42 43v28q-2 39-42 41-40-2-42-41Z" fill={identity === 'NICO' ? '#956c55' : identity === 'LEO' ? '#aa795c' : '#b88564'}/>
      <path d={identity === 'NICO' ? 'M79 91q8-50 42-44 37-2 41 45-23-19-42-17-24-3-41 16Z' : identity === 'LEO' ? 'M78 93q4-44 41-45 36 0 43 44-17-17-41-15-24-5-43 16Z' : 'M79 92q8-44 42-44 34 0 41 44-17-23-41-20-25-3-42 20Z'} fill={identity === 'AURORA' ? '#27364a' : identity === 'NICO' ? '#3c302d' : '#354253'}/>
      <circle cx="103" cy="115" r="4" fill="#293d4c"/><circle cx="138" cy="115" r="4" fill="#293d4c"/>
      {identity === 'AURORA' && <path d="M89 103h29v23H89Zm33 0h29v23h-29Zm-4 8h4" fill="none" stroke="#e5e8df" strokeWidth="4"/>}
      <path d={mood === 'alert' ? 'M112 138h16' : mood === 'celebrate' ? 'M103 134q17 20 34 0' : 'M109 137q11 8 22 0'} fill="none" stroke="#684844" strokeWidth="4" strokeLinecap="round"/>
      <path d="M105 180h30v42h-30Z" fill={accent}/><circle cx="120" cy="199" r="8" fill="#f6c15b"/>
      {identity === 'LEO' && <path d="m115 193 5-8 5 8-5 8Z" fill="#345d70"/>}
      {identity === 'NICO' && <path d="M120 205q-12-11 0-18 12 7 0 18m0-9q8-10 13-8" fill="none" stroke="#345d70" strokeWidth="3"/>}
    </>}
    {selected && <><circle cx="192" cy="48" r="18" fill="#f6c15b" stroke="#fff" strokeWidth="4"/><path d="m183 48 7 7 12-14" fill="none" stroke="#1b3950" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/></>}
  </svg>;
}
