/**
 * Mensajes traducibles que el motor y los datos guardan dentro del estado.
 *
 * El estado de la partida (`MissionState`, `GameSetup`…) es serializable y no
 * conoce el idioma: si guardara el texto ya traducido, cambiar de idioma a mitad
 * de la partida dejaría frases viejas en el idioma anterior. Por eso el motor guarda
 * una referencia a la clave del diccionario (`msg`) y la pantalla la traduce al
 * dibujarla (`resolveMessage`), siempre en el idioma que el jugador tiene activo.
 *
 * Una referencia es un texto normal con la forma `⟦clave|{"param":valor}⟧`; puede ir
 * sola o incrustada en una frase, y sus parámetros pueden ser otras referencias.
 * Un texto sin referencias se devuelve igual, así que es seguro aplicarlo a todo.
 */
const OPEN = '⟦';
const CLOSE = '⟧';

export type MessageParams = Readonly<Record<string, string | number>>;
export type Translator = (key: string, params?: Record<string, string | number>) => string;

export function msg(key: string, params?: MessageParams): string {
  const hasParams = params !== undefined && Object.keys(params).length > 0;
  return `${OPEN}${key}${hasParams ? `|${JSON.stringify(params)}` : ''}${CLOSE}`;
}

export function hasMessage(text: string): boolean {
  return text.includes(OPEN);
}

function matchingClose(text: string, open: number): number {
  let depth = 0;
  for (let index = open; index < text.length; index += 1) {
    if (text[index] === OPEN) depth += 1;
    else if (text[index] === CLOSE) {
      depth -= 1;
      if (depth === 0) return index;
    }
  }
  return -1;
}

function resolveOne(body: string, t: Translator): string {
  const separator = body.indexOf('|');
  if (separator < 0) return t(body);
  const key = body.slice(0, separator);
  try {
    const raw = JSON.parse(body.slice(separator + 1)) as Record<string, string | number>;
    const params: Record<string, string | number> = {};
    for (const [name, value] of Object.entries(raw)) {
      params[name] = typeof value === 'string' ? resolveMessage(value, t) : value;
    }
    return t(key, params);
  } catch {
    return t(key);
  }
}

/** Traduce todas las referencias que haya dentro de `text` con el traductor `t` del idioma activo. */
export function resolveMessage(text: string, t: Translator): string {
  if (!text.includes(OPEN)) return text;
  let output = '';
  let cursor = 0;
  while (cursor < text.length) {
    const open = text.indexOf(OPEN, cursor);
    if (open < 0) break;
    const close = matchingClose(text, open);
    if (close < 0) break;
    output += text.slice(cursor, open) + resolveOne(text.slice(open + 1, close), t);
    cursor = close + 1;
  }
  return output + text.slice(cursor);
}
