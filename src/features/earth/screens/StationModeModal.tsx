import { useState } from 'react';
import {
  X,
  UsersThree,
  ShieldCheck,
  RocketLaunch,
  Compass,
  ArrowRight,
  ArrowLeft,
  Sparkle,
} from '@phosphor-icons/react';
import { useI18n, LanguageSelector } from '../../../i18n';
import type { Destination } from '../../../game/contracts';
import type { City, GameSetup } from '../../../game';
import { MISSION_TOOL, CITY_M5_TOOL } from '../../../game/config/tools';
import {
  createLocalCoopConfig,
  rolesForPlayerCount,
  ROLE_LABELS,
  type LocalCoopConfig,
  type PlayerRole,
} from '../../coop-gameplay/coop.types';
import { useModalFocus } from '../../../visual-kit/useModalFocus';
import './earth.css';

export interface StationModeModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onLaunchDemoSolo?: () => void;
  readonly onStartCoop?: (setup: GameSetup, group: LocalCoopConfig) => void;
  /** Recorrido completo: el grupo pasa por destino, estación, entrenamientos y viaje antes de la guardia. */
  readonly onStartCoopFullRoute?: (group: LocalCoopConfig) => void;
}

type StationTab = 'MISSION' | 'CREW' | 'LAUNCH';

const SUGGESTED_TEAM_COUNT = 6;

const SUGGESTED_ALIASES = [
  'Nova',
  'Rayo',
  'Luna',
  'Astro',
  'Brote',
  'Cosmo',
  'Chispa',
  'Alba',
  'Nico',
  'Aurora',
  'Leo',
  'Sombra',
  'Pulsar',
  'Cometa',
  'Órbita',
];

const ROLE_ICONS: Readonly<Record<PlayerRole, string>> = {
  COMMANDER: '',
  ENERGY: '',
  OXYGEN: '',
  PROTECTION: '',
  CROPS: '',
};

