// CRUD local
const form = document.getElementById('team-form');
const list = document.getElementById('team-list');
let teams = [];

// Formulario para agregar equipos manualmente
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('team-name').value;
  const country = document.getElementById('team-country').value;

  const team = { name, country };
  teams.push(team);
  updateTeamList();
  form.reset();
});

function updateTeamList() {
  list.innerHTML = '';
  teams.forEach((team, index) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <span>${team.name} (${team.country})</span>
      <button onclick="editTeam(${index})">Editar</button>
      <button onclick="deleteTeam(${index})">Eliminar</button>
    `;
    list.appendChild(li);
  });
}

function deleteTeam(index) {
  teams.splice(index, 1);
  updateTeamList();
}

function editTeam(index) {
  const newName = prompt('Nuevo nombre:', teams[index].name);
  const newCountry = prompt('Nuevo país:', teams[index].country);
  if (newName && newCountry) {
    teams[index].name = newName;
    teams[index].country = newCountry;
    updateTeamList();
  }
}

// Consumo de API de equipos de fútbol (gratuita)
async function loadApiTeams() {
  const container = document.getElementById('api-teams');
  container.innerHTML = 'Cargando equipos...';

  try {
    // API gratuita de Football Data (necesitas registrarte para obtener una key)
    const response = await fetch('https://api.football-data.org/v4/competitions/PL/teams', {
      headers: {
        'X-Auth-Token': 'TU_API_KEY' // Obtén una key gratuita en football-data.org
      }
    });
    
    if (!response.ok) {
      throw new Error('Error al cargar los equipos');
    }
    
    const data = await response.json();
    
    if (!data.teams || data.teams.length === 0) {
      container.innerHTML = 'No se encontraron equipos.';
      return;
    }

    container.innerHTML = '';
    
    // Mostrar solo los primeros 10 equipos para no saturar
    const teamsToShow = data.teams.slice(0, 10);
    
    for (const team of teamsToShow) {
      const teamName = team.name;
      const teamCountry = team.area.name;
      const teamLogo = team.crest || await getTeamImage(teamName, teamCountry);

      const div = document.createElement('div');
      div.className = 'card';
      div.innerHTML = `
        <img src="${teamLogo}" alt="${teamName}" onerror="this.src='default-logo.png'" />
        <h3>${teamName}</h3>
        <p>${teamCountry}</p>
      `;
      container.appendChild(div);
    }
  } catch (error) {
    console.error('Error:', error);
    container.innerHTML = 'Error al cargar los equipos. Usando datos de ejemplo...';
    loadExampleTeams(); // Función de respaldo
  }
}

// Función de respaldo con datos de ejemplo
async function loadExampleTeams() {
  const container = document.getElementById('api-teams');
  const exampleTeams = [
    { name: 'Barcelona', country: 'Spain', crest: 'https://crests.football-data.org/81.svg' },
    { name: 'Real Madrid', country: 'Spain', crest: 'https://crests.football-data.org/86.svg' },
    { name: 'Manchester United', country: 'England', crest: 'https://crests.football-data.org/66.svg' },
    { name: 'Bayern Munich', country: 'Germany', crest: 'https://crests.football-data.org/5.svg' },
    { name: 'Juventus', country: 'Italy', crest: 'https://crests.football-data.org/109.svg' }
  ];

  for (const team of exampleTeams) {
    const div = document.createElement('div');
    div.className = 'card';
    div.innerHTML = `
      <img src="${team.crest}" alt="${team.name}" onerror="this.src='default-logo.png'" />
      <h3>${team.name}</h3>
      <p>${team.country}</p>
    `;
    container.appendChild(div);
  }
}

// Función alternativa para obtener imágenes de equipos (TheSportsDB API)
async function getTeamImage(teamName, teamCountry) {
  try {
    const response = await fetch(`https://www.thesportsdb.com/api/v1/json/3/searchteams.php?t=${encodeURIComponent(teamName)}`);
    const data = await response.json();
    
    if (data.teams && data.teams.length > 0) {
      return data.teams[0].strTeamBadge || 'default-logo.png';
    }
    return 'default-logo.png';
  } catch (error) {
    console.error('Error obteniendo imagen:', error);
    return 'default-logo.png';
  }
}

// Cargar equipos al iniciar
loadApiTeams();