export const MOCK_PARTICIPANTS: Participant[] = [];

export const MOCK_TEAMS: Team[] = [
  // Grupo A
  { id: 'MEX', name: 'México', flag: '🇲🇽', flagUrl: 'https://flagcdn.com/w320/mx.png', group: 'A', status: 'activo', stageReached: 'Octavos de Final' },
  { id: 'RSA', name: 'Sudáfrica', flag: '🇿🇦', flagUrl: 'https://flagcdn.com/w320/za.png', group: 'A', status: 'activo', stageReached: 'Octavos de Final' },
  { id: 'KOR', name: 'Corea del Sur', flag: '🇰🇷', flagUrl: 'https://flagcdn.com/w320/kr.png', group: 'A', status: 'activo', stageReached: 'Octavos de Final' },
  { id: 'CZE', name: 'Chequia', flag: '🇨🇿', flagUrl: 'https://flagcdn.com/w320/cz.png', group: 'A', status: 'activo', stageReached: 'Octavos de Final' },
  // Grupo B
  { id: 'CAN', name: 'Canadá', flag: '🇨🇦', flagUrl: 'https://flagcdn.com/w320/ca.png', group: 'B', status: 'activo', stageReached: 'Octavos de Final' },
  { id: 'BIH', name: 'Bosnia y Herzegovina', flag: '🇧🇦', flagUrl: 'https://flagcdn.com/w320/ba.png', group: 'B', status: 'activo', stageReached: 'Octavos de Final' },
  { id: 'QAT', name: 'Catar', flag: '🇶🇦', flagUrl: 'https://flagcdn.com/w320/qa.png', group: 'B', status: 'activo', stageReached: 'Octavos de Final' },
  { id: 'SUI', name: 'Suiza', flag: '🇨🇭', flagUrl: 'https://flagcdn.com/w320/ch.png', group: 'B', status: 'activo', stageReached: 'Octavos de Final' },
  // Grupo C
  { id: 'BRA', name: 'Brasil', flag: '🇧🇷', flagUrl: 'https://flagcdn.com/w320/br.png', group: 'C', status: 'activo', stageReached: 'Octavos de Final' },
  { id: 'MAR', name: 'Marruecos', flag: '🇲🇦', flagUrl: 'https://flagcdn.com/w320/ma.png', group: 'C', status: 'activo', stageReached: 'Octavos de Final' },
  { id: 'HAI', name: 'Haití', flag: '🇭🇹', flagUrl: 'https://flagcdn.com/w320/ht.png', group: 'C', status: 'activo', stageReached: 'Octavos de Final' },
  { id: 'SCO', name: 'Escocia', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', flagUrl: 'https://flagcdn.com/w320/gb-sct.png', group: 'C', status: 'activo', stageReached: 'Octavos de Final' },
  // Grupo D
  { id: 'USA', name: 'EE. UU.', flag: '🇺🇸', flagUrl: 'https://flagcdn.com/w320/us.png', group: 'D', status: 'activo', stageReached: 'Octavos de Final' },
  { id: 'PAR', name: 'Paraguay', flag: '🇵🇾', flagUrl: 'https://flagcdn.com/w320/py.png', group: 'D', status: 'activo', stageReached: 'Octavos de Final' },
  { id: 'AUS', name: 'Australia', flag: '🇦🇺', flagUrl: 'https://flagcdn.com/w320/au.png', group: 'D', status: 'activo', stageReached: 'Octavos de Final' },
  { id: 'TUR', name: 'Turquía', flag: '🇹🇷', flagUrl: 'https://flagcdn.com/w320/tr.png', group: 'D', status: 'activo', stageReached: 'Octavos de Final' },
  // Grupo E
  { id: 'GER', name: 'Alemania', flag: '🇩🇪', flagUrl: 'https://flagcdn.com/w320/de.png', group: 'E', status: 'activo', stageReached: 'Octavos de Final' },
  { id: 'CUW', name: 'Curazao', flag: '🇨🇼', flagUrl: 'https://flagcdn.com/w320/cw.png', group: 'E', status: 'activo', stageReached: 'Octavos de Final' },
  { id: 'CIV', name: 'Costa de Marfil', flag: '🇨🇮', flagUrl: 'https://flagcdn.com/w320/ci.png', group: 'E', status: 'activo', stageReached: 'Octavos de Final' },
  { id: 'ECU', name: 'Ecuador', flag: '🇪🇨', flagUrl: 'https://flagcdn.com/w320/ec.png', group: 'E', status: 'activo', stageReached: 'Octavos de Final' },
  // Grupo F
  { id: 'NED', name: 'Países Bajos', flag: '🇳🇱', flagUrl: 'https://flagcdn.com/w320/nl.png', group: 'F', status: 'activo', stageReached: 'Octavos de Final' },
  { id: 'JPN', name: 'Japón', flag: '🇯🇵', flagUrl: 'https://flagcdn.com/w320/jp.png', group: 'F', status: 'activo', stageReached: 'Octavos de Final' },
  { id: 'SWE', name: 'Suecia', flag: '🇸🇪', flagUrl: 'https://flagcdn.com/w320/se.png', group: 'F', status: 'activo', stageReached: 'Octavos de Final' },
  { id: 'TUN', name: 'Túnez', flag: '🇹🇳', flagUrl: 'https://flagcdn.com/w320/tn.png', group: 'F', status: 'activo', stageReached: 'Octavos de Final' },
  // Grupo G
  { id: 'BEL', name: 'Bélgica', flag: '🇧🇪', flagUrl: 'https://flagcdn.com/w320/be.png', group: 'G', status: 'activo', stageReached: 'Octavos de Final' },
  { id: 'EGY', name: 'Egipto', flag: '🇪🇬', flagUrl: 'https://flagcdn.com/w320/eg.png', group: 'G', status: 'activo', stageReached: 'Octavos de Final' },
  { id: 'IRN', name: 'Irán', flag: '🇮🇷', flagUrl: 'https://flagcdn.com/w320/ir.png', group: 'G', status: 'activo', stageReached: 'Octavos de Final' },
  { id: 'NZL', name: 'Nueva Zelanda', flag: '🇳🇿', flagUrl: 'https://flagcdn.com/w320/nz.png', group: 'G', status: 'activo', stageReached: 'Octavos de Final' },
  // Grupo H
  { id: 'ESP', name: 'España', flag: '🇪🇸', flagUrl: 'https://flagcdn.com/w320/es.png', group: 'H', status: 'activo', stageReached: 'Octavos de Final' },
  { id: 'CPV', name: 'Islas de Cabo Verde', flag: '🇨🇻', flagUrl: 'https://flagcdn.com/w320/cv.png', group: 'H', status: 'activo', stageReached: 'Octavos de Final' },
  { id: 'KSA', name: 'Arabia Saudí', flag: '🇸🇦', flagUrl: 'https://flagcdn.com/w320/sa.png', group: 'H', status: 'activo', stageReached: 'Octavos de Final' },
  { id: 'URU', name: 'Uruguay', flag: '🇺🇾', flagUrl: 'https://flagcdn.com/w320/uy.png', group: 'H', status: 'activo', stageReached: 'Octavos de Final' },
  // Grupo I
  { id: 'FRA', name: 'Francia', flag: '🇫🇷', flagUrl: 'https://flagcdn.com/w320/fr.png', group: 'I', status: 'activo', stageReached: 'Octavos de Final' },
  { id: 'SEN', name: 'Senegal', flag: '🇸🇳', flagUrl: 'https://flagcdn.com/w320/sn.png', group: 'I', status: 'activo', stageReached: 'Octavos de Final' },
  { id: 'IRQ', name: 'Irak', flag: '🇮🇶', flagUrl: 'https://flagcdn.com/w320/iq.png', group: 'I', status: 'activo', stageReached: 'Octavos de Final' },
  { id: 'NOR', name: 'Noruega', flag: '🇳🇴', flagUrl: 'https://flagcdn.com/w320/no.png', group: 'I', status: 'activo', stageReached: 'Octavos de Final' },
  // Grupo J
  { id: 'ARG', name: 'Argentina', flag: '🇦🇷', flagUrl: 'https://flagcdn.com/w320/ar.png', group: 'J', status: 'activo', stageReached: 'Octavos de Final' },
  { id: 'ALG', name: 'Argelia', flag: '🇩🇿', flagUrl: 'https://flagcdn.com/w320/dz.png', group: 'J', status: 'activo', stageReached: 'Octavos de Final' },
  { id: 'AUT', name: 'Austria', flag: '🇦🇹', flagUrl: 'https://flagcdn.com/w320/at.png', group: 'J', status: 'activo', stageReached: 'Octavos de Final' },
  { id: 'JOR', name: 'Jordania', flag: '🇯🇴', flagUrl: 'https://flagcdn.com/w320/jo.png', group: 'J', status: 'activo', stageReached: 'Octavos de Final' },
  // Grupo K
  { id: 'POR', name: 'Portugal', flag: '🇵🇹', flagUrl: 'https://flagcdn.com/w320/pt.png', group: 'K', status: 'activo', stageReached: 'Octavos de Final' },
  { id: 'COD', name: 'RD Congo', flag: '🇨🇩', flagUrl: 'https://flagcdn.com/w320/cd.png', group: 'K', status: 'activo', stageReached: 'Octavos de Final' },
  { id: 'UZB', name: 'Uzbekistán', flag: '🇺🇿', flagUrl: 'https://flagcdn.com/w320/uz.png', group: 'K', status: 'activo', stageReached: 'Octavos de Final' },
  { id: 'COL', name: 'Colombia', flag: '🇨🇴', flagUrl: 'https://flagcdn.com/w320/co.png', group: 'K', status: 'activo', stageReached: 'Octavos de Final' },
  // Grupo L
  { id: 'ENG', name: 'Inglaterra', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', flagUrl: 'https://flagcdn.com/w320/gb-eng.png', group: 'L', status: 'activo', stageReached: 'Octavos de Final' },
  { id: 'CRO', name: 'Croacia', flag: '🇭🇷', flagUrl: 'https://flagcdn.com/w320/hr.png', group: 'L', status: 'activo', stageReached: 'Octavos de Final' },
  { id: 'GHA', name: 'Ghana', flag: '🇬🇭', flagUrl: 'https://flagcdn.com/w320/gh.png', group: 'L', status: 'activo', stageReached: 'Octavos de Final' },
  { id: 'PAN', name: 'Panamá', flag: '🇵🇦', flagUrl: 'https://flagcdn.com/w320/pa.png', group: 'L', status: 'activo', stageReached: 'Octavos de Final' },
];

export interface Team {
  id: string;
  name: string;
  flag: string;
  flagUrl: string;
  group: string;
  status: 'activo' | 'eliminado';
  stageReached: string;
}

export interface Participant {
  id: string;
  name: string;
  email: string;
  teamIds: string[];  // Ahora es un array para multiselección
  photoType: 'avatar' | 'upload';
  photo: string;
  status: 'activo' | 'eliminado';
}

export interface Match {
  id: number;
  stage: string;
  teamAId: string | null;
  teamBId: string | null;
  winnerId: string | null;
  date: string;
  venue: string;
  nextMatchId: number | null;
  slot: 'A' | 'B' | null;
}

export const GROUP_LABELS: Record<string, string> = {
  A: 'Grupo A',
  B: 'Grupo B',
  C: 'Grupo C',
  D: 'Grupo D',
  E: 'Grupo E',
  F: 'Grupo F',
  G: 'Grupo G',
  H: 'Grupo H',
  I: 'Grupo I',
  J: 'Grupo J',
  K: 'Grupo K',
  L: 'Grupo L',
};

export const MOCK_MATCHES: Match[] = [
  // OCTAVOS DE FINAL
  { id: 1, stage: 'Octavos', teamAId: 'MEX', teamBId: 'ITA', winnerId: null, date: '11 de Jun • 19:00', venue: 'Estadio Azteca, CDMX', nextMatchId: 9, slot: 'A' as const },
  { id: 2, stage: 'Octavos', teamAId: 'USA', teamBId: 'ENG', winnerId: null, date: '12 de Jun • 20:00', venue: 'MetLife Stadium, NY', nextMatchId: 9, slot: 'B' as const },
  { id: 3, stage: 'Octavos', teamAId: 'CAN', teamBId: 'CRO', winnerId: null, date: '13 de Jun • 18:00', venue: 'BC Place, Vancouver', nextMatchId: 10, slot: 'A' as const },
  { id: 4, stage: 'Octavos', teamAId: 'ARG', teamBId: 'BRA', winnerId: null, date: '14 de Jun • 20:30', venue: 'Estadio BBVA, MTY', nextMatchId: 10, slot: 'B' as const },
  { id: 5, stage: 'Octavos', teamAId: 'ESP', teamBId: 'GER', winnerId: null, date: '15 de Jun • 17:00', venue: 'SoFi Stadium, LA', nextMatchId: 11, slot: 'A' as const },
  { id: 6, stage: 'Octavos', teamAId: 'FRA', teamBId: 'POR', winnerId: null, date: '16 de Jun • 21:00', venue: 'Hard Rock, Miami', nextMatchId: 11, slot: 'B' as const },
  { id: 7, stage: 'Octavos', teamAId: 'JPN', teamBId: 'MAR', winnerId: null, date: '17 de Jun • 18:00', venue: 'Mercedes-Benz, Atlanta', nextMatchId: 12, slot: 'A' as const },
  { id: 8, stage: 'Octavos', teamAId: 'NED', teamBId: 'URU', winnerId: null, date: '18 de Jun • 19:00', venue: 'AT&T Stadium, Dallas', nextMatchId: 12, slot: 'B' as const },
  // CUARTOS DE FINAL
  { id: 9, stage: 'Cuartos', teamAId: null, teamBId: null, winnerId: null, date: '21 de Jun • 18:00', venue: 'Gillette Stadium, Boston', nextMatchId: 13, slot: 'A' as const },
  { id: 10, stage: 'Cuartos', teamAId: null, teamBId: null, winnerId: null, date: '22 de Jun • 20:00', venue: 'Arrowhead, KC', nextMatchId: 13, slot: 'B' as const },
  { id: 11, stage: 'Cuartos', teamAId: null, teamBId: null, winnerId: null, date: '23 de Jun • 19:00', venue: 'NRG Stadium, Houston', nextMatchId: 14, slot: 'A' as const },
  { id: 12, stage: 'Cuartos', teamAId: null, teamBId: null, winnerId: null, date: '24 de Jun • 18:30', venue: 'Levi\'s Stadium, SF', nextMatchId: 14, slot: 'B' as const },
  // SEMIFINALES
  { id: 13, stage: 'Semis', teamAId: null, teamBId: null, winnerId: null, date: '26 de Jun • 20:00', venue: 'MetLife Stadium, NY', nextMatchId: 15, slot: 'A' as const },
  { id: 14, stage: 'Semis', teamAId: null, teamBId: null, winnerId: null, date: '27 de Jun • 20:00', venue: 'Estadio Azteca, CDMX', nextMatchId: 15, slot: 'B' as const },
  // FINAL
  { id: 15, stage: 'Final', teamAId: null, teamBId: null, winnerId: null, date: '05 de Jul • 16:00', venue: 'MetLife Stadium, NY', nextMatchId: null, slot: null }
];
