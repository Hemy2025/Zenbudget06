document.getElementById('form').addEventListener('submit', function(e) {
  e.preventDefault();

  const attivita = document.getElementById('attivita').value;
  const fatturato = parseFloat(document.getElementById('fatturato').value);

  let coefficiente;
  let contributiDedotti = false;

  switch(attivita) {
    case 'professione':
      coefficiente = 0.78;
      contributiDedotti = true;
      break;
    case 'gestione_separata':
      coefficiente = 0.78;
      break;
    case 'commercio_dettaglio':
      coefficiente = 0.40;
      break;
    case 'ambulante_alimentari':
      coefficiente = 0.40;
      break;
    case 'ambulante_altri':
      coefficiente = 0.54;
      break;
    default:
      coefficiente = 0.67;
  }

  const redditoImponibile = fatturato * coefficiente;
  const contributi = redditoImponibile * 0.2572; // Aliquota INPS standard
  const redditoNetto = contributiDedotti ? redditoImponibile - contributi : redditoImponibile;
  const imposta = redditoNetto * 0.15; // Imposta sostitutiva al 15%
  const totaleTasse = imposta + contributi;

  document.getElementById('risultati').innerHTML = `
    <h2>Risultati</h2>
    <p>Reddito imponibile: € ${redditoImponibile.toFixed(2)}</p>
    <p>Contributi INPS: € ${contributi.toFixed(2)}</p>
    <p>Imposta sostitutiva: € ${imposta.toFixed(2)}</p>
    <p><strong>Totale tasse: € ${totaleTasse.toFixed(2)}</strong></p>
  `;
});
