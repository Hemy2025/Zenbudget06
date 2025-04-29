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

  if (!data || isNaN(importo)) {
    alert('Inserisci tutti i dati corretti.');
    return;
  }

  const imponibile = importo * ateco;
  const inps = (previdenza === 'gestione-separata') ? imponibile * 0.2607 : 0;
  const aliquotaImposta = tipoAzienda === 'start-up' ? 0.05 : 0.15;
  const imposta = imponibile * aliquotaImposta;
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

  const nome = document.getElementById('nome').value.trim();
  const cognome = document.getElementById('cognome').value.trim();
  const codiceFiscale = document.getElementById('codiceFiscale').value.trim();
  const tipoPagamento = document.getElementById('tipoPagamento').value;

  if (!nome || !cognome || !codiceFiscale) {
    alert('Inserisci Nome, Cognome e Codice Fiscale.');
    return;
  }

  const totaleImposte = fatture.reduce((acc, f) => acc + f.imposta, 0);
  const saldo = totaleImposte;
  const primoAcconto = saldo * 0.4;
  const secondoAcconto = saldo * 0.6;
  const totaleDaVersare = saldo + primoAcconto;

  const annoCorrente = new Date().getFullYear();
  const annoPrecedente = annoCorrente - 1;

  const img = new Image();
  img.src = 'f24_template.jpg'; // Devi assicurarti che questo file sia presente nel repository

  img.onload = function() {
    doc.addImage(img, 'JPEG', 0, 0, 210, 297);

    doc.setFontSize(10);

    // Nome e Cognome
    doc.text(cognome, 40, 67);
    doc.text(nome, 170, 67);

    // Codice fiscale
    doc.text(codiceFiscale, 70, 60);

    if (tipoPagamento === 'saldo') {
      // Codice 8846
      doc.text('8846', 20, 105);
      doc.text(annoPrecedente.toString(), 80, 105);
      doc.text(saldo.toFixed(2).replace('.', ','), 170, 105);

      // Codice 8847
      doc.text('8847', 20, 115);
      doc.text(annoCorrente.toString(), 80, 115);
      doc.text(primoAcconto.toFixed(2).replace('.', ','), 170, 115);

      // Casella C-D
      doc.text(totaleDaVersare.toFixed(2).replace('.', ','), 140, 160);

      // Casella Saldo finale
      doc.text(totaleDaVersare.toFixed(2).replace('.', ','), 140, 250);

    } else if (tipoPagamento === 'secondo-acconto') {
      // Codice 8847
      doc.text('8847', 20, 105);
      doc.text(annoCorrente.toString(), 80, 105);
      doc.text(secondoAcconto.toFixed(2).replace('.', ','), 170, 105);

      // Casella C-D
      doc.text(secondoAcconto.toFixed(2).replace('.', ','), 140, 160);

      // Casella Saldo finale
      doc.text(secondoAcconto.toFixed(2).replace('.', ','), 140, 250);
    }

    doc.save(`F24_${tipoPagamento}.pdf`);
  };
}
