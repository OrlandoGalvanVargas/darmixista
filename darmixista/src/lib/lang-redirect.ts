/**
 * Detección de idioma (script en línea en el <head>, se ejecuta antes de pintar).
 *
 * - En la primera visita, un navegador en otro idioma va a la versión /en/ de la MISMA página
 *   (/ → /en/, /darmixpet/ → /en/darmixpet/).
 * - Si el visitante eligió idioma antes (localStorage), se respeta.
 * - Los buscadores y previsualizadores de enlaces nunca se redirigen: así cada idioma
 *   se indexa en su propia URL (hreflang).
 */
export const LANG_STORAGE_KEY = 'darmixista:lang';

export const LANG_REDIRECT = `(function(){try{
if(/bot|crawl|spider|slurp|google|bing|yandex|baidu|duckduck|facebookexternalhit|linkedin|twitter|whatsapp|telegram|discord|slack|lighthouse|headless/i.test(navigator.userAgent)||navigator.webdriver)return;
var saved=localStorage.getItem('${LANG_STORAGE_KEY}');
var path=location.pathname;
var onEn=path==='/en'||path.indexOf('/en/')===0;
var browserEs=(navigator.language||'').toLowerCase().indexOf('es')===0;
if(!onEn&&(saved==='en'||(!saved&&!browserEs))){location.replace('/en'+path+location.hash);}
else if(onEn&&saved==='es'){location.replace((path.slice(3)||'/')+location.hash);}
}catch(e){}})();`;
