import type { ToolId } from '../game/contracts';
import { useI18n } from '../i18n';

export function ToolSprite({ id }: { readonly id: ToolId }) {
  const { t } = useI18n();
  return <svg className="tool-sprite" viewBox="0 0 64 64" role="img" aria-label={t(`tools.${id}.label`)}>
    <path d="M5 48 32 59l27-11V17L32 6 5 17Z" fill="#193c55" stroke="#bddbd4" strokeWidth="3"/>
    {id === 'FOLDING_PANELS' && <><path d="M9 25 28 18v23L9 48Zm27-7 19 7v23l-19-7Z" fill="#336d86" stroke="#b7ddeb" strokeWidth="2"/><path d="M17 22v23m10-27v23m9-23v23m10-19v23M9 35l19-7m8 0 19 7" stroke="#9fcbdb" strokeWidth="2"/><circle cx="32" cy="10" r="5" fill="#f6c15b"/></>}
    {id === 'LIFE_SUPPORT' && <><rect x="13" y="17" width="15" height="34" rx="7" fill="#8ec9d0" stroke="#d8efe7" strokeWidth="2"/><rect x="36" y="17" width="15" height="34" rx="7" fill="#8ec9d0" stroke="#d8efe7" strokeWidth="2"/><path d="M20 17v-5m23 5v-5M17 32h7m16 0h7" stroke="#e5f3e9" strokeWidth="3"/></>}
    {id === 'SHELTER_KIT' && <><path d="M32 14 50 22v15Q45 49 32 55 19 49 14 37V22Z" fill="#8fbba4" stroke="#e3efdf" strokeWidth="3"/><path d="M32 18v31M18 31h28" stroke="#3c706f" strokeWidth="4"/></>}
    {id === 'CROP_KIT' && <><path d="M13 43h38l-6 10H19Z" fill="#a77858"/><path d="M32 44V22m-1 15q-17-4-15-15 13-1 15 13m2-6q4-14 18-13 0 14-18 16" fill="#72bd80" stroke="#3d7559" strokeWidth="2"/></>}
  </svg>;
}
