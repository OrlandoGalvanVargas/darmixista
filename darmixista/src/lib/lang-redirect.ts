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
