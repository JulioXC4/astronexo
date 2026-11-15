export interface CharacterPortraitProps {
  readonly kind?: 'cadet' | 'robot';
  readonly selected?: boolean;
  readonly mood?: 'normal' | 'alert' | 'celebrate';
  readonly label?: string;
}

/** Original, identity-neutral fallback until the design team supplies licensed character art. */
export function CharacterPortrait({ kind = 'cadet', selected = false, mood = 'normal', label = kind === 'robot' ? 'Robot acompañante' : 'Cadete astronauta' }: CharacterPortraitProps) {
  return <svg viewBox="0 0 240 240" width="240" height="240" role="img" aria-label={`${label}, ${mood === 'alert' ? 'alerta' : mood === 'celebrate' ? 'celebración' : 'normal'}${selected ? ', seleccionado' : ''}`}>
    <circle cx="120" cy="120" r="112" fill={selected ? '#f6c15b' : '#527d8d'}/>
    <circle cx="120" cy="120" r="104" fill="#1e3c54"/>
    {kind === 'robot' ? <><path d="M62 169V91q0-29 29-29h58q29 0 29 29v78l-58 29Z" fill="#bcd6d1" stroke="#e9f0db" strokeWidth="8"/><path d="M120 64V42" stroke="#d5e8dd" strokeWidth="8"/><circle cx="120" cy="37" r="9" fill="#f6c15b"/><rect x="76" y="91" width="88" height="57" rx="20" fill="#315b71"/><circle cx="99" cy="119" r="10" fill={mood === 'alert' ? '#ee9472' : '#80d0d1'}/><circle cx="141" cy="119" r="10" fill={mood === 'alert' ? '#ee9472' : '#80d0d1'}/><path d={mood === 'celebrate' ? 'M101 160q19 19 38 0' : 'M105 160h30'} fill="none" stroke="#356578" strokeWidth="6" strokeLinecap="round"/><path d="M59 112h-18m140 0h18" stroke="#e2ecdc" strokeWidth="9" strokeLinecap="round"/></> : <><path d="M53 223q4-61 67-62 63 1 67 62" fill="#dce8dc" stroke="#7195a1" strokeWidth="8"/><path d="M69 128V92q0-57 51-57t51 57v36q0 45-51 49-51-4-51-49Z" fill="#edf2e5" stroke="#f6c15b" strokeWidth="9"/><path d="M78 119V91q0-43 42-43t42 43v28q-2 39-42 41-40-2-42-41Z" fill="#b88564"/><path d="M79 92q8-44 42-44 34 0 41 44-17-23-41-20-25-3-42 20Z" fill="#354253"/><circle cx="103" cy="115" r="4" fill="#293d4c"/><circle cx="138" cy="115" r="4" fill="#293d4c"/><path d={mood === 'alert' ? 'M112 138h16' : mood === 'celebrate' ? 'M103 134q17 20 34 0' : 'M109 137q11 8 22 0'} fill="none" stroke="#684844" strokeWidth="4" strokeLinecap="round"/><path d="M105 180h30v42h-30Z" fill="#76b7bd"/><circle cx="120" cy="199" r="8" fill="#f6c15b"/></>}
    {selected && <circle cx="192" cy="48" r="18" fill="#f6c15b" stroke="#fff" strokeWidth="4"/>}
    {selected && <path d="m183 48 7 7 12-14" fill="none" stroke="#1b3950" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>}
  </svg>;
}
