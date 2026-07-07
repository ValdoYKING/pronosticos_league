export interface Team {
  id: string;
  name: string;
  flag: string;
  flagUrl: string;
  group: string;
  status: 'activo' | 'eliminado';
  stageReached: string;
  pts?: number;
  pj?: number;
  pg?: number;
  pe?: number;
  pp?: number;
  gf?: number;
  gc?: number;
  dif?: number;
}

export interface Participant {
  id: string;
  name: string;
  email: string;
  teamIds: string[];
  photoType: 'avatar' | 'upload';
  photo: string;
  status: 'activo' | 'eliminado';
  drawCount?: number; // Cantidad de sorteos (veces que saldrá en la tómbola). Default: 1
  ordenPronostico?: number; // Orden de registro para el sorteo (auto-incremental). A menor número, primero en sortearse
  ordenesSorteo?: number[]; // Array de órdenes específicos de sorteo para este participante. Ej: [1, 2, 44]
}

// ============================================================
// ORDEN_SORTEO - Controla el orden de los 48 sorteos
// Cada fila = una posición (1-48) con el participante que pasa en ese turno
// ============================================================
export interface OrdenSorteo {
  id: number;
  posicion: number;
  participantEmail: string | null;
  participantName: string | null;
  status: 'pendiente' | 'completado' | 'saltado';
}

export interface Match {
  id: number;
  stage: string;
  teamAId: string | null;
  teamBId: string | null;
  winnerId: string | null;
  scoreA: number | null;
  scoreB: number | null;
  date: string;
  venue: string;
  nextMatchId: number | null;
  slot: 'A' | 'B' | null;
  group?: string;
}

export const DIECISEISAVOS_PAIRINGS = [
  ['GER', 'PAR'],
  ['FRA', 'SWE'],
  ['RSA', 'CAN'],
  ['NED', 'MAR'],
  ['POR', 'CRO'],
  ['ESP', 'AUT'],
  ['USA', 'BIH'],
  ['BEL', 'SEN'],
  ['BRA', 'JPN'],
  ['CIV', 'NOR'],
  ['MEX', 'ECU'],
  ['ENG', 'COD'],
  ['ARG', 'CPV'],
  ['AUS', 'EGY'],
  ['SUI', 'ALG'],
  ['COL', 'GHA'],
] as const;

const D16_ORDER_MAP = new Map(
  DIECISEISAVOS_PAIRINGS.map((pair, index) => [pair.slice().sort().join('-'), index]),
);

function getPairKey(teamAId: string | null, teamBId: string | null) {
  if (!teamAId || !teamBId) return null;
  return [teamAId, teamBId].sort().join('-');
}

export function sortMatchesForStage(stage: string, matches: Match[]): Match[] {
  return [...matches].sort((a, b) => {
    if (stage === 'Dieciseisavos') {
      const aKey = getPairKey(a.teamAId, a.teamBId);
      const bKey = getPairKey(b.teamAId, b.teamBId);
      const aIndex = aKey ? D16_ORDER_MAP.get(aKey) ?? Number.MAX_SAFE_INTEGER : Number.MAX_SAFE_INTEGER;
      const bIndex = bKey ? D16_ORDER_MAP.get(bKey) ?? Number.MAX_SAFE_INTEGER : Number.MAX_SAFE_INTEGER;
      if (aIndex !== bIndex) return aIndex - bIndex;
    }

    return a.id - b.id;
  });
}

export const GROUP_LABELS: Record<string, string> = {
  A: 'Grupo A', B: 'Grupo B', C: 'Grupo C', D: 'Grupo D',
  E: 'Grupo E', F: 'Grupo F', G: 'Grupo G', H: 'Grupo H',
  I: 'Grupo I', J: 'Grupo J', K: 'Grupo K', L: 'Grupo L',
};

