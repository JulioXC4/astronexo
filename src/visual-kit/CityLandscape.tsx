import { useI18n } from '../i18n';

/** Decorative city preview in the same illustrated world as the preparation map. */
export function CityLandscape({ cityId }: { readonly cityId: string }) {
  const { t } = useI18n();
  const arctic = cityId === 'TROMSO';
  return <svg className="city-landscape" viewBox="0 0 1000 160" preserveAspectRatio="xMidYMid slice" role="img" aria-label={t(arctic ? 'a11y.landscapeArctic' : 'a11y.landscapeAndean')}>
    <rect width="1000" height="160" rx="12" fill={arctic ? '#294e64' : '#628995'}/>
    {arctic ? <>
      <path d="M0 75Q170 35 340 68T710 58 1000 49" fill="none" stroke="#8ad6c3" strokeWidth="17" opacity=".7"/>
      <path d="M0 101 145 52l100 31 150-55 155 75 155-44 135 37 160-41v105H0Z" fill="#d1e3dd"/>
      <path d="M0 125 190 87l150 25 180-49 190 49 290-37v85H0Z" fill="#82a6aa"/>
    </> : <>
      <circle cx="875" cy="42" r="24" fill="#f6c15b"/>
      <path d="M0 104 150 52l115 40 185-69 175 83 170-55 205 64v45H0Z" fill="#d3af88"/>
      <path d="M0 130 210 83l165 43 225-58 190 49 210-29v72H0Z" fill="#91a092"/>
    </>}
    <path d="M0 131Q250 113 485 131T1000 122v38H0Z" fill={arctic ? '#627f84' : '#7b8a69'}/>
    <path d="M455 121V91l45-17 45 17v30l-45 19Z" fill="#dfdfc8" stroke="#355b6b" strokeWidth="4"/>
    <path d="M447 91 500 70l53 21-53 19Z" fill={arctic ? '#dceae3' : '#bd7957'}/>
    <path d="M500 73V48" stroke="#e5e9da" strokeWidth="4"/><circle cx="500" cy="43" r="5" fill="#f6c15b"/>
    <path d="M0 155Q250 139 500 146T1000 151" fill="none" stroke="#354f57" strokeWidth="9"/>
  </svg>;
}