export function StationModeModal({
  isOpen,
  onClose,
  onLaunchDemoSolo,
  onStartCoop,
  onStartCoopFullRoute,
}: StationModeModalProps) {
  const { t } = useI18n();
  const modalRef = useModalFocus<HTMLDivElement>(isOpen, onClose);
  const [activeTab, setActiveTab] = useState<StationTab>('MISSION');

  // Configuración de Misión
  const [roomCode, setRoomCode] = useState('NASA-2026');
  // El nombre de equipo por defecto sigue al idioma activo hasta que se escriba otro.
  const [typedTeamAlias, setTeamAlias] = useState<string | null>(null);
  const teamAlias = typedTeamAlias ?? t('stationDefaults.team');
  const [destination, setDestination] = useState<Destination>('MOON');
  const [city, setCity] = useState<City>('AREQUIPA');

  // Configuración de Tripulación
  const [cadetCount, setCadetCount] = useState<3 | 4 | 5>(4);
  const [aliases, setAliases] = useState<string[]>(['Nova', 'Rayo', 'Luna', 'Astro']);

  if (!isOpen) return null;

  function handleCadetCountChange(count: 3 | 4 | 5) {
    setCadetCount(count);
    if (aliases.length >= count) {
      setAliases(aliases.slice(0, count));
    } else {
      const next = [...aliases];
      for (let i = aliases.length; i < count; i++) {
        const candidate = SUGGESTED_ALIASES.find((a) => !next.includes(a)) ?? t('stationDefaults.cadet', { number: i + 1 }).replace(/\s+/g, '-');
        next.push(candidate);
      }
      setAliases(next);
    }
  }

  function handleAliasChange(index: number, value: string) {
    const next = [...aliases];
    next[index] = value;
    setAliases(next);
  }

  // Roles calculados según tamaño del grupo (3, 4 o 5)
  const assignedRoles = rolesForPlayerCount(cadetCount);

  // Validación
  const cleanTeam = teamAlias.trim();
  const cleanAliases = aliases.map((a) => a.trim());
  const hasEmptyAlias = cleanAliases.some((a) => a.length === 0);
  const hasDuplicateAlias = new Set(cleanAliases.map((a) => a.toLowerCase())).size !== cleanAliases.length;
  const isTeamValid = cleanTeam.length > 0;
  const isValid = isTeamValid && !hasEmptyAlias && !hasDuplicateAlias;

  function handleLaunchCoop() {
    if (!isValid || !onStartCoop) return;

    const setup: GameSetup = {
      mode: 'LOCAL_COOP',
      city,
      destination,
      completedEarthMissions: ['M1', 'M4', 'M5'],
      selectedTools: [
        MISSION_TOOL.M1,
        MISSION_TOOL.M4,
        CITY_M5_TOOL[city],
      ],
      selectedModules: [], // Permite que CoopSpaceGame inicie con BaseBuilderView para construir 3 módulos
      scenarioId: `STATION_COOP_${roomCode.trim().replace(/[^a-zA-Z0-9_-]/g, '_') || 'LOCAL'}`,
      difficulty: 'CALM',
    };

    const group = createLocalCoopConfig(cleanTeam, cleanAliases);
    onStartCoop(setup, group);
    onClose();
  }

  function handleFullRoute() {
    if (!isValid || !onStartCoopFullRoute) return;
    onStartCoopFullRoute(createLocalCoopConfig(cleanTeam, cleanAliases));
    onClose();
  }

  return (
    <div
      className="station-modal-veil"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div ref={modalRef} className="station-modal" role="dialog" aria-modal="true" aria-labelledby="station-modal-title">
        <button type="button" className="station-modal__close" onClick={onClose} aria-label={t('common.close')}>
          <X size={20} weight="bold" />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.8rem', flexWrap: 'wrap', gap: '0.6rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <UsersThree size={34} color="#f6c15b" weight="fill" />
            <div>
              <h2 id="station-modal-title" style={{ fontFamily: 'Fredoka', fontSize: '1.6rem', color: '#ffffff', margin: 0 }}>
                {t('station.modalTitle')}
              </h2>
              <span style={{ fontSize: '0.86rem', color: '#7cb5c8', fontWeight: 700 }}>
                {t('station.modalSubtitle')}
              </span>
            </div>
          </div>
          <LanguageSelector variant="hud" />
        </div>

        {/* Pestañas principales */}
        <div className="station-tabs" role="tablist">
          <button
            type="button"
            className={`station-tab-btn ${activeTab === 'MISSION' ? 'station-tab-btn--active' : ''}`}
            onClick={() => setActiveTab('MISSION')}
          >
            {t('station.tabs.mission')}
          </button>
          <button
            type="button"
            className={`station-tab-btn ${activeTab === 'CREW' ? 'station-tab-btn--active' : ''}`}
            onClick={() => setActiveTab('CREW')}
          >
            {t('station.tabs.crew')}
          </button>
          <button
            type="button"
            className={`station-tab-btn ${activeTab === 'LAUNCH' ? 'station-tab-btn--active' : ''}`}
            onClick={() => setActiveTab('LAUNCH')}
          >
            {t('station.tabs.launch')}
          </button>
        </div>

        {/* PESTAÑA 1: SALA Y MISIÓN */}
        {activeTab === 'MISSION' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(18rem, 1fr))', gap: '1.2rem' }}>
              {/* Código de Sala */}
              <div style={{ background: '#132338', border: '1px solid #33557d', borderRadius: '0.8rem', padding: '1rem' }}>
                <label style={{ display: 'block', color: '#ffffff', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.3rem' }}>
                  {t('station.roomCodeLabel')}
                </label>
                <input
                  type="text"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value)}
                  className="callsign-box__input"
                  maxLength={16}
                />
                <span style={{ fontSize: '0.78rem', color: '#7cb5c8', display: 'block', marginTop: '0.4rem' }}>
                  {t('station.roomCodeHelp')}
                </span>
              </div>

              {/* Nombre Ficticio del Equipo */}
              <div style={{ background: '#132338', border: '1px solid #33557d', borderRadius: '0.8rem', padding: '1rem' }}>
                <label style={{ display: 'block', color: '#ffffff', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.3rem' }}>
                  {t('station.teamNameLabel')}
                </label>
                <input
                  type="text"
                  value={teamAlias}
                  onChange={(e) => setTeamAlias(e.target.value)}
                  placeholder={t('station.teamNamePlaceholder')}
                  className="callsign-box__input"
                  maxLength={24}
                />
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                  <span style={{ fontSize: '0.78rem', color: '#7cb5c8' }}>{t('station.suggestedTeams')}</span>
                  {Array.from({ length: SUGGESTED_TEAM_COUNT }, (_, index) => t(`stationDefaults.teams.${index}`)).slice(0, 3).map((name) => (
                    <button
                      key={name}
                      type="button"
                      style={{
                        background: '#1b3554',
                        border: '1px solid #4a75a7',
                        color: '#d4e7f8',
                        borderRadius: '0.4rem',
                        padding: '0.15rem 0.5rem',
                        fontSize: '0.76rem',
                        cursor: 'pointer',
                      }}
                      onClick={() => setTeamAlias(name)}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Selección de Destino */}
            <div style={{ marginTop: '1.2rem' }}>
              <label style={{ display: 'block', color: '#ffffff', fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.5rem' }}>
                {t('station.destinationLabel')}
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(14rem, 1fr))', gap: '0.8rem' }}>
                <button
                  type="button"
                  style={{
                    background: destination === 'MOON' ? '#1f3c60' : '#132338',
                    border: destination === 'MOON' ? '2px solid #f6c15b' : '1px solid #33557d',
                    borderRadius: '0.8rem',
                    padding: '0.9rem',
                    textAlign: 'left',
                    cursor: 'pointer',
                    color: '#ffffff',
                  }}
                  onClick={() => setDestination('MOON')}
                >
                  <div style={{ fontSize: '1.6rem', marginBottom: '0.3rem' }}></div>
                  <strong style={{ fontFamily: 'Fredoka', fontSize: '1.1rem', color: destination === 'MOON' ? '#f6c15b' : '#ffffff' }}>
                    {t('station.moon')}
                  </strong>
                </button>
                <button
                  type="button"
                  style={{
                    background: destination === 'MARS' ? '#1f3c60' : '#132338',
                    border: destination === 'MARS' ? '2px solid #f6c15b' : '1px solid #33557d',
                    borderRadius: '0.8rem',
                    padding: '0.9rem',
                    textAlign: 'left',
                    cursor: 'pointer',
                    color: '#ffffff',
                  }}
                  onClick={() => setDestination('MARS')}
                >
                  <div style={{ fontSize: '1.6rem', marginBottom: '0.3rem' }}></div>
                  <strong style={{ fontFamily: 'Fredoka', fontSize: '1.1rem', color: destination === 'MARS' ? '#f6c15b' : '#ffffff' }}>
                    {t('station.mars')}
                  </strong>
                </button>
              </div>
            </div>

            {/* Centro de Entrenamiento Terrestre */}
            <div style={{ marginTop: '1.2rem' }}>
              <label style={{ display: 'block', color: '#ffffff', fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.5rem' }}>
                {t('station.originCityLabel')}
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(14rem, 1fr))', gap: '0.8rem' }}>
                <button
                  type="button"
                  style={{
                    background: city === 'AREQUIPA' ? '#1f3c60' : '#132338',
                    border: city === 'AREQUIPA' ? '2px solid #f6c15b' : '1px solid #33557d',
                    borderRadius: '0.8rem',
                    padding: '0.9rem',
                    textAlign: 'left',
                    cursor: 'pointer',
                    color: '#ffffff',
                  }}
                  onClick={() => setCity('AREQUIPA')}
                >
                  <div style={{ fontSize: '1.4rem' }}> </div>
                  <strong style={{ fontFamily: 'Fredoka', fontSize: '1rem', color: city === 'AREQUIPA' ? '#f6c15b' : '#ffffff' }}>
                    {t('station.arequipa')}
                  </strong>
                </button>
                <button
                  type="button"
                  style={{
                    background: city === 'TROMSO' ? '#1f3c60' : '#132338',
                    border: city === 'TROMSO' ? '2px solid #f6c15b' : '1px solid #33557d',
                    borderRadius: '0.8rem',
                    padding: '0.9rem',
                    textAlign: 'left',
                    cursor: 'pointer',
                    color: '#ffffff',
                  }}
                  onClick={() => setCity('TROMSO')}
                >
                  <div style={{ fontSize: '1.4rem' }}>❄️ </div>
                  <strong style={{ fontFamily: 'Fredoka', fontSize: '1rem', color: city === 'TROMSO' ? '#f6c15b' : '#ffffff' }}>
                    {t('station.tromso')}
                  </strong>
                </button>
              </div>
            </div>

            {/* Paquete Terrestre Canónico */}
            <div style={{ background: '#0e1c2e', border: '1px solid #284465', borderRadius: '0.8rem', padding: '0.9rem', marginTop: '1.2rem' }}>
              <span style={{ color: '#f6c15b', fontWeight: 700, fontSize: '0.86rem' }}>
                 {t('station.groundPackageLabel')}
              </span>
              <p style={{ margin: '0.3rem 0 0.5rem 0', color: '#bed5ea', fontSize: '0.85rem' }}>
                {t('station.groundPackageDesc')}
              </p>
              <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                <span style={{ background: '#1c3450', border: '1px solid #385f8c', borderRadius: '0.5rem', padding: '0.3rem 0.6rem', color: '#e8f2fc', fontSize: '0.82rem' }}>
                   {t('tools.SPARE_PARTS_KIT.label')} (M1)
                </span>
                <span style={{ background: '#1c3450', border: '1px solid #385f8c', borderRadius: '0.5rem', padding: '0.3rem 0.6rem', color: '#e8f2fc', fontSize: '0.82rem' }}>
                   {t('tools.EXTRA_BATTERY.label')} (M4)
                </span>
                <span style={{ background: '#1c3450', border: '1px solid #385f8c', borderRadius: '0.5rem', padding: '0.3rem 0.6rem', color: '#e8f2fc', fontSize: '0.82rem' }}>
                  {city === 'AREQUIPA' ? `${t('tools.WATER_RECYCLER.label')} (M5)` : `❄️ ${t('tools.THERMAL_INSULATION.label')} (M5)`}
                </span>
              </div>
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="facility-card__btn facility-card__btn--gold"
                onClick={() => setActiveTab('CREW')}
              >
                <span>{t('station.nextBtn')}</span>
                <ArrowRight weight="bold" />
              </button>
            </div>
          </div>
        )}

        {/* PESTAÑA 2: TRIPULACIÓN Y ROLES */}
        {activeTab === 'CREW' && (
          <div>
            {/* Selector de tamaño de equipo */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.8rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', color: '#ffffff', fontWeight: 700, fontSize: '0.95rem' }}>
                  {t('station.groupSizeLabel')}
                </label>
                <span style={{ fontSize: '0.82rem', color: '#7cb5c8' }}>
                  {t('station.rolesSummaryTitle', { count: cadetCount })}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {([3, 4, 5] as const).map((count) => (
                  <button
                    key={count}
                    type="button"
                    style={{
                      background: cadetCount === count ? '#f6c15b' : '#132338',
                      color: cadetCount === count ? '#132338' : '#ffffff',
                      border: cadetCount === count ? '2px solid #f6c15b' : '1px solid #33557d',
                      borderRadius: '0.6rem',
                      padding: '0.45rem 0.9rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                    onClick={() => handleCadetCountChange(count)}
                  >
                    {t('station.cadetsCount', { count })}
                  </button>
                ))}
              </div>
            </div>

            {/* Aviso de Privacidad Escolar */}
            <div style={{
              background: 'rgba(246, 193, 91, 0.1)',
              border: '1px solid #f6c15b',
              borderRadius: '0.8rem',
              padding: '0.8rem 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.7rem',
              marginBottom: '1.2rem',
            }}>
              <ShieldCheck size={26} color="#f6c15b" weight="fill" style={{ flexShrink: 0 }} />
              <p style={{ margin: 0, color: '#fbe9c7', fontSize: '0.85rem', lineHeight: '1.4' }}>
                {t('station.privacyNotice')}
              </p>
            </div>

            {/* Tarjetas de Participantes y Roles */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(13.5rem, 1fr))', gap: '0.9rem' }}>
              {aliases.map((alias, idx) => {
                const role = assignedRoles[idx];
                const roleLabel = t(`coop.roles.${role}`) || ROLE_LABELS[role];
                const roleDesc = t(`station.roles.${role?.toLowerCase()}`);
                const isFirst = idx === 0;

                return (
                  <div
                    key={idx}
                    style={{
                      background: '#132338',
                      border: isFirst ? '2px solid #4a88cc' : '1px solid #33557d',
                      borderRadius: '0.8rem',
                      padding: '0.9rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#7cb5c8', fontWeight: 700, fontSize: '0.82rem' }}>
                        {t('station.cadetNumber', { num: idx + 1 })}
                      </span>
                      <span style={{
                        background: '#1b324d',
                        border: '1px solid #3b6394',
                        color: '#f6c15b',
                        borderRadius: '0.4rem',
                        padding: '0.15rem 0.45rem',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                      }}>
                        {ROLE_ICONS[role]} {roleLabel}
                      </span>
                    </div>

                    <input
                      type="text"
                      value={alias}
                      onChange={(e) => handleAliasChange(idx, e.target.value)}
                      placeholder={t('station.aliasPlaceholder', { num: idx + 1, example: SUGGESTED_ALIASES[idx] ?? 'Astro' })}
                      className="callsign-box__input"
                      maxLength={18}
                    />

                    <p style={{ margin: 0, color: '#b9d2ea', fontSize: '0.78rem', lineHeight: '1.35', flex: 1 }}>
                      {roleDesc}
                    </p>

                    {isFirst && (
                      <span style={{ color: '#69f0ae', fontSize: '0.75rem', fontWeight: 700, marginTop: '0.2rem' }}>
                         {t('coop.leadsTurn')}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Aviso de Liderazgo Rotativo */}
            <div style={{ background: '#0e1c2e', border: '1px solid #284465', borderRadius: '0.8rem', padding: '0.8rem 1rem', marginTop: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Compass size={22} color="#f6c15b" weight="fill" />
              <span style={{ fontSize: '0.85rem', color: '#bed5ea' }}>
                {t('station.turnRotationNotice', {
                  name: aliases[0]?.trim() || t('stationDefaults.cadet', { number: 1 }),
                  role: t(`coop.roles.${assignedRoles[0]}`) || ROLE_LABELS[assignedRoles[0]],
                })}
              </span>
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.8rem' }}>
              <button
                type="button"
                className="earth-screen__back-btn"
                onClick={() => setActiveTab('MISSION')}
              >
                <ArrowLeft weight="bold" />
                <span>{t('station.backBtn')}</span>
              </button>
              <button
                type="button"
                className="facility-card__btn facility-card__btn--gold"
                onClick={() => setActiveTab('LAUNCH')}
              >
                <span>{t('station.nextBtn')}</span>
                <ArrowRight weight="bold" />
              </button>
            </div>
          </div>
        )}

        {/* PESTAÑA 3: GUÍA COOPERATIVA Y DESPEGUE */}
        {activeTab === 'LAUNCH' && (
          <div>
            {/* Principios de la partida cooperativa */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(13rem, 1fr))', gap: '0.8rem', marginBottom: '1.2rem' }}>
              <div style={{ background: '#132338', border: '1px solid #33557d', borderRadius: '0.8rem', padding: '0.8rem' }}>
                <strong style={{ color: '#f6c15b', fontSize: '0.9rem', display: 'block', marginBottom: '0.2rem' }}>
                   {t('station.rules.consensusTitle')}
                </strong>
                <p style={{ margin: 0, color: '#bed4ea', fontSize: '0.8rem', lineHeight: '1.35' }}>
                  {t('station.rules.consensusDesc')}
                </p>
              </div>
              <div style={{ background: '#132338', border: '1px solid #33557d', borderRadius: '0.8rem', padding: '0.8rem' }}>
                <strong style={{ color: '#f6c15b', fontSize: '0.9rem', display: 'block', marginBottom: '0.2rem' }}>
                   {t('station.rules.rotationTitle')}
                </strong>
                <p style={{ margin: 0, color: '#bed4ea', fontSize: '0.8rem', lineHeight: '1.35' }}>
                  {t('station.rules.rotationDesc')}
                </p>
              </div>
              <div style={{ background: '#132338', border: '1px solid #33557d', borderRadius: '0.8rem', padding: '0.8rem' }}>
                <strong style={{ color: '#f6c15b', fontSize: '0.9rem', display: 'block', marginBottom: '0.2rem' }}>
                   {t('station.rules.buildingTitle')}
                </strong>
                <p style={{ margin: 0, color: '#bed4ea', fontSize: '0.8rem', lineHeight: '1.35' }}>
                  {t('station.rules.buildingDesc')}
                </p>
              </div>
              <div style={{ background: '#132338', border: '1px solid #33557d', borderRadius: '0.8rem', padding: '0.8rem' }}>
                <strong style={{ color: '#f6c15b', fontSize: '0.9rem', display: 'block', marginBottom: '0.2rem' }}>
                   {t('station.rules.localTitle')}
                </strong>
                <p style={{ margin: 0, color: '#bed4ea', fontSize: '0.8rem', lineHeight: '1.35' }}>
                  {t('station.rules.localDesc')}
                </p>
              </div>
            </div>

            {/* Resumen del Grupo Configurado */}
            <div style={{
              background: '#0d1c2d',
              border: '2px solid #2f5684',
              borderRadius: '0.9rem',
              padding: '1.1rem',
              marginBottom: '1rem',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.6rem' }}>
                <h3 style={{ margin: 0, fontFamily: 'Fredoka', fontSize: '1.2rem', color: '#ffffff' }}>
                  {cleanTeam || t('stationDefaults.unnamedTeam')} · <span style={{ color: '#f6c15b' }}>{roomCode}</span>
                </h3>
                <span style={{ background: '#19395f', color: '#88c8ff', padding: '0.2rem 0.6rem', borderRadius: '0.4rem', fontSize: '0.8rem', fontWeight: 700 }}>
                  {destination === 'MOON' ? ' Luna' : ' Marte'} · {city === 'AREQUIPA' ? 'Arequipa' : 'Tromsø'}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginTop: '0.6rem' }}>
                {cleanAliases.map((alias, idx) => {
                  const role = assignedRoles[idx];
                  return (
                    <span
                      key={idx}
                      style={{
                        background: '#15293f',
                        border: '1px solid #355883',
                        borderRadius: '0.5rem',
                        padding: '0.35rem 0.65rem',
                        fontSize: '0.82rem',
                        color: '#ffffff',
                      }}
                    >
                      <strong>{alias || t('stationDefaults.cadet', { number: idx + 1 })}</strong>: {ROLE_ICONS[role]} {t(`coop.roles.${role}`) || ROLE_LABELS[role]}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Errores de Validación */}
            {!isValid && (
              <div style={{
                background: 'rgba(244, 67, 54, 0.15)',
                border: '1px solid #f44336',
                borderRadius: '0.8rem',
                padding: '0.8rem 1rem',
                color: '#ffcdd2',
                fontSize: '0.85rem',
                marginBottom: '1rem',
              }}>
                {!isTeamValid && <p style={{ margin: '0.2rem 0' }}>• {t('station.errors.teamName')}</p>}
                {hasEmptyAlias && <p style={{ margin: '0.2rem 0' }}>• {t('station.errors.uniqueAliases')}</p>}
                {hasDuplicateAlias && <p style={{ margin: '0.2rem 0' }}>• {t('station.errors.uniqueAliases')}</p>}
              </div>
            )}

            {/* Acciones Finales */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.8rem', marginTop: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '0.6rem' }}>
                <button
                  type="button"
                  className="earth-screen__back-btn"
                  onClick={() => setActiveTab('CREW')}
                >
                  <ArrowLeft weight="bold" />
                  <span>{t('station.backBtn')}</span>
                </button>
                {onLaunchDemoSolo && (
                  <button
                    type="button"
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#8abde6',
                      textDecoration: 'underline',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      padding: '0.5rem',
                    }}
                    onClick={() => {
                      onClose();
                      onLaunchDemoSolo();
                    }}
                  >
                    {t('station.soloFallback')}
                  </button>
                )}
              </div>

              {onStartCoopFullRoute && (
                <button
                  type="button"
                  className="earth-action-btn"
                  disabled={!isValid}
                  style={{ opacity: isValid ? 1 : 0.5, cursor: isValid ? 'pointer' : 'not-allowed' }}
                  onClick={handleFullRoute}
                >
                  <Sparkle weight="fill" />
                  <span>{t('station.fullRouteBtn')}</span>
                </button>
              )}
              <button
                type="button"
                className="earth-action-btn"
                disabled={!isValid}
                style={{
                  opacity: isValid ? 1 : 0.5,
                  cursor: isValid ? 'pointer' : 'not-allowed',
                }}
                onClick={handleLaunchCoop}
              >
                <RocketLaunch weight="fill" />
                <span>{t('station.startMissionBtn')}</span>
                <Sparkle weight="fill" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}