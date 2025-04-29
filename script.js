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
  aggiornaResiduo();
  aggiornaPagamenti();
  aggiornaRiepilogo();
}

function aggiornaStorico() {
  const tbody = document.getElementById("lista-fatture");
  tbody.innerHTML = '';

  fatture.forEach((f, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td class="p-2">${f.data}</td>
      <td class="p-2">€ ${f.importo.toFixed(2)}</td>
      <td class="p-2">€ ${f.imponibile.toFixed(2)}</td>
      <td class="p-2">€ ${f.inps.toFixed(2)}</td>
      <td class="p-2">€ ${f.imposta.toFixed(2)}</td>
      <td class="p-2">€ ${f.totale.toFixed(2)}</td>
      <td class="p-2">€ ${f.netto.toFixed(2)}</td>
      <td class="p-2">${f.trimestre}</td>
      <td class="p-2 text-center"><button class="text-red-600 hover:text-red-800" onclick="eliminaFattura(${index})">🗑️</button></td>
    `;
    tbody.appendChild(row);
  });
}

function aggiornaResiduo() {
  const somma = fatture.reduce((acc, f) => acc + f.importo, 0);
  const residuo = limiteAnnuale - somma;
  document.getElementById("residuo").textContent = `€ ${residuo.toLocaleString('it-IT', { minimumFractionDigits: 2 })}`;
}

function aggiornaPagamenti() {
  const totaleImposte = fatture.reduce((acc, f) => acc + f.imposta, 0);
  const saldo = totaleImposte;
  const primoAcconto = saldo * 0.4;
  const secondoAcconto = saldo * 0.6;

  document.getElementById("pagamenti").innerHTML = `
    <strong>Saldo 30 giugno:</strong> € ${saldo.toFixed(2)}<br>
    <strong>Primo Acconto 30 giugno (40%):</strong> € ${primoAcconto.toFixed(2)}<br>
    <strong>Secondo Acconto 30 novembre (60%):</strong> € ${secondoAcconto.toFixed(2)}
  `;
}

function aggiornaRiepilogo() {
  const totaleImponibile = fatture.reduce((acc, f) => acc + f.imponibile, 0);
  const totaleINPS = fatture.reduce((acc, f) => acc + f.inps, 0);
  const totaleImposte = fatture.reduce((acc, f) => acc + f.imposta, 0);
  const totaleNetto = fatture.reduce((acc, f) => acc + f.netto, 0);
  const totaleAccantonare = totaleINPS + totaleImposte;

  document.getElementById("riepilogo").innerHTML = `
    <strong>Totale Imponibile:</strong> € ${totaleImponibile.toFixed(2)}<br>
    <strong>Totale Contributi Previdenziali:</strong> € ${totaleINPS.toFixed(2)}<br>
    <strong>Totale Imposte:</strong> € ${totaleImposte.toFixed(2)}<br>
    <strong>Totale Netto:</strong> € ${totaleNetto.toFixed(2)}<br>
    <strong>Totale da Accantonare:</strong> € ${totaleAccantonare.toFixed(2)}
  `;
}

function eliminaFattura(index) {
  fatture.splice(index, 1);
  aggiornaStorico();
  aggiornaResiduo();
  aggiornaPagamenti();
  aggiornaRiepilogo();
}

async function generaF24PDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // Carica il template
  const img = new Image();
  img.src = 'f24_template.jpg';

  await new Promise((resolve) => {
    img.onload = resolve;
  });

  doc.addImage(img, 'JPEG', 0, 0, 210, 297); // Dimensione A4

  const nome = document.getElementById('nome').value;
  const cognome = document.getElementById('cognome').value;
  const codiceFiscale = document.getElementById('codiceFiscale').value;
  const tipoPagamento = document.getElementById('tipoPagamento').value;
  const annoCorrente = new Date().getFullYear();

  const totaleImposte = fatture.reduce((acc, f) => acc + f.imposta, 0);
  const saldo = totaleImposte;
  const acconto1 = saldo * 0.4;
  const acconto2 = saldo * 0.6;

  doc.setFontSize(10);
  doc.text(cognome, 20, 32); // Cognome
  doc.text(nome, 100, 32); // Nome
  doc.text(codiceFiscale, 20, 42); // Codice Fiscale

  if (tipoPagamento === 'saldo') {
    doc.text('8846', 20, 100); // codice tributo saldo
    doc.text(`${annoCorrente - 1}`, 50, 100); // anno saldo
    doc.text(saldo.toFixed(2).replace('.', ','), 140, 100); // importo saldo

    doc.text('8847', 20, 110); // codice tributo primo acconto
    doc.text(`${annoCorrente}`, 50, 110); // anno primo acconto
    doc.text(acconto1.toFixed(2).replace('.', ','), 140, 110); // importo primo acconto
  } else if (tipoPagamento === 'secondo-acconto') {
    doc.text('8847', 20, 120); // codice tributo secondo acconto
    doc.text(`${annoCorrente}`, 50, 120); // anno secondo acconto
    doc.text(acconto2.toFixed(2).replace('.', ','), 140, 120); // importo secondo acconto
  }

  doc.save(`F24_${tipoPagamento}.pdf`);
}
