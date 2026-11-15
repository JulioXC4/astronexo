import type { DeepPartial } from '../types';
import type { en } from './en';
/**
 * Borrador pedagógico en Quechua Sureño (Runasimi / Qhichwa - variedad Chanka / Collao).
 *
 * NOTA DE CALIDAD LINGÜÍSTICA:
 * Este archivo representa una propuesta de traducción pedagógica para quechua sureño.
 * Se encuentra en estado BORRADOR (isDraft: true), pendiente de validación formal
 * por lingüistas nativos y educadores interculturales bilingües.
 * Los términos técnicos aeroespaciales e identificadores se preservan con apoyo bilingüe.
 */
export const qu = {
    common: {
        back: 'Kutiy',
        continue: 'Ñawpariy',
        close: 'Wichqay',
        cancel: 'Tatikuy',
        confirm: 'Taqyaychay',
        reset: 'Musuqmanta qallariy',
        available: 'Kachkan',
        completed: 'Tukusqa',
        locked: 'Wichqasqa',
        selected: 'Akllasqa',
        energy: 'Kallpa (Energía)',
        oxygen: 'Samana (Oxígeno)',
        shield: 'Amachana (Escudo)',
        food: 'Mikhuna (Alimentos)',
        foodSupply: 'Mikhuy qullqa',
        science: 'Hamut\'ay (Ciencia)',
        radiation: 'Illanchay (Radiación)',
        radiationExposure: 'Illanchay tupuy',
        solarEfficiency: 'Inti kallpa allin kaynin',
        days: 'punchawkuna',
        hours: 'urakuna',
        minutes: 'chinikuna',
        stepOf: 'Rikch\'an {current} manta {total}',
        loading: 'Kargachkan...',
        online: 'KALLPACHASQA',
        pending: 'SUYACHKAN',
        active: 'LLAMK\'ACHKAN',
        suspended: 'SAYACHISQA'
    },
    welcome: {
        title: 'Sullk\'a Wiraqucha (Astronauta Junior)',
        subtitle: 'Hanaq pachaykimanta wakin teqsimuyukunaman',
        playNow: 'Pukllay kunan',
        stationMode: 'Yachay Wasi Pukllay (Modo Estación)',
        scientificSources: 'Hamut\'ay pukyunkuna (Fuentes científicas)',
        stationDialog: {
            kicker: 'Hamuq kawsaypi',
            title: 'Yachay Wasi Pukllay',
            desc: 'Yachaqkunapaq kuska pukllana hatun qhawapayanapi. Manaraqmi achka pukllaq llikachu.',
            classroomBtn: 'Yachay wasi qhawariyta kichay (E1–E5)',
            playSoloBtn: 'Sapallayki puririyta qallariy'
        },
        sourcesDialog: {
            kicker: 'Hamut\'ayninchikpa Tiksin',
            title: 'Hamut\'ay Pukyunkuna',
            desc: 'NASA POWER chiqap willayninkunatam llamk\'achinchik Inti k\'anchaymanta, hinallataq NASA DONKI hanaq pacha wayramanta.',
            learnBtn: '«Yachay» Hamut\'ay Qillqasqata kichay'
        },
        sources: {
            power: 'NASA POWER: Kay pachapi Inti kallpamanta unay willaykuna.',
            donki: 'NASA DONKI: Hanaq pacha wayra willaykuna.',
            eclss: 'NASA ECLSS: Kawsay amachana llika hanaq pachapi.'
        }
    },
    cities: {
        stepIndicator: 'Rikch\'an 1 manta 6 · Kay Pacha Qullqa Akllay',
        title: 'Kay Pacha Qullqata Akllay',
        subtitle: 'Iskay chiqan qullqamanta akllay: Ariqipa (Perú) icha Tromsø (Noruega).',
        confirmBase: '{city} qullqata taqyaychay',
        historicalDates: 'NASA POWER chiqap punchawkuna',
        threeDaysNote: '2024 watapi kimsa punchawkuna, manam wata chawpichu',
        arequipa: {
            name: 'Ariqipa',
            country: 'Perú',
            description: 'Urqukunapa pata pachan 2,325 m hanaqpi. Intipa k\'anchayninqa ancha kallpasapam (5.60 - 6.17 kWh/m²/punchaw). Allinmi inti llika yachapaypaq.',
            irradianceRange: '5.6028 - 6.174 kWh/m²/punchaw'
        },
        tromso: {
            name: 'Tromsø',
            country: 'Noruega',
            description: 'Chiri pacha 69.65°N suyupi. Tutayay punchawkunapi intipa k\'anchayninqa pisillam (0.003 - 0.04 kWh/m²/punchaw). Allinmi tutayaq kawsay yachapaypaq.',
            irradianceRange: '0.0032 - 0.0401 kWh/m²/punchaw'
        }
    },
    destinations: {
        stepIndicator: 'Rikch\'an 2 manta 6 · Hanaq Pacha Purina Akllay',
        title: 'Maymanmi Rinki?',
        subtitle: 'Killa icha Atipaq (Marte) purinata akllay.',
        moon: {
            name: 'Killa (Luna)',
            gravity: '1/6 Kay Pachamanta',
            atmosphere: 'Manam wayran kanchu (Ch\'usaq)'
        },
        mars: {
            name: 'Atipaq (Marte)',
            gravity: '3/8 Kay Pachamanta',
            atmosphere: 'Llamp\'u CO2 wayra (1%)'
        }
    },
    avatars: {
        stepIndicator: 'Rikch\'an 3 manta 6 · Qhawaq Akllay',
        title: 'Pitaq Kanki?',
        subtitle: 'Hanaq pacha llamk\'aqniykita akllay.'
    },
    briefing: {
        stepIndicator: 'Rikch\'an 4 manta 6 · Purina Willakuy',
        title: 'Purina Willakuy'
    },
    minigames: {
        solarDetective: {
            title: 'Inti Qhawaq (Solar Detective)'
        },
        solarWatch: {
            title: 'Tromsø Inti Qhawaq (Solar Watch)'
        },
        darkMonths: {
            title: 'Tutayaq Killakuna (Dark Months Simulator)'
        }
    },
    baseBuilder: {
        title: 'Hanaq Pacha Qullqa Sayarichiy (P10)',
        subtitle: '5 wasikunamanta 3 wasillatam akllay sayarichinaykipaq.',
        confirmBaseBtn: 'Qullqata Taqyaychay & Guardiaman Riy'
    },
    results: {
        scoreLabel: 'Puntuación:',
        finalReportTitle: 'Tukuynin Willakuy'
    },
    nextAdventure: {
        title: 'Qatiq Purinakuna',
        subtitle: 'Hanaq pachaqa qamllatam suyasunki.'
    },
    learn: {
        title: 'Yachay: NASA Hamut\'ay Pukyu Qillqasqa',
        subtitle: 'NASA POWER, DONKI, ECLSS chiqap willayninkuna.'
    },
    languageSelector: {
        draftNotice: 'Borrador pedagógico · Pendiente de validación lingüística'
    }
} satisfies DeepPartial<typeof en>;