// ============================================================
// EQUIPOS (48 equipos, 12 grupos de 4)
// ============================================================
export const MOCK_TEAMS: Team[] = [
  { id: 'MEX', name: 'México', flag: '🇲🇽', flagUrl: 'https://flagcdn.com/w320/mx.png', group: 'A', status: 'activo', stageReached: 'Fase de Grupos' },
  { id: 'RSA', name: 'Sudáfrica', flag: '🇿🇦', flagUrl: 'https://flagcdn.com/w320/za.png', group: 'A', status: 'activo', stageReached: 'Fase de Grupos' },
  { id: 'KOR', name: 'Corea del Sur', flag: '🇰🇷', flagUrl: 'https://flagcdn.com/w320/kr.png', group: 'A', status: 'activo', stageReached: 'Fase de Grupos' },
  { id: 'CZE', name: 'Chequia', flag: '🇨🇿', flagUrl: 'https://flagcdn.com/w320/cz.png', group: 'A', status: 'activo', stageReached: 'Fase de Grupos' },
  { id: 'CAN', name: 'Canadá', flag: '🇨🇦', flagUrl: 'https://flagcdn.com/w320/ca.png', group: 'B', status: 'activo', stageReached: 'Fase de Grupos' },
  { id: 'BIH', name: 'Bosnia y Herzegovina', flag: '🇧🇦', flagUrl: 'https://flagcdn.com/w320/ba.png', group: 'B', status: 'activo', stageReached: 'Fase de Grupos' },
  { id: 'QAT', name: 'Catar', flag: '🇶🇦', flagUrl: 'https://flagcdn.com/w320/qa.png', group: 'B', status: 'activo', stageReached: 'Fase de Grupos' },
  { id: 'SUI', name: 'Suiza', flag: '🇨🇭', flagUrl: 'https://flagcdn.com/w320/ch.png', group: 'B', status: 'activo', stageReached: 'Fase de Grupos' },
  { id: 'BRA', name: 'Brasil', flag: '🇧🇷', flagUrl: 'https://flagcdn.com/w320/br.png', group: 'C', status: 'activo', stageReached: 'Fase de Grupos' },
  { id: 'MAR', name: 'Marruecos', flag: '🇲🇦', flagUrl: 'https://flagcdn.com/w320/ma.png', group: 'C', status: 'activo', stageReached: 'Fase de Grupos' },
  { id: 'HAI', name: 'Haití', flag: '🇭🇹', flagUrl: 'https://flagcdn.com/w320/ht.png', group: 'C', status: 'activo', stageReached: 'Fase de Grupos' },
  { id: 'SCO', name: 'Escocia', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', flagUrl: 'https://flagcdn.com/w320/gb-sct.png', group: 'C', status: 'activo', stageReached: 'Fase de Grupos' },
  { id: 'USA', name: 'EE. UU.', flag: '🇺🇸', flagUrl: 'https://flagcdn.com/w320/us.png', group: 'D', status: 'activo', stageReached: 'Fase de Grupos' },
  { id: 'PAR', name: 'Paraguay', flag: '🇵🇾', flagUrl: 'https://flagcdn.com/w320/py.png', group: 'D', status: 'activo', stageReached: 'Fase de Grupos' },
  { id: 'AUS', name: 'Australia', flag: '🇦🇺', flagUrl: 'https://flagcdn.com/w320/au.png', group: 'D', status: 'activo', stageReached: 'Fase de Grupos' },
  { id: 'TUR', name: 'Turquía', flag: '🇹🇷', flagUrl: 'https://flagcdn.com/w320/tr.png', group: 'D', status: 'activo', stageReached: 'Fase de Grupos' },
  { id: 'GER', name: 'Alemania', flag: '🇩🇪', flagUrl: 'https://flagcdn.com/w320/de.png', group: 'E', status: 'activo', stageReached: 'Fase de Grupos' },
  { id: 'CUW', name: 'Curazao', flag: '🇨🇼', flagUrl: 'https://flagcdn.com/w320/cw.png', group: 'E', status: 'activo', stageReached: 'Fase de Grupos' },
  { id: 'CIV', name: 'Costa de Marfil', flag: '🇨🇮', flagUrl: 'https://flagcdn.com/w320/ci.png', group: 'E', status: 'activo', stageReached: 'Fase de Grupos' },
  { id: 'ECU', name: 'Ecuador', flag: '🇪🇨', flagUrl: 'https://flagcdn.com/w320/ec.png', group: 'E', status: 'activo', stageReached: 'Fase de Grupos' },
  { id: 'NED', name: 'Países Bajos', flag: '🇳🇱', flagUrl: 'https://flagcdn.com/w320/nl.png', group: 'F', status: 'activo', stageReached: 'Fase de Grupos' },
  { id: 'JPN', name: 'Japón', flag: '🇯🇵', flagUrl: 'https://flagcdn.com/w320/jp.png', group: 'F', status: 'activo', stageReached: 'Fase de Grupos' },
  { id: 'SWE', name: 'Suecia', flag: '🇸🇪', flagUrl: 'https://flagcdn.com/w320/se.png', group: 'F', status: 'activo', stageReached: 'Fase de Grupos' },
  { id: 'TUN', name: 'Túnez', flag: '🇹🇳', flagUrl: 'https://flagcdn.com/w320/tn.png', group: 'F', status: 'activo', stageReached: 'Fase de Grupos' },
  { id: 'BEL', name: 'Bélgica', flag: '🇧🇪', flagUrl: 'https://flagcdn.com/w320/be.png', group: 'G', status: 'activo', stageReached: 'Fase de Grupos' },
  { id: 'EGY', name: 'Egipto', flag: '🇪🇬', flagUrl: 'https://flagcdn.com/w320/eg.png', group: 'G', status: 'activo', stageReached: 'Fase de Grupos' },
  { id: 'IRN', name: 'Irán', flag: '🇮🇷', flagUrl: 'https://flagcdn.com/w320/ir.png', group: 'G', status: 'activo', stageReached: 'Fase de Grupos' },
  { id: 'NZL', name: 'Nueva Zelanda', flag: '🇳🇿', flagUrl: 'https://flagcdn.com/w320/nz.png', group: 'G', status: 'activo', stageReached: 'Fase de Grupos' },
  { id: 'ESP', name: 'España', flag: '🇪🇸', flagUrl: 'https://flagcdn.com/w320/es.png', group: 'H', status: 'activo', stageReached: 'Fase de Grupos' },
  { id: 'CPV', name: 'Islas de Cabo Verde', flag: '🇨🇻', flagUrl: 'https://flagcdn.com/w320/cv.png', group: 'H', status: 'activo', stageReached: 'Fase de Grupos' },
  { id: 'KSA', name: 'Arabia Saudí', flag: '🇸🇦', flagUrl: 'https://flagcdn.com/w320/sa.png', group: 'H', status: 'activo', stageReached: 'Fase de Grupos' },
  { id: 'URU', name: 'Uruguay', flag: '🇺🇾', flagUrl: 'https://flagcdn.com/w320/uy.png', group: 'H', status: 'activo', stageReached: 'Fase de Grupos' },
  { id: 'FRA', name: 'Francia', flag: '🇫🇷', flagUrl: 'https://flagcdn.com/w320/fr.png', group: 'I', status: 'activo', stageReached: 'Fase de Grupos' },
  { id: 'SEN', name: 'Senegal', flag: '🇸🇳', flagUrl: 'https://flagcdn.com/w320/sn.png', group: 'I', status: 'activo', stageReached: 'Fase de Grupos' },
  { id: 'IRQ', name: 'Irak', flag: '🇮🇶', flagUrl: 'https://flagcdn.com/w320/iq.png', group: 'I', status: 'activo', stageReached: 'Fase de Grupos' },
  { id: 'NOR', name: 'Noruega', flag: '🇳🇴', flagUrl: 'https://flagcdn.com/w320/no.png', group: 'I', status: 'activo', stageReached: 'Fase de Grupos' },
  { id: 'ARG', name: 'Argentina', flag: '🇦🇷', flagUrl: 'https://flagcdn.com/w320/ar.png', group: 'J', status: 'activo', stageReached: 'Fase de Grupos' },
  { id: 'ALG', name: 'Argelia', flag: '🇩🇿', flagUrl: 'https://flagcdn.com/w320/dz.png', group: 'J', status: 'activo', stageReached: 'Fase de Grupos' },
  { id: 'AUT', name: 'Austria', flag: '🇦🇹', flagUrl: 'https://flagcdn.com/w320/at.png', group: 'J', status: 'activo', stageReached: 'Fase de Grupos' },
  { id: 'JOR', name: 'Jordania', flag: '🇯🇴', flagUrl: 'https://flagcdn.com/w320/jo.png', group: 'J', status: 'activo', stageReached: 'Fase de Grupos' },
  { id: 'POR', name: 'Portugal', flag: '🇵🇹', flagUrl: 'https://flagcdn.com/w320/pt.png', group: 'K', status: 'activo', stageReached: 'Fase de Grupos' },
  { id: 'COD', name: 'RD Congo', flag: '🇨🇩', flagUrl: 'https://flagcdn.com/w320/cd.png', group: 'K', status: 'activo', stageReached: 'Fase de Grupos' },
  { id: 'UZB', name: 'Uzbekistán', flag: '🇺🇿', flagUrl: 'https://flagcdn.com/w320/uz.png', group: 'K', status: 'activo', stageReached: 'Fase de Grupos' },
  { id: 'COL', name: 'Colombia', flag: '🇨🇴', flagUrl: 'https://flagcdn.com/w320/co.png', group: 'K', status: 'activo', stageReached: 'Fase de Grupos' },
  { id: 'ENG', name: 'Inglaterra', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', flagUrl: 'https://flagcdn.com/w320/gb-eng.png', group: 'L', status: 'activo', stageReached: 'Fase de Grupos' },
  { id: 'CRO', name: 'Croacia', flag: '🇭🇷', flagUrl: 'https://flagcdn.com/w320/hr.png', group: 'L', status: 'activo', stageReached: 'Fase de Grupos' },
  { id: 'GHA', name: 'Ghana', flag: '🇬🇭', flagUrl: 'https://flagcdn.com/w320/gh.png', group: 'L', status: 'activo', stageReached: 'Fase de Grupos' },
  { id: 'PAN', name: 'Panamá', flag: '🇵🇦', flagUrl: 'https://flagcdn.com/w320/pa.png', group: 'L', status: 'activo', stageReached: 'Fase de Grupos' },
];

// ============================================================
// GENERADOR DE PARTIDOS DE GRUPO
// ============================================================
function generateGroupMatches(group: string, teams: string[], startId: number): Match[] {
  const pairings = [
    [0, 1, 2, 3], [0, 2, 1, 3], [0, 3, 1, 2],
  ];
  const groupVenues: Record<string, string[]> = {
    A: ['Estadio Azteca, CDMX', 'Estadio BBVA, MTY'],
    B: ['BC Place, Vancouver', 'BMO Field, Toronto'],
    C: ['SoFi Stadium, LA', 'Levi\'s Stadium, SF'],
    D: ['Mercedes-Benz, Atlanta', 'Hard Rock, Miami'],
    E: ['AT&T Stadium, Dallas', 'NRG Stadium, Houston'],
    F: ['Arrowhead, KC', 'Gillette Stadium, Boston'],
    G: ['MetLife Stadium, NY', 'Lincoln Financial, Philly'],
    H: ['Estadio Nacional, Lima', 'Estadio Monumental, Lima'],
    I: ['Estadio Maracanã, Río', 'Estádio do Morumbi, SP'],
    J: ['Estadio Centenario, Mon', 'Estadio Campeón del Siglo'],
    K: ['Estadio Mineirão, BH', 'Estádio Mané Garrincha, DF'],
    L: ['Estadio Libertadores, BA', 'Estadio Único, LP'],
  };
  const groupDates: Record<string, string[]> = {
    A: ['8 Jun 13:00', '8 Jun 16:00', '11 Jun 13:00', '11 Jun 16:00', '14 Jun 13:00', '14 Jun 16:00'],
    B: ['8 Jun 19:00', '8 Jun 22:00', '11 Jun 19:00', '11 Jun 22:00', '14 Jun 19:00', '14 Jun 22:00'],
    C: ['9 Jun 13:00', '9 Jun 16:00', '12 Jun 13:00', '12 Jun 16:00', '15 Jun 13:00', '15 Jun 16:00'],
    D: ['9 Jun 19:00', '9 Jun 22:00', '12 Jun 19:00', '12 Jun 22:00', '15 Jun 19:00', '15 Jun 22:00'],
    E: ['10 Jun 13:00', '10 Jun 16:00', '13 Jun 13:00', '13 Jun 16:00', '16 Jun 13:00', '16 Jun 16:00'],
    F: ['10 Jun 19:00', '10 Jun 22:00', '13 Jun 19:00', '13 Jun 22:00', '16 Jun 19:00', '16 Jun 22:00'],
    G: ['11 Jun 13:00', '11 Jun 16:00', '14 Jun 13:00', '14 Jun 16:00', '17 Jun 13:00', '17 Jun 16:00'],
    H: ['11 Jun 19:00', '11 Jun 22:00', '14 Jun 19:00', '14 Jun 22:00', '17 Jun 19:00', '17 Jun 22:00'],
    I: ['12 Jun 13:00', '12 Jun 16:00', '15 Jun 13:00', '15 Jun 16:00', '18 Jun 13:00', '18 Jun 16:00'],
    J: ['12 Jun 19:00', '12 Jun 22:00', '15 Jun 19:00', '15 Jun 22:00', '18 Jun 19:00', '18 Jun 22:00'],
    K: ['13 Jun 13:00', '13 Jun 16:00', '16 Jun 13:00', '16 Jun 16:00', '19 Jun 13:00', '19 Jun 16:00'],
    L: ['13 Jun 19:00', '13 Jun 22:00', '16 Jun 19:00', '16 Jun 22:00', '19 Jun 19:00', '19 Jun 22:00'],
  };
  const venues = groupVenues[group] || ['Estadio Genérico 1', 'Estadio Genérico 2'];
  const dates = groupDates[group] || ['Fecha 1', 'Fecha 1', 'Fecha 2', 'Fecha 2', 'Fecha 3', 'Fecha 3'];
  const matches: Match[] = [];
  let matchId = startId;
  let matchIndex = 0;
  for (const [a1, b1, a2, b2] of pairings) {
    matches.push({ id: matchId++, stage: 'Grupos', group, teamAId: teams[a1], teamBId: teams[b1], winnerId: null, scoreA: null, scoreB: null, date: dates[matchIndex] || 'Fecha', venue: venues[0], nextMatchId: null, slot: null }); matchIndex++;
    matches.push({ id: matchId++, stage: 'Grupos', group, teamAId: teams[a2], teamBId: teams[b2], winnerId: null, scoreA: null, scoreB: null, date: dates[matchIndex] || 'Fecha', venue: venues[1], nextMatchId: null, slot: null }); matchIndex++;
  }
  return matches;
}

function getTeamIdsByGroup(group: string): string[] {
  return MOCK_TEAMS.filter(t => t.group === group).map(t => t.id);
}

const GROUP_NAMES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
let mid = 1;
const groupMatchesArr: Match[] = [];
for (const g of GROUP_NAMES) {
  const teamIds = getTeamIdsByGroup(g);
  const gMatches = generateGroupMatches(g, teamIds, mid);
  groupMatchesArr.push(...gMatches);
  mid += gMatches.length;
}

// ============================================================
// DIECISEISAVOS (16)
// ============================================================
const d16Venues = ['Estadio Azteca, CDMX', 'Estadio BBVA, MTY', 'BC Place, Vancouver', 'BMO Field, Toronto',
  'SoFi Stadium, LA', 'Levi\'s Stadium, SF', 'Mercedes-Benz, Atlanta', 'Hard Rock, Miami',
  'AT&T Stadium, Dallas', 'NRG Stadium, Houston', 'Arrowhead, KC', 'Gillette Stadium, Boston',
  'MetLife Stadium, NY', 'Lincoln Financial, Philly', 'Estadio Nacional, Lima', 'Estadio Maracanã, Río'];
const d16Dates = ['22 Jun 13:00', '22 Jun 16:00', '22 Jun 19:00', '22 Jun 22:00',
  '23 Jun 13:00', '23 Jun 16:00', '23 Jun 19:00', '23 Jun 22:00',
  '24 Jun 13:00', '24 Jun 16:00', '24 Jun 19:00', '24 Jun 22:00',
  '25 Jun 13:00', '25 Jun 16:00', '25 Jun 19:00', '25 Jun 22:00'];
const d16Matches: Match[] = [];
for (let i = 0; i < 16; i++) {
  const octId = mid + 16 + Math.floor(i / 2);
  d16Matches.push({ id: mid + i, stage: 'Dieciseisavos', teamAId: null, teamBId: null, winnerId: null, scoreA: null, scoreB: null, date: d16Dates[i], venue: d16Venues[i], nextMatchId: octId, slot: (i % 2 === 0 ? 'A' : 'B') as 'A' | 'B' });
}
mid += 16;

// ============================================================
// OCTAVOS (8)
// ============================================================
const o8Venues = ['Gillette Stadium, Boston', 'Arrowhead, KC', 'NRG Stadium, Houston', 'Levi\'s Stadium, SF',
  'MetLife Stadium, NY', 'Hard Rock, Miami', 'Mercedes-Benz, Atlanta', 'AT&T Stadium, Dallas'];
const o8Dates = ['28 Jun 13:00', '28 Jun 17:00', '29 Jun 13:00', '29 Jun 17:00',
  '30 Jun 13:00', '30 Jun 17:00', '1 Jul 13:00', '1 Jul 17:00'];
const o8Matches: Match[] = [];
for (let i = 0; i < 8; i++) {
  const cuId = mid + 8 + Math.floor(i / 2);
  o8Matches.push({ id: mid + i, stage: 'Octavos', teamAId: null, teamBId: null, winnerId: null, scoreA: null, scoreB: null, date: o8Dates[i], venue: o8Venues[i], nextMatchId: cuId, slot: (i % 2 === 0 ? 'A' : 'B') as 'A' | 'B' });
}
mid += 8;

// ============================================================
// CUARTOS (4)
// ============================================================
const c4Matches: Match[] = [
  { id: mid, stage: 'Cuartos', teamAId: null, teamBId: null, winnerId: null, scoreA: null, scoreB: null, date: '4 Jul 13:00', venue: 'Gillette Stadium, Boston', nextMatchId: mid + 4, slot: 'A' },
  { id: mid + 1, stage: 'Cuartos', teamAId: null, teamBId: null, winnerId: null, scoreA: null, scoreB: null, date: '4 Jul 17:00', venue: 'Arrowhead, KC', nextMatchId: mid + 4, slot: 'B' },
  { id: mid + 2, stage: 'Cuartos', teamAId: null, teamBId: null, winnerId: null, scoreA: null, scoreB: null, date: '5 Jul 13:00', venue: 'NRG Stadium, Houston', nextMatchId: mid + 5, slot: 'A' },
  { id: mid + 3, stage: 'Cuartos', teamAId: null, teamBId: null, winnerId: null, scoreA: null, scoreB: null, date: '5 Jul 17:00', venue: 'Levi\'s Stadium, SF', nextMatchId: mid + 5, slot: 'B' },
];
mid += 4;

// ============================================================
// SEMIS (2)
// ============================================================
const s2Matches: Match[] = [
  { id: mid, stage: 'Semis', teamAId: null, teamBId: null, winnerId: null, scoreA: null, scoreB: null, date: '8 Jul 19:00', venue: 'MetLife Stadium, NY', nextMatchId: mid + 2, slot: 'A' },
  { id: mid + 1, stage: 'Semis', teamAId: null, teamBId: null, winnerId: null, scoreA: null, scoreB: null, date: '9 Jul 19:00', venue: 'Estadio Azteca, CDMX', nextMatchId: mid + 2, slot: 'B' },
];
mid += 2;

// ============================================================
// FINAL (1)
// ============================================================
const f1Matches: Match[] = [
  { id: mid, stage: 'Final', teamAId: null, teamBId: null, winnerId: null, scoreA: null, scoreB: null, date: '13 Jul 16:00', venue: 'MetLife Stadium, NY', nextMatchId: null, slot: null },
];
mid += 1;

// ============================================================
// TERCER LUGAR (1)
// ============================================================
const tlMatches: Match[] = [
  { id: mid, stage: 'TercerLugar', teamAId: null, teamBId: null, winnerId: null, scoreA: null, scoreB: null, date: '12 Jul 19:00', venue: 'Hard Rock Stadium, Miami', nextMatchId: null, slot: null },
];

export const MOCK_MATCHES: Match[] = [
  ...groupMatchesArr,
  ...d16Matches,
  ...o8Matches,
  ...c4Matches,
  ...s2Matches,
  ...f1Matches,
  ...tlMatches,
];

export const MOCK_PARTICIPANTS: Participant[] = [];
