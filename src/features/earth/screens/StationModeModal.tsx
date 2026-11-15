import { useState } from 'react';
import { X, UsersThree, ChalkboardTeacher, IdentificationCard, ShieldCheck, Play } from '@phosphor-icons/react';
import { useI18n, LanguageSelector } from '../../../i18n';
import './earth.css';

interface StationModeModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onLaunchDemoSolo: () => void;
}

type StationTab = 'TEACHER_ENTRY' | 'TEACHER_ROOM' | 'PARTICIPANTS' | 'ROLES' | 'COOP_BRIEFING';

export function StationModeModal({ isOpen, onClose, onLaunchDemoSolo }: StationModeModalProps) {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<StationTab>('TEACHER_ENTRY');
  const [classCode, setClassCode] = useState('NASA-2026');
  const [gradeLevel, setGradeLevel] = useState('grade5');
  const [students, setStudents] = useState<[string, string, string, string]>([
    'Camila R.',
    'Mateo S.',
    'Valeria T.',
    'Joaquín P.',
  ]);

  if (!isOpen) return null;

  return (
    <div className="station-modal-veil" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="station-modal" role="dialog" aria-modal="true" aria-labelledby="station-modal-title">
        <button type="button" className="station-modal__close" onClick={onClose} aria-label={t('common.close')}>
          <X size={20} weight="bold" />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.6rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <UsersThree size={32} color="#f6c15b" weight="fill" />
            <div>
              <h2 id="station-modal-title" style={{ fontFamily: 'Fredoka', fontSize: '1.6rem', color: '#ffffff', margin: 0 }}>
                {t('station.modalTitle')}
              </h2>
              <span style={{ fontSize: '0.85rem', color: '#7cb5c8', fontWeight: 700 }}>
                {t('station.mockup.subtitle')}
              </span>
            </div>
          </div>
          <LanguageSelector variant="hud" />
        </div>

        {/* Pestañas de navegación de la maqueta */}
        <div className="station-tabs" role="group" aria-label={t('station.mockup.navigation')}>
          <button
            type="button"
            className={`station-tab-btn ${activeTab === 'TEACHER_ENTRY' ? 'station-tab-btn--active' : ''}`}
            onClick={() => setActiveTab('TEACHER_ENTRY')}
          >
            {t('station.mockup.tabs.entry')}
          </button>
          <button
            type="button"
            className={`station-tab-btn ${activeTab === 'TEACHER_ROOM' ? 'station-tab-btn--active' : ''}`}
            onClick={() => setActiveTab('TEACHER_ROOM')}
          >
            {t('station.mockup.tabs.teacherRoom')}
          </button>
          <button
            type="button"
            className={`station-tab-btn ${activeTab === 'PARTICIPANTS' ? 'station-tab-btn--active' : ''}`}
            onClick={() => setActiveTab('PARTICIPANTS')}
          >
            {t('station.mockup.tabs.participants')}
          </button>
          <button
            type="button"
            className={`station-tab-btn ${activeTab === 'ROLES' ? 'station-tab-btn--active' : ''}`}
            onClick={() => setActiveTab('ROLES')}
          >
            {t('station.mockup.tabs.roles')}
          </button>
          <button
            type="button"
            className={`station-tab-btn ${activeTab === 'COOP_BRIEFING' ? 'station-tab-btn--active' : ''}`}
            onClick={() => setActiveTab('COOP_BRIEFING')}
          >
            {t('station.mockup.tabs.briefing')}
          </button>
        </div>

        {/* Contenido de cada pestaña */}
        {activeTab === 'TEACHER_ENTRY' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#f6c15b', marginBottom: '0.5rem' }}>
              <ChalkboardTeacher size={24} weight="fill" />
              <strong style={{ fontFamily: 'Fredoka', fontSize: '1.15rem' }}>{t('station.mockup.entryTitle')}</strong>
            </div>
            <p style={{ color: '#bed4ea', fontSize: '0.92rem' }}>
              {t('station.mockup.entryDescription')}
            </p>

            <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
              <div>
                <label htmlFor="station-class-code" style={{ display: 'block', color: '#ffffff', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.3rem' }}>
                  {t('station.mockup.classCode')}
                </label>
                <input
                  type="text"
                  id="station-class-code"
                  value={classCode}
                  onChange={(e) => setClassCode(e.target.value)}
                  className="callsign-box__input"
                  style={{ maxWidth: '16rem' }}
                />
              </div>

              <div>
                <label htmlFor="station-grade-level" style={{ display: 'block', color: '#ffffff', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.3rem' }}>
                  {t('station.mockup.gradeLevel')}
                </label>
                <select
                  value={gradeLevel}
                  id="station-grade-level"
                  onChange={(e) => setGradeLevel(e.target.value)}
                  className="callsign-box__input"
                  style={{ maxWidth: '24rem' }}
                >
                  <option value="grade34">{t('station.mockup.grades.grade34')}</option>
                  <option value="grade5">{t('station.mockup.grades.grade5')}</option>
                  <option value="grade6">{t('station.mockup.grades.grade6')}</option>
                  <option value="scienceClub">{t('station.mockup.grades.scienceClub')}</option>
                </select>
              </div>
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="facility-card__btn facility-card__btn--gold"
                onClick={() => setActiveTab('TEACHER_ROOM')}
              >
                <span>{t('station.mockup.nextTeacherRoom')}</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'TEACHER_ROOM' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#f6c15b', marginBottom: '0.5rem' }}>
              <ChalkboardTeacher size={24} weight="fill" />
              <strong style={{ fontFamily: 'Fredoka', fontSize: '1.15rem' }}>{t('station.mockup.teacherRoomTitle')}</strong>
            </div>
            <p style={{ color: '#bed4ea', fontSize: '0.92rem' }}>
              {t('station.mockup.teacherRoomDescription')}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(13rem, 1fr))', gap: '1rem', marginTop: '1rem' }}>
              <div style={{ background: '#132338', border: '1px solid #33557d', borderRadius: '0.8rem', padding: '1rem' }}>
                <strong style={{ color: '#ffffff' }}>{t('station.mockup.competencies.energyTitle')}</strong>
                <p style={{ margin: '0.4rem 0 0 0', color: '#bed4ea', fontSize: '0.85rem' }}>
                  {t('station.mockup.competencies.energyDescription')}
                </p>
              </div>
              <div style={{ background: '#132338', border: '1px solid #33557d', borderRadius: '0.8rem', padding: '1rem' }}>
                <strong style={{ color: '#ffffff' }}>{t('station.mockup.competencies.safetyTitle')}</strong>
                <p style={{ margin: '0.4rem 0 0 0', color: '#bed4ea', fontSize: '0.85rem' }}>
                  {t('station.mockup.competencies.safetyDescription')}
                </p>
              </div>
              <div style={{ background: '#132338', border: '1px solid #33557d', borderRadius: '0.8rem', padding: '1rem' }}>
                <strong style={{ color: '#ffffff' }}>{t('station.mockup.competencies.teamworkTitle')}</strong>
                <p style={{ margin: '0.4rem 0 0 0', color: '#bed4ea', fontSize: '0.85rem' }}>
                  {t('station.mockup.competencies.teamworkDescription')}
                </p>
              </div>
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.8rem' }}>
              <button type="button" className="earth-screen__back-btn" onClick={() => setActiveTab('TEACHER_ENTRY')}>{t('common.back')}</button>
              <button
                type="button"
                className="facility-card__btn facility-card__btn--gold"
                onClick={() => setActiveTab('PARTICIPANTS')}
              >
                <span>{t('station.mockup.nextParticipants')}</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'PARTICIPANTS' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#f6c15b', marginBottom: '0.5rem' }}>
              <IdentificationCard size={24} weight="fill" />
              <strong style={{ fontFamily: 'Fredoka', fontSize: '1.15rem' }}>{t('station.mockup.participantsTitle')}</strong>
            </div>
            <p style={{ color: '#bed4ea', fontSize: '0.92rem' }}>
              {t('station.mockup.participantsDescription')}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(12rem, 1fr))', gap: '1rem', marginTop: '1rem' }}>
              {students.map((student, idx) => (
                <div key={idx} style={{ background: '#132338', border: '1px solid #33557d', borderRadius: '0.8rem', padding: '1rem' }}>
                  <label htmlFor={`station-cadet-${idx + 1}`} style={{ display: 'block', color: '#f6c15b', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                    {t('station.mockup.cadetLabel', { number: idx + 1 })}
                  </label>
                  <input
                    type="text"
                    id={`station-cadet-${idx + 1}`}
                    value={student}
                    onChange={(e) => {
                      const next = [...students] as [string, string, string, string];
                      next[idx] = e.target.value;
                      setStudents(next);
                    }}
                    className="callsign-box__input"
                  />
                </div>
              ))}
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.8rem' }}>
              <button type="button" className="earth-screen__back-btn" onClick={() => setActiveTab('TEACHER_ROOM')}>{t('common.back')}</button>
              <button
                type="button"
                className="facility-card__btn facility-card__btn--gold"
                onClick={() => setActiveTab('ROLES')}
              >
                <span>{t('station.mockup.nextRoles')}</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'ROLES' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#f6c15b', marginBottom: '0.5rem' }}>
              <ShieldCheck size={24} weight="fill" />
              <strong style={{ fontFamily: 'Fredoka', fontSize: '1.15rem' }}>{t('station.mockup.rolesTitle')}</strong>
            </div>
            <p style={{ color: '#bed4ea', fontSize: '0.92rem' }}>
              {t('station.mockup.rolesDescription')}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(13rem, 1fr))', gap: '1rem', marginTop: '1rem' }}>
              <div style={{ background: '#1b324d', border: '1px solid #4d72b0', borderRadius: '0.8rem', padding: '1rem' }}>
                <span style={{ fontSize: '1.8rem' }}>👩‍🚀</span>
                <h4 style={{ margin: '0.3rem 0', color: '#ffffff', fontFamily: 'Fredoka' }}>Alba · {t('station.mockup.roleNames.commander')}</h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#7cb5c8', fontWeight: 700 }}>{t('station.mockup.assignedTo', { name: students[0] })}</p>
                <p style={{ margin: '0.4rem 0 0 0', fontSize: '0.82rem', color: '#bed4ea' }}>{t('station.mockup.roleDescriptions.commander')}</p>
              </div>

              <div style={{ background: '#1b324d', border: '1px solid #e0a548', borderRadius: '0.8rem', padding: '1rem' }}>
                <span style={{ fontSize: '1.8rem' }}>🤖</span>
                <h4 style={{ margin: '0.3rem 0', color: '#ffffff', fontFamily: 'Fredoka' }}>Chispa · {t('station.mockup.roleNames.energy')}</h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#f6c15b', fontWeight: 700 }}>{t('station.mockup.assignedTo', { name: students[1] })}</p>
                <p style={{ margin: '0.4rem 0 0 0', fontSize: '0.82rem', color: '#bed4ea' }}>{t('station.mockup.roleDescriptions.energy')}</p>
              </div>

              <div style={{ background: '#1b324d', border: '1px solid #9a7ac0', borderRadius: '0.8rem', padding: '1rem' }}>
                <span style={{ fontSize: '1.8rem' }}>🛰️</span>
                <h4 style={{ margin: '0.3rem 0', color: '#ffffff', fontFamily: 'Fredoka' }}>Aurora · {t('station.mockup.roleNames.science')}</h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#ba68c8', fontWeight: 700 }}>{t('station.mockup.assignedTo', { name: students[2] })}</p>
                <p style={{ margin: '0.4rem 0 0 0', fontSize: '0.82rem', color: '#bed4ea' }}>{t('station.mockup.roleDescriptions.science')}</p>
              </div>

              <div style={{ background: '#1b324d', border: '1px solid #67a995', borderRadius: '0.8rem', padding: '1rem' }}>
                <span style={{ fontSize: '1.8rem' }}>🌱</span>
                <h4 style={{ margin: '0.3rem 0', color: '#ffffff', fontFamily: 'Fredoka' }}>Nico · {t('station.mockup.roleNames.lifeSupport')}</h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#81c784', fontWeight: 700 }}>{t('station.mockup.assignedTo', { name: students[3] })}</p>
                <p style={{ margin: '0.4rem 0 0 0', fontSize: '0.82rem', color: '#bed4ea' }}>{t('station.mockup.roleDescriptions.lifeSupport')}</p>
              </div>
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.8rem' }}>
              <button type="button" className="earth-screen__back-btn" onClick={() => setActiveTab('PARTICIPANTS')}>{t('common.back')}</button>
              <button
                type="button"
                className="facility-card__btn facility-card__btn--gold"
                onClick={() => setActiveTab('COOP_BRIEFING')}
              >
                <span>{t('station.mockup.nextBriefing')}</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'COOP_BRIEFING' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#f6c15b', marginBottom: '0.5rem' }}>
              <Play size={24} weight="fill" />
              <strong style={{ fontFamily: 'Fredoka', fontSize: '1.15rem' }}>{t('station.mockup.briefingTitle')}</strong>
            </div>
            <p style={{ color: '#bed4ea', fontSize: '0.92rem' }}>
              {t('station.mockup.briefingDescription', { code: classCode })}
            </p>

            <div style={{
              background: '#132338',
              border: '1px solid #33557d',
              borderRadius: '0.8rem',
              padding: '1.2rem',
              marginTop: '1rem'
            }}>
              <p style={{ margin: 0, color: '#69f0ae', fontWeight: 700, fontSize: '1rem' }}>
                ✓ {t('station.mockup.previewReady')}
              </p>
              <p style={{ margin: '0.4rem 0 0 0', color: '#bed4ea', fontSize: '0.88rem' }}>
                {t('station.mockup.previewNotice')}
              </p>
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button type="button" className="earth-screen__back-btn" onClick={onClose}>
                {t('station.mockup.closePreview')}
              </button>
              <button
                type="button"
                className="earth-action-btn"
                onClick={() => {
                  onClose();
                  onLaunchDemoSolo();
                }}
              >
                <span>{t('station.mockup.launchSolo')}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
