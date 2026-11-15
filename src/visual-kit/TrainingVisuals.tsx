import './training-visuals.css';

export interface SolarCircuitVisualProps {
  readonly panelActive?: boolean;
  readonly switchOn?: boolean;
  readonly charge?: number;
  readonly circuitComplete?: boolean;
  readonly tiltAngle?: number;
}

export function SolarCircuitVisual({ panelActive = false, switchOn = false, charge = 0, circuitComplete = false, tiltAngle = 16 }: SolarCircuitVisualProps) {
  const safeCharge = Math.max(0, Math.min(100, charge));
  return <svg className={`training-visual ${circuitComplete ? 'training-visual--complete' : ''}`} viewBox="0 0 700 380" role="img" aria-label={`Circuito solar: panel ${panelActive ? 'captando' : 'sin captar'}, interruptor ${switchOn ? 'encendido' : 'apagado'}, batería ${safeCharge}%`}>
    <rect width="700" height="380" rx="20" fill="#2a5568"/><path d="M0 307 350 272l350 35v73H0Z" fill="#213e50"/><path d="M40 286 350 251l310 35" fill="none" stroke="#d2b88d" strokeWidth="8"/>
    <circle cx="138" cy="71" r="30" fill="#f6c15b"/><path d="M138 14v15M79 71h15m87 0h15m-100-40 11 11m83-11-11 11" stroke="#f9d78e" strokeWidth="5" strokeLinecap="round"/>
    <g transform={`rotate(${(tiltAngle - 16) * .3} 190 195)`}><path d="M85 142 264 124l36 121-185 26Z" fill="#122f48" stroke="#e0e9dc" strokeWidth="8"/><path d="M97 171 274 151M104 207 285 184M113 240 294 216M149 134l27 127m31-132 27 126" stroke="#69a9bf" strokeWidth="5"/></g>
    <path d="M246 266v34h140v-62" fill="none" stroke={switchOn ? '#f6c15b' : '#84939a'} strokeWidth="8" strokeLinecap="round"/>
    <rect x="350" y="170" width="74" height="75" rx="10" fill="#d7c9aa" stroke="#345768" strokeWidth="6"/><circle cx="387" cy="207" r="14" fill={switchOn ? '#f6c15b' : '#577588'}/><path d={switchOn ? 'M387 206v-26' : 'M387 206l20-19'} stroke="#284657" strokeWidth="6" strokeLinecap="round"/>
    <path d="M424 207h64v89h39" fill="none" stroke={switchOn ? '#f6c15b' : '#84939a'} strokeWidth="8" strokeLinecap="round"/>
    <rect x="513" y="212" width="132" height="105" rx="14" fill="#d6e3da" stroke="#2a5365" strokeWidth="7"/><rect x="542" y="195" width="74" height="17" rx="5" fill="#d6e3da"/>
    <rect x="532" y="238" width="94" height="43" rx="5" fill="#31566c"/><rect x="538" y="244" width={Math.round(safeCharge * .82)} height="31" rx="3" fill={circuitComplete ? '#8adca8' : '#f6c15b'}/><path d="M553 298h15m56 0h-15" stroke="#31566c" strokeWidth="6"/>
    {panelActive && <path d="M143 91 179 126m-15-36 35 31m-10-43 33 35" stroke="#ffdd85" strokeWidth="5" strokeLinecap="round"/>}
    {circuitComplete && <circle cx="657" cy="69" r="25" fill="#3c906b" stroke="#e1f6df" strokeWidth="4"/>}
    {circuitComplete && <path d="m646 69 8 8 15-17" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round"/>}
  </svg>;
}

export interface StormShelterVisualProps {
  readonly alert?: boolean;
  readonly doorClosed?: boolean;
  readonly crewSafe?: boolean;
  readonly crewEvacuated?: boolean;
}

export function StormShelterVisual({ alert = false, doorClosed = false, crewSafe = false, crewEvacuated = false }: StormShelterVisualProps) {
  return <svg className={`training-visual ${alert ? 'training-visual--alert' : ''}`} viewBox="0 0 700 380" role="img" aria-label={`Refugio de tormentas: alarma ${alert ? 'activa' : 'en espera'}, compuerta ${doorClosed ? 'cerrada' : 'abierta'}, tripulación ${crewSafe ? 'protegida' : crewEvacuated ? 'en refugio sin sellar' : 'fuera del refugio'}`}>
    <rect width="700" height="380" rx="20" fill="#294b64"/><path d="M0 285 350 258l350 27v95H0Z" fill="#385666"/><path d="M88 254v-96q10-91 262-93t262 93v96l-262 60Z" fill="#88a9a9" stroke="#d9e5d8" strokeWidth="9"/><path d="M110 236v-78q10-72 240-72t240 72v78l-240 55Z" fill="#436c80"/>
    <path d="M110 221 350 277l240-56" fill="none" stroke="#b7cfca" strokeWidth="8"/><path d="M178 104v125m344-125v125" stroke="#86aeb0" strokeWidth="11"/>
    <rect x="273" y="128" width="154" height="133" rx="66" fill="#172f43" stroke="#c6dcd4" strokeWidth="10"/>
    {!doorClosed && <path d="M301 162v75m98-75v75" stroke="#688f99" strokeWidth="8"/>}
    <g transform={crewEvacuated ? 'translate(0 0)' : 'translate(-100 76)'}><circle cx="334" cy="175" r="14" fill="#ecc8aa"/><path d="M316 214q0-28 18-28t18 28v18h-36Z" fill="#d2e0d7"/></g>
    <g transform={crewEvacuated ? 'translate(0 0)' : 'translate(100 76)'}><circle cx="370" cy="176" r="14" fill="#b88768"/><path d="M352 215q0-28 18-28t18 28v18h-36Z" fill="#e4b870"/></g>
    {doorClosed && <><rect x="287" y="137" width="126" height="109" rx="55" fill="#456c7d" stroke="#d9e9dd" strokeWidth="7"/><path d="M350 139v104M290 190h120" stroke="#bfd5cf" strokeWidth="8"/><circle cx="350" cy="190" r="23" fill="#3f6c7b" stroke="#dfebdb" strokeWidth="5"/></>}
    <path d="M97 273 350 327l253-54" fill="none" stroke="#263f50" strokeWidth="13"/><rect x="73" y="183" width="67" height="50" rx="9" fill="#244859" stroke="#c7ded3" strokeWidth="5"/><circle cx="106" cy="208" r="12" fill={alert ? '#ee7f67' : '#7ecda9'}/>
    <path d="M604 130h42v102h-42Z" fill="#c6d9ce" stroke="#345969" strokeWidth="5"/><rect x="610" y="151" width="30" height="46" rx="4" fill={crewSafe ? '#6fcca0' : alert ? '#ee896a' : '#85b2bd'}/><path d="M617 214h17" stroke="#426d75" strokeWidth="5"/>
    {alert && <path d="M98 119q-26-25 0-50m22 50q26-25 0-50" fill="none" stroke="#f8ad79" strokeWidth="5" strokeLinecap="round"/>}
  </svg>;
}
