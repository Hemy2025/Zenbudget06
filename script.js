// script.js completo aggiornato

let tipoAzienda = '';
let fatture = [];
const limiteAnnuale = 85000;

function setTipoAzienda(tipo) {
  tipoAzienda = tipo;
  document.getElementById('inputs-fattura').classList.remove('hidden');
  document.getElementById('storico-fatture').classList.remove('hidden');
  document.getElementById('riepilogo-contributi').classList.remove('hidden');
  document.getElementById('pagamenti-previsti').classList.remove('hidden');
  document.getElementById('residuo-container').classList.remove('hidden');
  document.getElementById('pdf-generator').classList.remove('hidden');
}

function aggiornaPrevidenza() {
  const previdenza = document.getElementById("previdenza").value;
  const atecoField = document.getElementById("ateco");

  if (previdenza === "gestione-separata") {
    atecoField.value = "0.78";
  } else if (previdenza === "cassa-privata") {
    atecoField.value = "0.78";
  } else if (previdenza === "commerciante") {
    atecoField.value = "0.40";
  } else {
    atecoField.value = "";
  }
}

function getTrimestre(data) {
  const mese = new Date(data).getMonth() + 1;
  if (mese <= 3) return '1° Trim.';
  if (mese <= 6) return '2° Trim.';
  if (mese <= 9) return '3° Trim.';
  return '4° Trim.';
}

function aggiungiFattura() {
  const previdenza = document.getElementById('previdenza').value;
  const ateco = parseFloat(document.getElementById('ateco').value);
  const data = document.getElementById('data').value;
  const importo = parseFloat(document.getElementById('fatturato').value);

  if (!data || isNaN(importo) || isNaN(ateco)) {
    alert('Inserisci tutti i dati correttamente.');
    return;
  }

  const imponibile = importo * ateco;

  let inps = 0;
  let imponibilePerImposta = imponibile;

  if (previdenza === 'gestione-separata') {
    inps = imponibile * 0.2607;
  } else if (previdenza === 'cassa-privata') {
    inps = imponibile * 0.26;
    imponibilePerImposta = imponibile - inps;
  } else if (previdenza === 'commerciante') {
    inps = imponibile * 0.2649;
  }

  const aliquotaImposta = tipoAzienda === 'start-up' ? 0.05 : 0.15;
  const imposta = imponibilePerImposta * aliquotaImposta;
  const totale = inps + imposta;
  const netto = importo - totale;
  const trimestre = getTrimestre(data);

  const fattura = { data, importo, imponibile, inps, imposta, totale, netto, trimestre };
  fatture.push(fattura);
  aggiornaStorico();
  aggior
::contentReference[oaicite:0]{index=0}
 
