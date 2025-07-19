async function fetchSky() {
  const target = 'https://forecast.weather.gov/data/obhistory/KFRG.html';
  const proxyUrls = [
    'https://corsproxy.io/?' + target,
    'https://api.allorigins.win/raw?url=' + encodeURIComponent(target)
  ];
  let sky = 'N/A';

  for (let url of proxyUrls) {
    try {
      const resp = await fetch(url);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const html = await resp.text();
      const div = document.createElement('div');
      div.innerHTML = html;

      const cells = div.querySelectorAll('td');
      for (let i = 0; i < cells.length; i++) {
        if (cells[i].textContent.trim() === 'Weather' && cells[i+1]) {
          sky = cells[i+1].textContent.trim();
          break;
        }
      }
      if (sky !== 'N/A') break; // exit once found

    } catch (err) {
      console.warn('Sky proxy failed:', url, err);
    }
  }

  document.getElementById('sky-from-nws').textContent = sky;
}
