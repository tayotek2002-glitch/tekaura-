/**
 * Colour schemes. Change `defaultTheme` to switch the whole site.
 * Colours themselves live in src/app/globals.css.
 *
 * Any scheme can be previewed without changing code by adding
 * ?theme=<id> to a page address (remembered on that device;
 * ?theme=default clears it).
 */
export const themes = [
  { id: "graphite", name: "Graphite & Electric Blue" },
  { id: "titanium", name: "Warm Titanium & Copper" },
  { id: "aurora", name: "Midnight Aurora" },
  { id: "emerald", name: "Graphite & Emerald" },
] as const;

export type ThemeId = (typeof themes)[number]["id"];

export const defaultTheme: ThemeId = "emerald";

/** Runs before first paint so there's no colour flash. */
export const themeBootScript = `(function(){try{var ids=${JSON.stringify(themes.map((t) => t.id))};var q=new URLSearchParams(location.search).get('theme');if(q==='default'){localStorage.removeItem('tekaura.theme');q=null}if(q&&ids.indexOf(q)>-1)localStorage.setItem('tekaura.theme',q);var t=localStorage.getItem('tekaura.theme');if(t&&ids.indexOf(t)>-1)document.documentElement.setAttribute('data-theme',t)}catch(e){}})();`;
