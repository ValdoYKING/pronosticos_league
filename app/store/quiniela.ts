import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { MOCK_MATCHES, MOCK_PARTICIPANTS, MOCK_TEAMS } from '../lib/mockData';
import type { Team, Participant, Match } from '../lib/mockData';

type QuinielaState = {
  activeTab: string;
  teams: Team[];
  participants: Participant[];
  matches: Match[];
  myRegistration: Participant | null;
  loading: boolean;
  supabaseAvailable: boolean;
  supabaseResults: Record<number, { scoreA: number; scoreB: number; winnerId: string | null }>;
  setActiveTab: (tab: string) => void;
  fetchInitialData: () => Promise<void>;
  registerUser: (name: string, email: string, teamIds: string[], photoType: 'avatar' | 'upload', photo: string) => Promise<void>;
  registerUserWithoutTeams: (name: string, email: string, photoType: 'avatar' | 'upload', photo: string, drawCount?: number) => Promise<void>;
  assignRandomTeamToParticipant: (participantEmail: string) => Promise<{ team: any; assigned: boolean; isTopTeam?: boolean }>;
  deleteMyRegistration: () => Promise<void>;
  setMatchResult: (matchId: number, scoreA: number, scoreB: number) => void;
  resetTournament: () => Promise<void>;
  simulateRandom: () => Promise<void>;
  recalculateTournament: () => void;
  getGroupStandings: (group: string) => (Team & { pts: number; pj: number; pg: number; pe: number; pp: number; gf: number; gc: number; dif: number })[];
  sendAccessCode: (email: string) => Promise<boolean>;
  verifyAccessCode: (email: string, code: string) => Promise<boolean>;
  verifyAccessByName: (email: string) => Promise<boolean>;
  syncMatchResultsFromSupabase: () => Promise<void>;
  saveMatchResultToSupabase: (matchId: number, scoreA: number, scoreB: number, winnerId: string | null, updatedBy: string) => Promise<void>;
};

// ============================================================
// HELPERS - Solo se persiste myRegistration en localStorage
// para mantener la sesión del usuario al recargar la página.
// Los participantes se cargan siempre desde Supabase.
// ============================================================

function loadLocalRegistration(): Participant | null {
  try {
    const stored = localStorage.getItem('quiniela_my_registration');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function saveLocalRegistration(reg: Participant | null) {
  try {
    if (reg) {
      localStorage.setItem('quiniela_my_registration', JSON.stringify(reg));
    } else {
      localStorage.removeItem('quiniela_my_registration');
    }
  } catch { /* ignore */ }
}

const accessCodes: Record<string, { code: string; expiresAt: number }> = {};

function generateRandomCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Limpieza de datos obsoletos de participantes en localStorage
function clearObsoleteParticipantsCache() {
  try {
    localStorage.removeItem('quiniela_participants');
  } catch { /* ignore */ }
}

// ============================================================
// Función para calcular la clasificación desde grupos
// Devuelve los IDs de los 32 equipos clasificados
// ============================================================
function computeQualifiedTeams(teams: Team[], matches: Match[]): string[] {
  // Reiniciar stats de equipos
  const teamStats = teams.map(t => ({
    ...t,
    pts: 0, pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, dif: 0,
  }));

  // Procesar partidos de grupos con resultado
  const groupMatches = matches.filter((m): m is Match & { scoreA: number; scoreB: number } => m.stage === 'Grupos' && m.scoreA !== null && m.scoreB !== null);
  for (const m of groupMatches) {
    if (!m.teamAId || !m.teamBId) continue;
    const a = teamStats.find(t => t.id === m.teamAId);
    const b = teamStats.find(t => t.id === m.teamBId);
    if (!a || !b) continue;

    a.pj++; b.pj++;
    a.gf += m.scoreA; a.gc += m.scoreB;
    b.gf += m.scoreB; b.gc += m.scoreA;

    if (m.scoreA > m.scoreB) {
      a.pg++; b.pp++; a.pts += 3;
    } else if (m.scoreA < m.scoreB) {
      b.pg++; a.pp++; b.pts += 3;
    } else {
      a.pe++; b.pe++; a.pts += 1; b.pts += 1;
    }
  }

  // Calcular diferencia de gol
  for (const t of teamStats) {
    t.dif = t.gf - t.gc;
  }

  // Agrupar por grupo
  const groups: Record<string, typeof teamStats> = {};
  for (const t of teamStats) {
    if (!groups[t.group]) groups[t.group] = [];
    groups[t.group].push(t);
  }

  // Ordenar cada grupo: puntos > dif > gf
  for (const g of Object.keys(groups)) {
    groups[g].sort((a, b) => {
      if (b.pts !== a.pts) return b.pts - a.pts;
      if (b.dif !== a.dif) return b.dif - a.dif;
      return b.gf - a.gf;
    });
  }

  // Top 2 de cada grupo (24 equipos)
  const topTwo: string[] = [];
  const thirdPlaced: typeof teamStats = [];
  for (const g of Object.keys(groups).sort()) {
    const sorted = groups[g];
    topTwo.push(sorted[0].id, sorted[1].id);
    if (sorted[2]) thirdPlaced.push(sorted[2]);
  }

  // Ordenar los terceros lugares por puntos > dif > gf
  thirdPlaced.sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts;
    if (b.dif !== a.dif) return b.dif - a.dif;
    return b.gf - a.gf;
  });

  // Tomar los 8 mejores terceros
  const bestThirds = thirdPlaced.slice(0, 8).map(t => t.id);

  return [...topTwo, ...bestThirds];
}

