let tipoAzienda = '';
let fatture = [];
const limiteAnnuale = 85000;

function setTipoAzienda(tipo) {
  tipoAzienda = tipo;
  document.getElementById('inputs-fattura').style.display = 'block';
  document.getElementById('storico-fatture').style.display = 'block';
  document.getElementById('riepilogo-contributi').style.display = 'block';
  document.getElementById('pagamenti-previsti').style.display = 'block';
  document.getElementById('residuo-container').style.display = 'block';
  document.getElementById('pdf-generator').style.display = 'block';
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
      <td>${f.data}</td>
      <td>€ ${f.importo.toFixed(2)}</td>
      <td>€ ${f.imponibile.toFixed(2)}</td>
      <td>€ ${f.inps.toFixed(2)}</td>
      <td>€ ${f.imposta.toFixed(2)}</td>
      <td>€ ${f.totale.toFixed(2)}</td>
      <td>€ ${f.netto.toFixed(2)}</td>
      <td>${f.trimestre}</td>
      <td><button class="delete-btn" onclick="eliminaFattura(${index})">🗑️</button></td>
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
  const codiceFiscale = document.getElementById('codiceFiscale').value.trim();
  const tipoPagamento = document.getElementById('tipoPagamento').value;

  if (!nome || !codiceFiscale) {
    alert('Per favore, inserisci Nome/Cognome e Codice Fiscale.');
    return;
  }

  const totaleImposte = fatture.reduce((acc, f) => acc + f.imposta, 0);
  const saldo = totaleImposte;
  const primoAcconto = saldo * 0.4;
  const secondoAcconto = saldo * 0.6;

  let importoSelezionato = 0;
  let codiceTributo = "";
  let descrizione = "";
  const annoCorrente = new Date().getFullYear();

  if (tipoPagamento === 'saldo') {
    importoSelezionato = saldo;
    codiceTributo = "8846";
    descrizione = "Saldo 30 Giugno";
  } else if (tipoPagamento === 'primo-acconto') {
    importoSelezionato = primoAcconto;
    codiceTributo = "8847";
    descrizione = "Primo Acconto 30 Giugno";
  } else if (tipoPagamento === 'secondo-acconto') {
    importoSelezionato = secondoAcconto;
    codiceTributo = "8847";
    descrizione = "Secondo Acconto 30 Novembre";
  }

  // Aggiunta immagine sfondo Modello F24
  const img = new Image();
  img.src = 'f24_template.jpg';

  img.onload = function() {
    doc.addImage(img, 'JPEG', 0, 0, 210, 297);

    doc.setFontSize(10);
    doc.text(nome, 20, 37);
    doc.text(codiceFiscale, 150, 37);

    doc.text(codiceTributo, 22, 120);
    doc.text(annoCorrente.toString(), 75, 120);
    doc.text(importoSelezionato.toFixed(2) + " €", 140, 120);

    doc.save(`F24_${tipoPagamento}.pdf`);
  };
}
