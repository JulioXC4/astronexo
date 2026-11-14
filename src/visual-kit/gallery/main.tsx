import { createRoot } from 'react-dom/client';
import { useState } from 'react';
import { AnimatedSprite, CharacterDialogue, GameScene, GameSprite, InteractiveHotspot, PixelButton, PixelInventory, ResourceIndicator, SceneTransition, visualAssets } from '../index';
import './gallery.css';

function Gallery() {
  const [selected, setSelected] = useState('city.arequipa');
  return <main className="gallery"><header><p>Laboratorio visual · Software 2</p><h1>Galería de assets</h1><p>Referencias del PDF pendientes de autoría, licencia y archivos originales. Esta página no cambia el juego.</p><a href="/">Volver al juego</a></header>
    <section><h2>Mapas y destinos</h2><GameScene asset="destination.moon"><span className="gallery__badge">Placeholder de escenario</span></GameScene><div className="gallery__hotspots"><InteractiveHotspot label="Arequipa" selected={selected === 'city.arequipa'} onClick={() => setSelected('city.arequipa')} /><InteractiveHotspot label="Tromsø" selected={selected === 'city.tromso'} onClick={() => setSelected('city.tromso')} /></div></section>
    <section><h2>Personajes, robots y objetos</h2><div className="gallery__grid">{visualAssets.filter(a => ['characters','robots','inventory','earth'].includes(a.category)).map(a => <article key={a.id}><AnimatedSprite asset={a} /><strong>{a.label}</strong><small>Página {a.sourcePage ?? 'pendiente'} · {a.path ? 'integrado' : 'pendiente'}</small></article>)}</div></section>
    <section><h2>Interfaz y minijuegos</h2><div className="gallery__grid">{visualAssets.filter(a => ['ui','minigames','animations'].includes(a.category)).map(a => <article key={a.id}><GameSprite asset={a} /><strong>{a.label}</strong><small>{a.path ? 'Integrado' : 'Pendiente'}</small></article>)}</div><div className="gallery__demo"><ResourceIndicator label="Energía" value={68} color="#f6c15b"/><ResourceIndicator label="Oxígeno" value={82}/><ResourceIndicator label="Escudo" value={44} color="#aab7f2"/><PixelInventory items={[{id:'panels',label:'Paneles',asset:'minigame.solar'},{id:'shelter',label:'Refugio',asset:'minigame.storm'}]}/><SceneTransition><CharacterDialogue portrait="character.scientist" name="Científica">Aquí aparecerá el diálogo cuando diseño entregue el retrato original.</CharacterDialogue></SceneTransition><PixelButton type="button" onClick={() => setSelected(selected === 'city.arequipa' ? 'city.tromso' : 'city.arequipa')}>Probar selección</PixelButton></div></section>
  </main>;
}

createRoot(document.getElementById('visual-gallery-root')!).render(<Gallery />);