// ============================================================
// TOP TEAMS - Equipos "estrella" para compensación
// Un participante con drawCount >= 2 que NO haya recibido
// un top_team en su primer sorteo, recibirá uno en el segundo
// (máximo 1 top_team por participante)
// ============================================================
const TOP_TEAM_IDS = [
  'ARG', // Argentina
  'BRA', // Brasil
  'FRA', // Francia
  'GER', // Alemania
  'ESP', // España
  'ENG', // Inglaterra
  'POR', // Portugal
  'NED', // Países Bajos
  'BEL', // Bélgica
  'ITA', // Italia
  'URU', // Uruguay
  'CRO', // Croacia
  'MEX', // México
  'JPN', // Japón
  'USA', // Estados Unidos
];

const useQuinielaStore = create<QuinielaState>((set, get) => ({
  activeTab: 'dashboard',
  teams: MOCK_TEAMS,
  participants: MOCK_PARTICIPANTS,
  matches: MOCK_MATCHES,
  myRegistration: loadLocalRegistration(),
  loading: false,
  supabaseAvailable: true,
  supabaseResults: {},

  setActiveTab: (tab) => set({ activeTab: tab }),

  fetchInitialData: async () => {
    // Limpiar datos obsoletos de participantes en localStorage
    clearObsoleteParticipantsCache();

    // Restaurar sesión desde localStorage mientras se cargan datos frescos
    const savedRegistration = loadLocalRegistration();
    if (savedRegistration) {
      set({ myRegistration: savedRegistration });
    }

    try {
      const { data: participantsData, error: participantsError } = await supabase
        .from('participants')
        .select('*');

      if (participantsError) {
        set({ supabaseAvailable: false, loading: false });
        return;
      }

      if (participantsData) {
        const mappedParticipants: Participant[] = participantsData.map((p: any) => ({
          id: p.email || p.id,
          name: p.name,
          email: p.email,
          teamIds: p.team_ids || (p.team_id ? [p.team_id] : []),
          photoType: p.photo_type === 'upload' && p.photo && p.photo.startsWith('http') ? 'upload' : 'avatar',
          photo: p.photo_type === 'upload' && p.photo && p.photo.startsWith('http') ? p.photo : (p.photo && p.photo.length <= 2 ? p.photo : '💼'),
          status: 'activo',
          drawCount: p.draw_count ?? 1,
        }));

        // Sincronizar myRegistration con datos frescos de Supabase
        const myReg = savedRegistration?.email
          ? mappedParticipants.find(p => p.email === savedRegistration.email)
          : null;
        if (myReg) {
          saveLocalRegistration(myReg);
          set({ myRegistration: myReg });
        } else if (savedRegistration) {
          // El usuario ya no existe en BD, limpiar sesión
          saveLocalRegistration(null);
          set({ myRegistration: null });
        }

        set({
          participants: mappedParticipants,
          supabaseAvailable: true,
        });
      } else {
        set({ supabaseAvailable: true, participants: [] });
      }
    } catch {
      set({ supabaseAvailable: false });
    }

    // Cargar resultados de partidos desde Supabase
    await get().syncMatchResultsFromSupabase();

    set({ loading: false });
    get().recalculateTournament();
  },

  registerUser: async (name, email, teamIds, photoType, photo) => {
    try {
      let finalPhotoType = photoType;
      let photoUrl = photo;

      if (photoType === 'upload' && photo.startsWith('data:')) {
        try {
          const response = await fetch(photo);
          const blob = await response.blob();
          const fileExt = blob.type.split('/')[1] || 'png';
          const fileName = `${Date.now()}_${name.replace(/[^a-zA-Z0-9]/g, '_')}.${fileExt}`;
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('participant-photos')
            .upload(fileName, blob, { contentType: blob.type, upsert: true });
          if (uploadError) {
            finalPhotoType = 'avatar';
            photoUrl = '💼';
          } else {
            const { data: urlData } = supabase.storage.from('participant-photos').getPublicUrl(fileName);
            photoUrl = urlData.publicUrl;
          }
        } catch {
          finalPhotoType = 'avatar';
          photoUrl = '💼';
        }
      }
      if (finalPhotoType === 'upload' && (photoUrl.length <= 2 || photoUrl === '💼')) {
        finalPhotoType = 'avatar';
      }

      const newParticipant: Participant = {
        id: email, name, email, teamIds,
        photoType: finalPhotoType, photo: photoUrl, status: 'activo',
        drawCount: 1,
      };

      // Persistir en Supabase
      try {
        const { data: existingReg } = await supabase.from('participants').select('id').eq('email', email).maybeSingle();
        if (existingReg) {
          await supabase.from('participants').update({
            name, team_ids: teamIds, team_id: teamIds[0] || null,
            photo_type: finalPhotoType, photo: photoUrl, draw_count: 1, updated_at: new Date().toISOString(),
          }).eq('email', email);
        } else {
          await supabase.from('participants').insert({
            name, email, team_ids: teamIds, team_id: teamIds[0] || null,
            photo_type: finalPhotoType, photo: photoUrl, draw_count: 1,
          });
        }
      } catch (error) {
        toast.error('Error al conectar con la base de datos. Intenta de nuevo.');
        return;
      }

      const state = get();
      const filteredParticipants = state.participants.filter(p => p.email !== email);
      const updatedParticipants = [...filteredParticipants, newParticipant];
      saveLocalRegistration(newParticipant);
      set({ participants: updatedParticipants, myRegistration: newParticipant, activeTab: 'representantes' });
      get().recalculateTournament();
      const allTeams = get().teams;
      const teamsStr = teamIds.map((id: string) => allTeams.find(t => t.id === id)?.name).filter(Boolean).join(', ');
      toast.success(`¡Registro completado! Ahora representas a: ${teamsStr}`);
    } catch (error) {
      toast.error('Error al registrar usuario. Intenta de nuevo.');
    }
  },

  // ============================================================
  // registerUserWithoutTeams - Registra solo nombre + avatar
  // Sin selección de equipos (se asignarán en el sorteo)
  // Acepta drawCount opcional (por defecto 1)
  // ============================================================
  registerUserWithoutTeams: async (name, email, photoType, photo, drawCount = 1) => {
    try {
      let finalPhotoType = photoType;
      let photoUrl = photo;

      if (photoType === 'upload' && photo.startsWith('data:')) {
        try {
          const response = await fetch(photo);
          const blob = await response.blob();
          const fileExt = blob.type.split('/')[1] || 'png';
          const fileName = `${Date.now()}_${name.replace(/[^a-zA-Z0-9]/g, '_')}.${fileExt}`;
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('participant-photos')
            .upload(fileName, blob, { contentType: blob.type, upsert: true });
          if (uploadError) {
            finalPhotoType = 'avatar';
            photoUrl = '💼';
          } else {
            const { data: urlData } = supabase.storage.from('participant-photos').getPublicUrl(fileName);
            photoUrl = urlData.publicUrl;
          }
        } catch {
          finalPhotoType = 'avatar';
          photoUrl = '💼';
        }
      }
      if (finalPhotoType === 'upload' && (photoUrl.length <= 2 || photoUrl === '💼')) {
        finalPhotoType = 'avatar';
      }

      // Sin equipos todavía
      const emptyTeamIds: string[] = [];

      const newParticipant: Participant = {
        id: email, name, email,
        teamIds: emptyTeamIds,
        photoType: finalPhotoType, photo: photoUrl, status: 'activo',
        drawCount: drawCount,
      };

      // Persistir en Supabase
      try {
        const { data: existingReg } = await supabase.from('participants').select('id').eq('email', email).maybeSingle();
        if (existingReg) {
          await supabase.from('participants').update({
            name, team_ids: emptyTeamIds, team_id: null,
            photo_type: finalPhotoType, photo: photoUrl,
            draw_count: drawCount,
            updated_at: new Date().toISOString(),
          }).eq('email', email);
        } else {
          await supabase.from('participants').insert({
            name, email, team_ids: emptyTeamIds, team_id: null,
            photo_type: finalPhotoType, photo: photoUrl,
            draw_count: drawCount,
          });
        }
      } catch (error) {
        toast.error('Error al conectar con la base de datos. Intenta de nuevo.');
        return;
      }

      const state = get();
      const filteredParticipants = state.participants.filter(p => p.email !== email);
      const updatedParticipants = [...filteredParticipants, newParticipant];
      set({ participants: updatedParticipants });
      get().recalculateTournament();
      
    } catch (error) {
      toast.error('Error al registrar usuario. Intenta de nuevo.');
    }
  },

  // ============================================================
  // assignRandomTeamToParticipant - Asigna un equipo aleatorio
  // a un participante. Solo asigna equipos que NO tengan
  // representante aún (equipos disponibles).
  //
  // REGLA DE COMPENSACIÓN (TOP TEAMS):
  // - Si el participante tiene drawCount >= 2 y su primer equipo
  //   NO fue un top_team, en su segundo sorteo se le asigna
  //   automáticamente un top_team disponible.
  // - Máximo 1 top_team por participante.
  // - Si ningún top_team está disponible, se asigna uno normal.
  //
  // Además, actualiza el avatar del participante con la bandera
  // del equipo que le tocó.
  // ============================================================
  assignRandomTeamToParticipant: async (participantEmail: string) => {
    const state = get();
    const participant = state.participants.find(p => p.email === participantEmail);
    if (!participant) {
      toast.error('Participante no encontrado.');
      return { team: null, assigned: false };
    }

    const allTeams = state.teams;
    const currentTeamIds = participant.teamIds || [];
    const drawCount = participant.drawCount ?? 1;
    
    // IDs de equipos que ya tienen representante
    const assignedTeamIds = new Set<string>();
    for (const p of state.participants) {
      if (p.teamIds) {
        for (const tid of p.teamIds) {
          assignedTeamIds.add(tid);
        }
      }
    }

    // Equipos disponibles = todos - los que ya tienen representante
    const availableTeams = allTeams.filter(t => !assignedTeamIds.has(t.id));

    if (availableTeams.length === 0) {
      toast.error('¡Todos los equipos ya tienen representante! No hay equipos disponibles.');
      return { team: null, assigned: false };
    }

    // ============================================================
    // LÓGICA DE COMPENSACIÓN CON TOP TEAMS
    // ============================================================
    let selectedTeam: any = null;

    const alreadyHasTopTeam = currentTeamIds.some(tid => TOP_TEAM_IDS.includes(tid));

    // ¿Este participante es candidato a compensación?
    // drawCount >= 2, NO tiene top_team aún, y este es su segundo sorteo (o posterior)
    const isCompensationEligible = drawCount >= 2 && !alreadyHasTopTeam && currentTeamIds.length > 0;

    if (isCompensationEligible) {
      // Filtrar top_teams disponibles
      const availableTopTeams = availableTeams.filter(t => TOP_TEAM_IDS.includes(t.id));

      if (availableTopTeams.length > 0) {
        // Asignar un top_team aleatorio disponible
        const randomTopIndex = Math.floor(Math.random() * availableTopTeams.length);
        selectedTeam = availableTopTeams[randomTopIndex];
      } else {
        // No hay top_teams disponibles, asignar equipo normal
        const randomIndex = Math.floor(Math.random() * availableTeams.length);
        selectedTeam = availableTeams[randomIndex];
      }
    } else {
      // Sorteo normal: cualquier equipo disponible
      const randomIndex = Math.floor(Math.random() * availableTeams.length);
      selectedTeam = availableTeams[randomIndex];
    }

    // Asignar el equipo al participante (agregar a su array)
    const updatedTeamIds = [...currentTeamIds, selectedTeam.id];

    // Actualizar el avatar del participante con la bandera del equipo asignado
    const updatedPhotoType: 'avatar' | 'upload' = 'upload';
    const updatedPhoto = selectedTeam.flagUrl;

    // Actualizar en store
    const updatedParticipants = state.participants.map(p => {
      if (p.email === participantEmail) {
        return {
          ...p,
          teamIds: updatedTeamIds,
          photoType: updatedPhotoType,
          photo: updatedPhoto,
        };
      }
      return p;
    });
    
    // Si el participante sorteado es el que tiene la sesión activa, también actualizar myRegistration
    let updatedMyRegistration = state.myRegistration;
    if (state.myRegistration?.email === participantEmail) {
      updatedMyRegistration = {
        ...state.myRegistration,
        teamIds: updatedTeamIds,
        photoType: updatedPhotoType,
        photo: updatedPhoto,
      };
      saveLocalRegistration(updatedMyRegistration);
    }

    set({ participants: updatedParticipants, myRegistration: updatedMyRegistration });

    // Persistir en Supabase
    try {
      const { data: existingReg } = await supabase.from('participants').select('id').eq('email', participantEmail).maybeSingle();
      if (existingReg) {
        await supabase.from('participants').update({
          team_ids: updatedTeamIds,
          team_id: updatedTeamIds[0] || null,
          photo_type: updatedPhotoType,
          photo: updatedPhoto,
          updated_at: new Date().toISOString(),
        }).eq('email', participantEmail);
      }
    } catch { /* ignore */ }

    get().recalculateTournament();
    
    // Mensaje especial si fue compensación
    if (isCompensationEligible && TOP_TEAM_IDS.includes(selectedTeam.id)) {
      toast.success(`🎯 ¡Compensación activada! ${participant.name} recibe a ${selectedTeam.flag} ${selectedTeam.name} como equipo estrella.`, {
        duration: 5000,
      });
    }
    
    return { team: selectedTeam, assigned: true, isTopTeam: TOP_TEAM_IDS.includes(selectedTeam.id) };
  },

  deleteMyRegistration: async () => {
    const { myRegistration } = get();
    if (myRegistration?.email) {
      if (myRegistration.photoType === 'upload' && myRegistration.photo?.length > 2 && myRegistration.photo.startsWith('http')) {
        try {
          const fileName = myRegistration.photo.split('/').pop()?.split('?')[0];
          if (fileName) await supabase.storage.from('participant-photos').remove([fileName]);
        } catch { /* ignore */ }
      }
      try { await supabase.from('participants').delete().eq('email', myRegistration.email); } catch { /* ignore */ }
      const state = get();
      const updatedParticipants = state.participants.filter(p => p.email !== myRegistration.email);
      saveLocalRegistration(null);
      set({ participants: updatedParticipants, myRegistration: null });
    } else {
      saveLocalRegistration(null);
      set({ myRegistration: null });
    }
    get().recalculateTournament();
    toast.warning('Tu registro ha sido eliminado de la quiniela.');
  },

  // ============================================================
  // NUEVO: Obtener tabla de posiciones de un grupo
  // ============================================================
  getGroupStandings: (group: string) => {
    const { teams, matches } = get();
    const groupTeams = teams.filter(t => t.group === group);
    const stats = groupTeams.map(t => ({
      ...t,
      pts: 0, pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, dif: 0,
    }));

    const groupMatches = matches.filter((m): m is Match & { scoreA: number; scoreB: number } => m.stage === 'Grupos' && m.group === group && m.scoreA !== null && m.scoreB !== null);
    for (const m of groupMatches) {
      if (!m.teamAId || !m.teamBId) continue;
      const a = stats.find(s => s.id === m.teamAId);
      const b = stats.find(s => s.id === m.teamBId);
      if (!a || !b) continue;
      a.pj++; b.pj++;
      a.gf += m.scoreA; a.gc += m.scoreB;
      b.gf += m.scoreB; b.gc += m.scoreA;
      if (m.scoreA > m.scoreB) { a.pg++; b.pp++; a.pts += 3; }
      else if (m.scoreA < m.scoreB) { b.pg++; a.pp++; b.pts += 3; }
      else { a.pe++; b.pe++; a.pts += 1; b.pts += 1; }
    }
    for (const s of stats) s.dif = s.gf - s.gc;
    stats.sort((a, b) => {
      if (b.pts !== a.pts) return b.pts - a.pts;
      if (b.dif !== a.dif) return b.dif - a.dif;
      return b.gf - a.gf;
    });
    return stats;
  },

  // ============================================================
  // setMatchResult - asigna goles a un partido y persiste en Supabase
  // ============================================================
  setMatchResult: (matchId, scoreA, scoreB) => {
    let winnerId: string | null = null;

    set(state => {
      const matches = state.matches.map(m => {
        if (m.id !== matchId) return m;
        // Determinar ganador (para eliminatorias)
        if (m.stage !== 'Grupos' && scoreA !== null && scoreB !== null) {
          if (scoreA > scoreB) winnerId = m.teamAId;
          else if (scoreB > scoreA) winnerId = m.teamBId;
          // Si hay empate en eliminatorias, no hay ganador aún (se define manualmente)
        }
        return { ...m, scoreA, scoreB, winnerId };
      });
      return { matches };
    });

    get().recalculateTournament();

    // Persistir en Supabase (solo si hay conexión)
    const state = get();
    if (state.supabaseAvailable && state.myRegistration?.email) {
      get().saveMatchResultToSupabase(matchId, scoreA, scoreB, winnerId, state.myRegistration.email);
    }

    // Mostrar toast
    const match = get().matches.find(m => m.id === matchId);
    if (match) {
      if (match.stage === 'Grupos') {
        toast.success(`Resultado registrado: ${match.teamAId} ${scoreA} - ${scoreB} ${match.teamBId}`);
      } else {
        const winnerTeam = match.winnerId ? get().teams.find(t => t.id === match.winnerId) : null;
        if (winnerTeam) {
          toast.success(`¡${winnerTeam.flag} ${winnerTeam.name} avanza a la siguiente fase!`);
        }
      }
    }
  },

  // ============================================================
  // recalculateTournament - con protección: si no hay resultados
  // de grupos, no elimina equipos ni llena eliminatorias
  // ============================================================
  recalculateTournament: () => {
    set(state => {
      // Deep copy de equipos - resetear status
      const teams = state.teams.map(t => ({
        ...t,
        status: 'activo' as 'activo' | 'eliminado',
        stageReached: 'Fase de Grupos',
        pts: 0, pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, dif: 0,
      }));

      // Deep copy de matches - resetear eliminatorias
      const matches = state.matches.map(m => {
        if (m.stage === 'Grupos') return { ...m };
        // Reset eliminatorias pero preservar scores si ya existen
        return { ...m, teamAId: null, teamBId: null, winnerId: null };
      });

      // === FASE 1: Procesar resultados de grupos ===
      const groupMatches = matches.filter((m): m is Match & { scoreA: number; scoreB: number } => m.stage === 'Grupos' && m.scoreA !== null && m.scoreB !== null);
      for (const m of groupMatches) {
        if (!m.teamAId || !m.teamBId) continue;
        const a = teams.find(t => t.id === m.teamAId);
        const b = teams.find(t => t.id === m.teamBId);
        if (!a || !b) continue;
        a.pj!++; b.pj!++;
        a.gf! += m.scoreA; a.gc! += m.scoreB;
        b.gf! += m.scoreB; b.gc! += m.scoreA;
        if (m.scoreA > m.scoreB) { a.pg!++; b.pp!++; a.pts! += 3; }
        else if (m.scoreA < m.scoreB) { b.pg!++; a.pp!++; b.pts! += 3; }
        else { a.pe!++; b.pe!++; a.pts! += 1; b.pts! += 1; }
      }
      for (const t of teams) t.dif = t.gf! - t.gc!;

      // ════════════════════════════════════════════════════════════
      // PROTECCIÓN: Si NO hay resultados de grupos, no se ejecuta
      // la lógica de clasificación ni se llena el bracket.
      // Todos los equipos se quedan en "Fase de Grupos" con status "activo".
      // ════════════════════════════════════════════════════════════
      const hayResultadosDeGrupos = groupMatches.length > 0;

      if (!hayResultadosDeGrupos) {
        // Sin resultados aún: equipos y participantes todos activos
        const participants = state.participants.map(p => ({ ...p, status: 'activo' as const }));
        let myRegistration = state.myRegistration ? { ...state.myRegistration, status: 'activo' as const } : null;
        return { teams, matches, participants, myRegistration };
      }

      // === FASE 2: Determinar clasificados (solo si hay resultados) ===
      const qualified = computeQualifiedTeams(teams, matches);

      // Marcar equipos no clasificados como eliminados
      for (const t of teams) {
        if (!qualified.includes(t.id)) {
          t.status = 'eliminado';
        } else {
          t.stageReached = 'Dieciseisavos de Final';
        }
      }

      // === FASE 3: Llenar bracket de Dieciseisavos ===
      const d16Matches = matches.filter(m => m.stage === 'Dieciseisavos').sort((a, b) => a.id - b.id);

      // Asignación estándar para 32 equipos:
      // 1A vs 3B/C/D/E/F, 2A vs 2B, 1B vs 3A/C/D/E/F, etc.
      // Usamos un bracket predefinido basado en la clasificación final
      const byGroup: Record<string, string[]> = {};
      const groups = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
      for (const g of groups) {
        const standings = get().getGroupStandings(g);
        byGroup[g] = standings.filter(s => qualified.includes(s.id)).map(s => s.id);
        // Si hay 3 clasificados del grupo, el 3° es un mejor tercero
      }

      // Bracket de Dieciseisavos (cruce estándar de grupos)
      // Partido 1: 1A vs 3B/C/D/E/F (el mejor tercero)
      // Partido 2: 2A vs 2B
      // Partido 3: 1B vs 3A/C/D/E/F
      // Partido 4: 2C vs 2D
      // ... y así sucesivamente

      // Para simplificar, usamos un bracket fijo ordenado por la clasificación
      const order: string[] = [];
      for (const g of groups) {
        if (byGroup[g] && byGroup[g].length > 0) {
          // 1° del grupo
          order.push(byGroup[g][0]);
        }
      }
      for (const g of groups) {
        if (byGroup[g] && byGroup[g].length > 1) {
          // 2° del grupo
          order.push(byGroup[g][1]);
        }
      }
      // Mejores terceros (los que tengan 3 o más clasificados)
      for (const g of groups) {
        if (byGroup[g] && byGroup[g].length > 2) {
          order.push(byGroup[g][2]);
        }
      }

      // Asignar a los 16 partidos de Dieciseisavos
      const totalTeams = Math.min(order.length, 32);
      for (let i = 0; i < 16 && i * 2 + 1 < totalTeams; i++) {
        if (d16Matches[i]) {
          d16Matches[i].teamAId = order[i % totalTeams];
          d16Matches[i].teamBId = order[(i + 16) % totalTeams];
        }
      }

      // === FASE 4: Procesar eliminatorias ===
      // Orden: Dieciseisavos -> Octavos -> Cuartos -> Semis -> Final
      const elimStages = ['Dieciseisavos', 'Octavos', 'Cuartos', 'Semis', 'Final'];
      for (const stage of elimStages) {
        const stageMatches = matches.filter(m => m.stage === stage).sort((a, b) => a.id - b.id);
        for (const m of stageMatches) {
          // Si el partido no tiene equipos, saltar
          if (!m.teamAId || !m.teamBId) continue;

          // Si tiene resultado (score), determinar winnerId
          if (m.scoreA !== null && m.scoreB !== null) {
            if (m.scoreA > m.scoreB) {
              m.winnerId = m.teamAId;
            } else if (m.scoreB > m.scoreA) {
              m.winnerId = m.teamBId;
            }
            // Si es empate, se deja winnerId como null (se define manualmente)
          }

          // Si hay ganador, propagar al siguiente partido
          if (m.winnerId && m.nextMatchId) {
            const nextMatch = matches.find(nm => nm.id === m.nextMatchId);
            if (nextMatch) {
              if (m.slot === 'A') nextMatch.teamAId = m.winnerId;
              else nextMatch.teamBId = m.winnerId;
            }

            // Actualizar etapa del equipo ganador
            const winnerTeam = teams.find(t => t.id === m.winnerId);
            if (winnerTeam) {
              if (stage === 'Dieciseisavos') winnerTeam.stageReached = 'Octavos de Final';
              else if (stage === 'Octavos') winnerTeam.stageReached = 'Cuartos de Final';
              else if (stage === 'Cuartos') winnerTeam.stageReached = 'Semifinales';
              else if (stage === 'Semis') winnerTeam.stageReached = 'Final';
              else if (stage === 'Final') winnerTeam.stageReached = '¡Campeón!';
            }

            // Perdedor queda eliminado
            const loserId = m.winnerId === m.teamAId ? m.teamBId : m.teamAId;
            if (loserId) {
              const loserTeam = teams.find(t => t.id === loserId);
              if (loserTeam) loserTeam.status = 'eliminado';
            }
          }
        }
      }

      // === FASE 5: Actualizar participantes ===
      const participants = state.participants.map(p => {
        if (!p.teamIds || p.teamIds.length === 0) {
          return { ...p, status: 'eliminado' as const };
        }
        const anyActive = p.teamIds.some(tid => {
          const team = teams.find(t => t.id === tid);
          return team && team.status === 'activo';
        });
        return { ...p, status: anyActive ? 'activo' as const : 'eliminado' as const };
      });

      let myRegistration = state.myRegistration ? { ...state.myRegistration } : null;
      if (myRegistration) {
        if (!myRegistration.teamIds || myRegistration.teamIds.length === 0) {
          myRegistration.status = 'eliminado';
        } else {
          const anyActive = myRegistration.teamIds.some(tid => {
            const team = teams.find(t => t.id === tid);
            return team && team.status === 'activo';
          });
          myRegistration.status = anyActive ? 'activo' : 'eliminado';
        }
      }

      return { teams, matches, participants, myRegistration };
    });
  },

  resetTournament: async () => {
    set(state => {
      const matches = state.matches.map(m => ({
        ...m,
        winnerId: null,
        scoreA: null,
        scoreB: null,
        teamAId: m.stage === 'Grupos' ? m.teamAId : null,
        teamBId: m.stage === 'Grupos' ? m.teamBId : null,
      }));
      return { matches };
    });
    get().recalculateTournament();
    toast.warning('Torneo reiniciado. Todos los equipos vuelven a Fase de Grupos.');
  },

  simulateRandom: async () => {
    await get().resetTournament();

    // Simular fase de grupos: asignar goles aleatorios
    set(state => {
      const matches = state.matches.map(m => {
        if (m.stage !== 'Grupos' || !m.teamAId || !m.teamBId) return m;
        const golesA = Math.floor(Math.random() * 5);
        const golesB = Math.floor(Math.random() * 5);
        return { ...m, scoreA: golesA, scoreB: golesB };
      });
      return { matches };
    });

    get().recalculateTournament();

    // Simular eliminatorias: propagar hacia adelante
    const elimStages = ['Dieciseisavos', 'Octavos', 'Cuartos', 'Semis', 'Final'];
    for (const stage of elimStages) {
      set(state => {
        const matches = state.matches.map(m => {
          if (m.stage !== stage || !m.teamAId || !m.teamBId) return m;
          const golesA = Math.floor(Math.random() * 5);
          const golesB = Math.floor(Math.random() * 5);
          // Evitar empates en eliminatorias
          if (golesA === golesB) {
            return { ...m, scoreA: golesA, scoreB: golesB + 1 };
          }
          return { ...m, scoreA: golesA, scoreB: golesB };
        });
        return { matches };
      });
      get().recalculateTournament();
    }

    const winner = get().teams.find(t => t.stageReached === '¡Campeón!');
    if (winner) {
      toast.success(`¡${winner.flag} ${winner.name} es el CAMPEÓN MUNDIAL 2026!`);
    } else {
      toast.success('¡Torneo simulado completamente!');
    }
  },

  sendAccessCode: async (email: string) => {
    set({ loading: true });
    const state = get();
    const participant = state.participants.find(p => p.email.toLowerCase() === email.toLowerCase());
    if (!participant) {
      set({ loading: false });
      toast.error('Este correo no está registrado en la quiniela. ¿Ya te registraste?');
      return false;
    }

    const code = generateRandomCode();
    const expiresAt = Date.now() + 10 * 60 * 1000;
    accessCodes[email.toLowerCase()] = { code, expiresAt };
    console.log(`[ACCESS CODE for ${email}]: ${code}`);

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: email, userName: participant.name, subject: '🔑 Tu código de acceso a la Quiniela de la Oficina', accessCode: code }),
      });
      if (!response.ok) {
        toast.success(`🔑 Código de acceso: ${code}`, {
          description: `📧 Para ${email} — No se pudo enviar el correo. Código: ${code}. Válido por 10 min.`,
          duration: 60000, position: 'top-center',
        });
      } else {
        toast.success(`🔑 Código de acceso enviado a ${email}`, {
          description: '📧 Revisa tu bandeja de entrada. Válido por 10 minutos.',
          duration: 60000, position: 'top-center',
        });
      }
    } catch {
      toast.success(`🔑 Código de acceso: ${code}`, {
        description: `📧 Para ${email} — (Error de red) Código: ${code}. Válido por 10 min.`,
        duration: 60000, position: 'top-center',
      });
    }
    set({ loading: false });
    return true;
  },

  verifyAccessCode: async (email: string, code: string) => {
    set({ loading: true });
    const stored = accessCodes[email.toLowerCase()];
    if (!stored) {
      set({ loading: false });
      toast.error('No se ha solicitado un código para este correo.');
      return false;
    }
    if (Date.now() > stored.expiresAt) {
      delete accessCodes[email.toLowerCase()];
      set({ loading: false });
      toast.error('El código ha expirado. Solicita uno nuevo.');
      return false;
    }
    if (stored.code !== code) {
      set({ loading: false });
      toast.error('Código incorrecto. Verifica e intenta de nuevo.');
      return false;
    }
    const participant = get().participants.find(p => p.email.toLowerCase() === email.toLowerCase());
    if (participant) {
      saveLocalRegistration(participant);
      set({ myRegistration: participant });
      delete accessCodes[email.toLowerCase()];
      set({ loading: false });
      return true;
    }
    set({ loading: false });
    toast.error('No se encontró tu registro.');
    return false;
  },

  // ============================================================
  // verifyAccessByName - Acceso directo por nombre (sin correo)
  // Busca al participante por su email (ahora interno) y carga su sesión
  // ============================================================
  verifyAccessByName: async (email: string) => {
    set({ loading: true });

    const participant = get().participants.find(p => p.email.toLowerCase() === email.toLowerCase());

    if (!participant) {
      set({ loading: false });
      toast.error('No se encontró tu registro.');
      return false;
    }

    saveLocalRegistration(participant);
    set({ myRegistration: participant, loading: false });
    return true;
  },

  // ============================================================
  // Sincronizar resultados desde Supabase (match_results)
  // ============================================================
  syncMatchResultsFromSupabase: async () => {
    try {
      const { data, error } = await supabase
        .from('match_results')
        .select('match_id, team_a_score, team_b_score, winner_id');
      if (error) {
        console.warn('[syncMatchResults] Error fetching from Supabase:', error.message);
        return;
      }

      if (!data || data.length === 0) return;

      // Construir mapa de resultados
      const resultsMap: Record<number, { scoreA: number; scoreB: number; winnerId: string | null }> = {};
      for (const row of data) {
        if (row.team_a_score !== null && row.team_b_score !== null) {
          resultsMap[row.match_id] = {
            scoreA: row.team_a_score,
            scoreB: row.team_b_score,
            winnerId: row.winner_id || null,
          };
        }
      }

      // Actualizar matches con los resultados de Supabase
      set(state => {
        const updatedMatches = state.matches.map(m => {
          const result = resultsMap[m.id];
          if (result) {
            let winnerId = m.winnerId;
            if (m.stage !== 'Grupos' && result.scoreA !== null && result.scoreB !== null) {
              if (result.scoreA > result.scoreB) winnerId = m.teamAId;
              else if (result.scoreB > result.scoreA) winnerId = m.teamBId;
            }
            // Para grupos, el winnerId se mantiene de la lógica local
            return {
              ...m,
              scoreA: result.scoreA,
              scoreB: result.scoreB,
              winnerId: winnerId || result.winnerId || m.winnerId,
            };
          }
          return m;
        });
        return { matches: updatedMatches, supabaseResults: resultsMap };
      });

      // Recalcular torneo después de aplicar resultados
      get().recalculateTournament();
    } catch (err) {
      console.warn('[syncMatchResults] Error:', err);
    }
  },

  // ============================================================
  // Guardar resultado de un partido en Supabase
  // ============================================================
  saveMatchResultToSupabase: async (matchId, scoreA, scoreB, winnerId, updatedBy) => {
    try {
      // Upsert: inserta o actualiza si ya existe
      const { error } = await supabase
        .from('match_results')
        .upsert({
          match_id: matchId,
          team_a_score: scoreA,
          team_b_score: scoreB,
          winner_id: winnerId,
          updated_by: updatedBy,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'match_id',
        });

      if (error) {
        console.warn('[saveMatchResult] Error saving to Supabase:', error.message);
      }
    } catch (err) {
      console.warn('[saveMatchResult] Error:', err);
    }
  },
}));

export default useQuinielaStore;

