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
  const [gradeLevel, setGradeLevel] = useState('5to Grado de Primaria (10-11 años)');
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
                Diseño para trabajo cooperativo en aulas escolares y equipos de 4 cadetes
              </span>
            </div>
          </div>
          <LanguageSelector variant="hud" />
        </div>

        {/* Pestañas de navegación de la maqueta */}
        <div className="station-tabs" role="tablist">
          <button
            type="button"
            className={`station-tab-btn ${activeTab === 'TEACHER_ENTRY' ? 'station-tab-btn--active' : ''}`}
            onClick={() => setActiveTab('TEACHER_ENTRY')}
          >
            E1. Entrada Docente
          </button>
          <button
            type="button"
            className={`station-tab-btn ${activeTab === 'TEACHER_ROOM' ? 'station-tab-btn--active' : ''}`}
            onClick={() => setActiveTab('TEACHER_ROOM')}
          >
            E2. Sala de Control
          </button>
          <button
            type="button"
            className={`station-tab-btn ${activeTab === 'PARTICIPANTS' ? 'station-tab-btn--active' : ''}`}
            onClick={() => setActiveTab('PARTICIPANTS')}
          >
            E3. Participantes
          </button>
          <button
            type="button"
            className={`station-tab-btn ${activeTab === 'ROLES' ? 'station-tab-btn--active' : ''}`}
            onClick={() => setActiveTab('ROLES')}
          >
            E4. Roles de Misión
          </button>
          <button
            type="button"
            className={`station-tab-btn ${activeTab === 'COOP_BRIEFING' ? 'station-tab-btn--active' : ''}`}
            onClick={() => setActiveTab('COOP_BRIEFING')}
          >
            E5. Inicio de Misión
          </button>
        </div>

        {/* Contenido de cada pestaña */}
        {activeTab === 'TEACHER_ENTRY' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#f6c15b', marginBottom: '0.5rem' }}>
              <ChalkboardTeacher size={24} weight="fill" />
              <strong style={{ fontFamily: 'Fredoka', fontSize: '1.15rem' }}>E1 · Acceso de Docentes y Facilitadores</strong>
            </div>
            <p style={{ color: '#bed4ea', fontSize: '0.92rem' }}>
              El docente configura una sesión local para proyectar en pizarra interactiva o trabajar en estaciones de aprendizaje compartidas.
            </p>

            <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
              <div>
                <label style={{ display: 'block', color: '#ffffff', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.3rem' }}>
                  Código de Aula / Misión:
                </label>
                <input
                  type="text"
                  value={classCode}
                  onChange={(e) => setClassCode(e.target.value)}
                  className="callsign-box__input"
                  style={{ maxWidth: '16rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', color: '#ffffff', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.3rem' }}>
                  Nivel Educativo:
                </label>
                <select
                  value={gradeLevel}
                  onChange={(e) => setGradeLevel(e.target.value)}
                  className="callsign-box__input"
                  style={{ maxWidth: '24rem' }}
                >
                  <option>3er y 4to Grado de Primaria (8-9 años)</option>
                  <option>5to Grado de Primaria (10-11 años)</option>
                  <option>6to Grado de Primaria (11-12 años)</option>
                  <option>Club de Ciencias / Taller de Robótica</option>
                </select>
              </div>
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="facility-card__btn facility-card__btn--gold"
                onClick={() => setActiveTab('TEACHER_ROOM')}
              >
                <span>Avanzar a Sala Docente (E2)</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'TEACHER_ROOM' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#f6c15b', marginBottom: '0.5rem' }}>
              <ChalkboardTeacher size={24} weight="fill" />
              <strong style={{ fontFamily: 'Fredoka', fontSize: '1.15rem' }}>E2 · Panel de Control Docente</strong>
            </div>
            <p style={{ color: '#bed4ea', fontSize: '0.92rem' }}>
              Configuración de objetivos pedagógicos STEM para la sesión de grupo.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(13rem, 1fr))', gap: '1rem', marginTop: '1rem' }}>
              <div style={{ background: '#132338', border: '1px solid #33557d', borderRadius: '0.8rem', padding: '1rem' }}>
                <strong style={{ color: '#ffffff' }}>Competencia STEM 1:</strong>
                <p style={{ margin: '0.4rem 0 0 0', color: '#bed4ea', fontSize: '0.85rem' }}>
                  Comprensión de la energía solar incidente y el aprovechamiento de recursos locales con NASA POWER.
                </p>
              </div>
              <div style={{ background: '#132338', border: '1px solid #33557d', borderRadius: '0.8rem', padding: '1rem' }}>
                <strong style={{ color: '#ffffff' }}>Competencia STEM 2:</strong>
                <p style={{ margin: '0.4rem 0 0 0', color: '#bed4ea', fontSize: '0.85rem' }}>
                  Pensamiento crítico en emergencias espaciales y mitigación de clima solar con NASA DONKI.
                </p>
              </div>
              <div style={{ background: '#132338', border: '1px solid #33557d', borderRadius: '0.8rem', padding: '1rem' }}>
                <strong style={{ color: '#ffffff' }}>Competencia STEM 3:</strong>
                <p style={{ margin: '0.4rem 0 0 0', color: '#bed4ea', fontSize: '0.85rem' }}>
                  Colaboración y distribución de roles complementarios bajo recursos finitos.
                </p>
              </div>
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.8rem' }}>
              <button type="button" className="earth-screen__back-btn" onClick={() => setActiveTab('TEACHER_ENTRY')}>Atrás</button>
              <button
                type="button"
                className="facility-card__btn facility-card__btn--gold"
                onClick={() => setActiveTab('PARTICIPANTS')}
              >
                <span>Avanzar a Participantes (E3)</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'PARTICIPANTS' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#f6c15b', marginBottom: '0.5rem' }}>
              <IdentificationCard size={24} weight="fill" />
              <strong style={{ fontFamily: 'Fredoka', fontSize: '1.15rem' }}>E3 · Registro de Cadetes del Equipo</strong>
            </div>
            <p style={{ color: '#bed4ea', fontSize: '0.92rem' }}>
              Ingresa los nombres de los 4 estudiantes que compartirán la misión desde este dispositivo:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(12rem, 1fr))', gap: '1rem', marginTop: '1rem' }}>
              {students.map((student, idx) => (
                <div key={idx} style={{ background: '#132338', border: '1px solid #33557d', borderRadius: '0.8rem', padding: '1rem' }}>
                  <label style={{ display: 'block', color: '#f6c15b', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                    Cadete {idx + 1}:
                  </label>
                  <input
                    type="text"
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
              <button type="button" className="earth-screen__back-btn" onClick={() => setActiveTab('TEACHER_ROOM')}>Atrás</button>
              <button
                type="button"
                className="facility-card__btn facility-card__btn--gold"
                onClick={() => setActiveTab('ROLES')}
              >
                <span>Asignar Roles (E4)</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'ROLES' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#f6c15b', marginBottom: '0.5rem' }}>
              <ShieldCheck size={24} weight="fill" />
              <strong style={{ fontFamily: 'Fredoka', fontSize: '1.15rem' }}>E4 · Asignación de Roles Cooperativos</strong>
            </div>
            <p style={{ color: '#bed4ea', fontSize: '0.92rem' }}>
              Cada participante asume una responsabilidad especializada durante las alertas de misión:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(13rem, 1fr))', gap: '1rem', marginTop: '1rem' }}>
              <div style={{ background: '#1b324d', border: '1px solid #4d72b0', borderRadius: '0.8rem', padding: '1rem' }}>
                <span style={{ fontSize: '1.8rem' }}>👩‍🚀</span>
                <h4 style={{ margin: '0.3rem 0', color: '#ffffff', fontFamily: 'Fredoka' }}>Alba · Comandante</h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#7cb5c8', fontWeight: 700 }}>Asignado a: {students[0]}</p>
                <p style={{ margin: '0.4rem 0 0 0', fontSize: '0.82rem', color: '#bed4ea' }}>Toma la decisión final de turno y arbitra empates de opinión.</p>
              </div>

              <div style={{ background: '#1b324d', border: '1px solid #e0a548', borderRadius: '0.8rem', padding: '1rem' }}>
                <span style={{ fontSize: '1.8rem' }}>🤖</span>
                <h4 style={{ margin: '0.3rem 0', color: '#ffffff', fontFamily: 'Fredoka' }}>Chispa · Oficial de Energía</h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#f6c15b', fontWeight: 700 }}>Asignado a: {students[1]}</p>
                <p style={{ margin: '0.4rem 0 0 0', fontSize: '0.82rem', color: '#bed4ea' }}>Monitorea el nivel de baterías y optimiza la orientación de paneles.</p>
              </div>

              <div style={{ background: '#1b324d', border: '1px solid #9a7ac0', borderRadius: '0.8rem', padding: '1rem' }}>
                <span style={{ fontSize: '1.8rem' }}>🛰️</span>
                <h4 style={{ margin: '0.3rem 0', color: '#ffffff', fontFamily: 'Fredoka' }}>Aurora · Oficial Científica</h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#ba68c8', fontWeight: 700 }}>Asignado a: {students[2]}</p>
                <p style={{ margin: '0.4rem 0 0 0', fontSize: '0.82rem', color: '#bed4ea' }}>Supervisa registros DONKI y activa protocolos de blindaje radiológico.</p>
              </div>

              <div style={{ background: '#1b324d', border: '1px solid #67a995', borderRadius: '0.8rem', padding: '1rem' }}>
                <span style={{ fontSize: '1.8rem' }}>🌱</span>
                <h4 style={{ margin: '0.3rem 0', color: '#ffffff', fontFamily: 'Fredoka' }}>Nico · Soporte Vital & Cultivos</h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#81c784', fontWeight: 700 }}>Asignado a: {students[3]}</p>
                <p style={{ margin: '0.4rem 0 0 0', fontSize: '0.82rem', color: '#bed4ea' }}>Vigila el balance de oxígeno, reciclaje de agua y crecimiento de plantas.</p>
              </div>
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.8rem' }}>
              <button type="button" className="earth-screen__back-btn" onClick={() => setActiveTab('PARTICIPANTS')}>Atrás</button>
              <button
                type="button"
                className="facility-card__btn facility-card__btn--gold"
                onClick={() => setActiveTab('COOP_BRIEFING')}
              >
                <span>Preparar Despegue Grupal (E5)</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'COOP_BRIEFING' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#f6c15b', marginBottom: '0.5rem' }}>
              <Play size={24} weight="fill" />
              <strong style={{ fontFamily: 'Fredoka', fontSize: '1.15rem' }}>E5 · Despegue y Coordinación Cooperativa</strong>
            </div>
            <p style={{ color: '#bed4ea', fontSize: '0.92rem' }}>
              ¡La tripulación escolar de <strong>{classCode}</strong> está configurada y lista! En la versión completa de aula, cada cadete interviene por turnos según su rol asignado.
            </p>

            <div style={{
              background: '#132338',
              border: '1px solid #33557d',
              borderRadius: '0.8rem',
              padding: '1.2rem',
              marginTop: '1rem'
            }}>
              <p style={{ margin: 0, color: '#69f0ae', fontWeight: 700, fontSize: '1rem' }}>
                ✓ Maqueta de Modo Estación validada con éxito.
              </p>
              <p style={{ margin: '0.4rem 0 0 0', color: '#bed4ea', fontSize: '0.88rem' }}>
                Para la competencia en vivo de NASA Space Apps 2026, puedes jugar ahora mismo la experiencia individual completa en modo Despegue.
              </p>
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button type="button" className="earth-screen__back-btn" onClick={onClose}>
                Cerrar Maqueta
              </button>
              <button
                type="button"
                className="earth-action-btn"
                onClick={() => {
                  onClose();
                  onLaunchDemoSolo();
                }}
              >
                <span>Iniciar Partida (Modo Despegue)</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
