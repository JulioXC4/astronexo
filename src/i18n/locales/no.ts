import type { DeepPartial } from '../types';
import type { en } from './en';
/**
 * Pedagogisk utkast i Norsk Bokmål.
 *
 * LINGVISTISK KVALITETSNOTAT:
 * Denne filen representerer et pedagogisk oversettelsesforslag for Norsk Bokmål.
 * Den er markert som UTKAST (isDraft: true) i påvente av endelig kvalitetssikring
 * av morsmålsbrukere. Tekniske NASA-termer og identifikatorer bevares uendret.
 */
export const no = {
    common: {
        back: 'Tilbake',
        continue: 'Fortsett',
        close: 'Lukk',
        cancel: 'Avbryt',
        confirm: 'Bekreft',
        reset: 'Tilbakestill',
        available: 'Tilgjengelig',
        completed: 'Fullført',
        locked: 'Låst',
        selected: 'Valgt',
        energy: 'Energi',
        oxygen: 'Oksygen',
        shield: 'Skjold',
        food: 'Mat',
        foodSupply: 'Matforsyning',
        science: 'Vitenskap',
        radiation: 'Stråling',
        radiationExposure: 'Strålingseksponering',
        solarEfficiency: 'Soleffektivitet',
        days: 'dager',
        hours: 'timer',
        minutes: 'minutter',
        stepOf: 'Trinn {current} av {total}',
        loading: 'Laster...',
        online: 'PÅKOBLET',
        pending: 'VENTER',
        active: 'AKTIV',
        suspended: 'PAUSET'
    },
    welcome: {
        title: 'Junior Astronaut',
        subtitle: 'Fra din himmel til andre verdener',
        playNow: 'Spill nå',
        stationMode: 'Klasseromsmodus',
        scientificSources: 'Vitenskapelige kilder',
        stationDialog: {
            kicker: 'Kommer snart',
            title: 'Klasseromsmodus',
            desc: 'Et pedagogisk opplegg utviklet for lagspill på felles storskjerm. Ingen flerspillerserver ennå.',
            classroomBtn: 'Utforsk klasseromsopplegget (E1–E5)',
            playSoloBtn: 'Start i enkeltspillermodus'
        },
        sourcesDialog: {
            kicker: 'Vårt vitenskapelige fundament',
            title: 'Vitenskapelige kilder',
            desc: 'Vi benytter verifiserte historiske data fra NASA POWER for solinnstråling på jorden og NASA DONKI for romvær. Romressursene og konsekvensene er en pedagogisk simulering.',
            learnBtn: 'Åpne «Lær» vitenskapelig leksikon'
        },
        sources: {
            power: 'NASA POWER: Historiske soldata på jorden.',
            donki: 'NASA DONKI: Historisk oversikt over romværhendelser.',
            eclss: 'NASA ECLSS: Hvordan livsstøttesystemer i rommet fungerer.'
        }
    },
    cities: {
        stepIndicator: 'Trinn 1 av 6 · Valg av jordbase (V3.0-krav)',
        title: 'Velg jordbasen din',
        subtitle: 'Velg mellom de to offisielle basene: Arequipa (Peru) eller Tromsø (Norge).',
        confirmBase: 'Bekreft base i {city}',
        historicalDates: 'Utvalgte historiske datoer · NASA POWER',
        threeDaysNote: 'Tre dager i 2024, ikke årsgjennomsnitt',
        arequipa: {
            name: 'Arequipa',
            country: 'Peru',
            description: 'Andinsk vulkansk høyslette på 2 325 moh. Høy direkte solinnstråling (5,60 til 6,17 kWh/m²/dag) og tynn fjelluft, ideelt for solcelletesting og hypoksi-tilvenning.',
            irradianceRange: '5,6028 til 6,174 kWh/m²/dag'
        },
        tromso: {
            name: 'Tromsø',
            country: 'Norge',
            description: 'Arktisk kystklima ved 69,65°N. I mørketiden er solinnstrålingen ekstremt lav (0,003 til 0,04 kWh/m²/dag). Ideelt for nordlysforskning og mørketidssimulering.',
            irradianceRange: '0,0032 til 0,0401 kWh/m²/dag'
        }
    },
    destinations: {
        stepIndicator: 'Trinn 2 av 6 · Valg av romdestinasjon',
        title: 'Hvor skal du reise?',
        subtitle: 'Velg mellom Månen eller Mars for romekspedisjonen.',
        moon: {
            name: 'Månen',
            gravity: '1/6 av jordens tyngdekraft',
            atmosphere: 'Ingen atmosfære (vakuum)'
        },
        mars: {
            name: 'Mars',
            gravity: '3/8 av jordens tyngdekraft',
            atmosphere: 'Tynn CO2-atmosfære (1%)'
        }
    },
    avatars: {
        stepIndicator: 'Trinn 3 av 6 · Velg astronaut',
        title: 'Hvem er du?',
        subtitle: 'Velg astronauten som skal lede ekspedisjonen.'
    },
    briefing: {
        stepIndicator: 'Trinn 4 av 6 · Oppdragsbriefing',
        title: 'Oppdragsbriefing'
    },
    minigames: {
        solarDetective: {
            title: 'Sol-detektiven (Solar Detective)'
        },
        solarWatch: {
            title: 'Tromsø Sol-vakt (Solar Watch)'
        },
        darkMonths: {
            title: 'Mørketidssimulator (Dark Months)'
        }
    },
    baseBuilder: {
        title: 'Basebygging i rommet (P10)',
        subtitle: 'Velg nøyaktig 3 av 5 moduler for å sikre basens overlevelse.',
        confirmBaseBtn: 'Bekreft base & Start vaktperiode'
    },
    results: {
        scoreLabel: 'Poengsum:',
        finalReportTitle: 'Sluttrapport'
    },
    nextAdventure: {
        title: 'Neste eventyr venter',
        subtitle: 'Rommet har mange flere hemmeligheter å utforske.'
    },
    learn: {
        title: 'Lær: NASA Vitenskapelig kildeleksikon',
        subtitle: 'Verifiserte data fra NASA POWER, DONKI og ECLSS.'
    },
    languageSelector: {
        draftNotice: 'Pedagogisk utkast · Venter på endelig språklig kvalitetssikring'
    }
} satisfies DeepPartial<typeof en>;
