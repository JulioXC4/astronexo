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
    suspended: 'PAUSET',
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
      playSoloBtn: 'Start i enkeltspillermodus',
    },
    sourcesDialog: {
      kicker: 'Vårt vitenskapelige fundament',
      title: 'Vitenskapelige kilder',
      desc: 'Vi benytter verifiserte historiske data fra NASA POWER for solinnstråling på jorden og NASA DONKI for romvær. Romressursene og konsekvensene er en pedagogisk simulering.',
      learnBtn: 'Åpne «Lær» vitenskapelig leksikon',
    },
    sources: {
      power: 'NASA POWER: Historiske soldata på jorden.',
      donki: 'NASA DONKI: Historisk oversikt over romværhendelser.',
      eclss: 'NASA ECLSS: Hvordan livsstøttesystemer i rommet fungerer.',
    },
  },

  cities: {
    title: 'Velg jordbasen din',
    subtitle: 'Velg mellom de to offisielle basene: Arequipa (Peru) eller Tromsø (Norge).',
    confirmBase: 'Bekreft base i {city}',
    historicalDates: 'Utvalgte historiske datoer · NASA POWER',
    threeDaysNote: 'Tre dager i 2024, ikke årsgjennomsnitt',
    arequipa: {
      name: 'Arequipa',
      country: 'Peru',
      description: 'Andinsk vulkansk høyslette på 2 325 moh. Høy direkte solinnstråling (5,60 til 6,17 kWh/m²/dag) og tynn fjelluft, ideelt for solcelletesting og hypoksi-tilvenning.',
      irradianceRange: '5,6028 til 6,174 kWh/m²/dag',
      specialty: 'Solinnstråling og høydetilvenning',
      badge: 'Andesfjellenes solbase',
    },
    tromso: {
      name: 'Tromsø',
      country: 'Norge',
      description: 'Arktisk kystklima ved 69,65°N. I mørketiden er solinnstrålingen ekstremt lav (0,003 til 0,04 kWh/m²/dag). Ideelt for nordlysforskning og mørketidssimulering.',
      irradianceRange: '0,0032 til 0,0401 kWh/m²/dag',
      specialty: 'Arktisk mørketid og romværsobservasjoner',
      badge: 'Nordlysobservatoriet',
    },
    metrics: {
      allSky: 'Total innstråling mot bakken (ALLSKY_SFC_SW_DWN)',
      clearness: 'Klarhetsindeks (KT)',
      solarHour: 'Middagstemperatur (T2M)',
      groundElevation: 'Høyde over havet: {elevation} m',
    },
  },

  destinations: {
    title: 'Hvor skal du reise?',
    subtitle: 'Velg mellom Månen eller Mars for romekspedisjonen.',
    travelTime: 'Reisetid',
    environmentalChallenges: 'Miljøutfordringer',
    confirmDestination: 'Bekreft reise til {dest}',
    moon: {
      name: 'Månen',
      distance: '384 400 km',
      travelDuration: '3 dager',
      gravity: '1/6 av jordens tyngdekraft',
      atmosphere: 'Ingen atmosfære (vakuum)',
      challenge: '14 dagers iskald månenatt (-130°C), kraftig kosmisk stråling.',
      missionObjective: 'Bygg en forskningsbase med et robust livsstøttesystem.',
    },
    mars: {
      name: 'Mars',
      distance: 'Gjennomsnittlig 225 000 000 km',
      travelDuration: '7 måneder',
      gravity: '3/8 av jordens tyngdekraft',
      atmosphere: 'Tynn CO2-atmosfære (1%)',
      challenge: 'Støvstormer, lang forsinkelse i samband, ekstrem kulde (-60°C).',
      missionObjective: 'Etabler en beboelig base for langvarig utforskning.',
    },
  },

  avatars: {
    title: 'Hvem er du?',
    subtitle: 'Velg astronauten som skal lede ekspedisjonen.',
    confirmAvatar: 'Bekreft valg av {name}',
    specialtyLabel: 'Spesialfelt',
    bioLabel: 'Biografi',
    alba: {
      name: 'Alba',
      role: 'Oppdragsleder & Solforsker',
      bio: 'Ekspert på solfysikk. Mester i å optimalisere solpaneler under krevende forhold.',
      specialty: 'Solenergi og ledelse',
    },
    chispa: {
      name: 'Chispa',
      role: 'Mekanisk Ingeniør',
      bio: 'Oppfinner og problemløser. Reparasjoner og vedlikehold gjøres på rekordtid.',
      specialty: 'Robotteknikk og reparasjoner',
    },
    sol: {
      name: 'Sol',
      role: 'ECLSS Livsstøttespesialist',
      bio: 'Ekspert på lukkede økologiske systemer, vannresirkulering og oksygenbalanse.',
      specialty: 'Oksygen- og vannresirkulering',
    },
    vega: {
      name: 'Vega',
      role: 'Romvær- og Strålingsforsker',
      bio: 'Overvåker NASA DONKI-varsler og beskytter mannskapet mot solstormer.',
      specialty: 'Strålingsvern og romværanalyse',
    },
  },

  briefing: {
    title: 'Oppdragsbriefing',
    subtitle: 'Før oppskytning må du fullføre tre treningsøkter på jordbasen.',
    rulesTitle: 'Oppdragsregler (RF-69)',
    rules: {
      limit: 'Du kan velge nøyaktig 3 av de 5 tilgjengelige treningsfasilitetene.',
      cost: 'Hver treningsøkt koster enten energi, tid eller ressurser.',
      rewards: 'Hver fullførte økt gir deg et spesialisert verktøy til bruk i rommet.',
      flight: 'Når tre økter er fullført, åpnes oppskytningen til rommet.',
    },
    startMapBtn: 'Gå til jordbasekartet',
  },

  map: {
    title: 'Jordbasekart',
    subtitle: 'Velg tre treningsøkter for å forberede deg til romferden.',
    facilitiesCompleted: '{completed} / {total} Fasiliteter fullført',
    energyReserve: 'Baseenergi',
    crewFatigue: 'Mannskapsbelastning',
    selectFacilityPrompt: 'Klikk på en bygning på kartet for å starte treningen.',
    costWarning: 'Denne økten koster: {cost}',
    rewardNotice: 'Belønning ved fullføring: {reward}',
    startMissionBtn: 'Start oppdrag: {name}',
    alreadyCompleted: 'Denne treningsøkten er allerede fullført.',
    maxReachedNotice: 'Du har fullført 3 oppdrag! Du er klar for oppskytning.',
    proceedToFlightBtn: 'Klar til oppskytning 🚀',
    facilities: {
      solarLab: 'Solenergilaboratoriet (Solar Detective / Solar Watch)',
      shieldLab: 'Strålingsskjoldlaboratoriet',
      eclssLab: 'ECLSS Livsstøttesenter',
      botanicalLab: 'Drivhus & Botanisk avdeling',
      roverHangar: 'Rover & Kjøretøyhangar',
    },
  },

  minigames: {
    solarDetective: {
      title: 'Sol-detektiven (Solar Detective)',
      cityContext: 'Arequipa solinnstråling med NASA POWER-data',
      instruction: 'Juster solcellepanelets vinkel for å fange mest mulig solenergi.',
      panelAngle: 'Panelvinkel',
      optimalNotice: 'Optimal vinkel! 100% solenergi fanges opp.',
      irradianceCaptured: 'Innstråling fange: {val} kWh/m²',
      efficiencyAchieved: 'Effektivitet: {val}%',
      targetMet: 'Oppdrag fullført! Solcelleverktøy mottatt.',
      completeBtn: 'Fullfør oppdrag',
    },
    solarWatch: {
      title: 'Tromsø Sol-vakt (Solar Watch)',
      cityContext: 'Tromsø mørketidsmålinger',
      instruction: 'Balanser batterireservene for å overleve polarnatten.',
      reserveBalance: 'Batterireserve: {val}%',
      completeBtn: 'Fullfør oppdrag',
    },
    darkMonths: {
      title: 'Mørketidssimulator (Dark Months)',
      instruction: 'Spar energi når solen ikke står opp.',
      completeBtn: 'Fullfør oppdrag',
    },
    altitudeAcclimatization: {
      title: 'Høydetilvenning (Altitude Acclimatization)',
      instruction: 'Kalibrer oksygentrykket for tynn luft.',
      completeBtn: 'Fullfør oppdrag',
    },
    eclssTraining: {
      title: 'ECLSS Livsstøttetrening',
      instruction: 'Optimaliser vann- og oksygengjenvinning.',
      completeBtn: 'Fullfør oppdrag',
    },
    veggieLab: {
      title: 'Plantedyrking (Veggie Lab)',
      instruction: 'Dyrk avlinger under krevende lysforhold.',
      completeBtn: 'Fullfør oppdrag',
    },
    arcticGreenhouse: {
      title: 'Arktisk drivhus (Arctic Greenhouse)',
      instruction: 'Oppretthold riktig temperatur og fuktighet i kulden.',
      completeBtn: 'Fullfør oppdrag',
    },
  },

  flight: {
    departureTitle: 'Oppskytning: Avreise mot rommet!',
    departureSubtitle: 'Forlater jordens atmosfære og setter kursen mot romdestinasjonen.',
    arrivalTitle: 'Vel fremme på {destination}!',
    arrivalSubtitle: 'Landingen var vellykket. Gjør deg klar til å bygge basen.',
    continueBtn: 'Gå til basebygging 🚀',
  },

  baseBuilder: {
    title: 'Basebygging i rommet (P10)',
    subtitle: 'Velg nøyaktig 3 av 5 moduler for å sikre basens overlevelse.',
    slotsAvailable: 'Byggede moduler: {used} / 3',
    confirmBaseBtn: 'Bekreft base & Start vaktperiode',
    modules: {
      solarExpansion: 'Solcelleutvidelse',
      radiationShield: 'Strålingsskjold',
      closedLoopWater: 'Lukket vannkretsløp',
      greenhouseModule: 'Drivhusmodul',
      emergencyBattery: 'Nødbatteribank',
    },
  },

  missionControl: {
    title: 'Oppdragskontroll (P11 & P12)',
    turnIndicator: 'Runde {current} av {total}',
    eventsTitle: 'NASA DONKI Romværvarsel',
    resourcesTitle: 'Basens ressurser',
    interventionsTitle: 'Nødtiltak (G1–G8)',
    nextTurnBtn: 'Gå til neste runde ⏭️',
    gameStatus: {
      nominal: 'NOMINELL (Alt i orden)',
      warning: 'ADVARSEL (Ustabilt)',
      critical: 'KRITISK (Fare)',
    },
  },

  interventions: {
    solarAlign: 'Juster solcellepaneler',
    shieldBoost: 'Forsterk strålingsskjold',
    waterRecycle: 'Rens vannkretsløp',
    cropNourish: 'Tilfør næring til avlinger',
    oxygenPurge: 'Skyll og rens oksygentanker',
    powerSave: 'Aktiver strømsparingsmodus',
    crewRest: 'Beordre hvile for mannskapet',
    repairHull: 'Reparer skrog og tetninger',
  },

  results: {
    victoryTitle: 'Oppdrag vellykket fullført! 🏆',
    partialTitle: 'Oppdrag avbrutt',
    scoreLabel: 'Poengsum:',
    finalReportTitle: 'Sluttrapport',
    returnHomeBtn: 'Vend tilbake til jorden 🌍',
    playAgainBtn: 'Spill på nytt',
  },

  return: {
    title: 'Velkommen hjem til jorden!',
    subtitle: 'Erfaringene dine vil hjelpe fremtidige romfarere.',
    learnMoreBtn: 'Lær mer om vitenskapen',
  },

  nextAdventure: {
    title: 'Neste eventyr venter',
    subtitle: 'Rommet har mange flere hemmeligheter å utforske.',
  },

  learn: {
    title: 'Lær: NASA Vitenskapelig kildeleksikon',
    subtitle: 'Verifiserte data fra NASA POWER, DONKI og ECLSS.',
    closeBtn: 'Lukk',
  },

  station: {
    modalTitle: 'Klasseromsmodus (Modo Estación)',
    roleCaptain: 'Oppdragsleder (Kaptein)',
    roleEngineer: 'Ingeniør',
    roleScientist: 'Forsker',
    roleDoctor: 'Lege',
  },

  languageSelector: {
    label: 'Språk:',
    selectAriaLabel: 'Velg spillspråk',
    draftNotice: 'Pedagogisk utkast · Venter på endelig språklig kvalitetssikring',
  },
};
