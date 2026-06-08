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
  setActiveTab: (tab: string) => void;
  fetchInitialData: () => Promise<void>;
  registerUser: (name: string, email: string, teamIds: string[], photoType: 'avatar' | 'upload', photo: string) => Promise<void>;
  deleteMyRegistration: () => Promise<void>;
  setMatchWinner: (matchId: number, winnerId: string) => Promise<void>;
  resetTournament: () => Promise<void>;
  simulateRandom: () => Promise<void>;
  recalculateTournament: () => void;
  // Login/Access code methods
  sendAccessCode: (email: string) => Promise<boolean>;
  verifyAccessCode: (email: string, code: string) => Promise<boolean>;
};

// Helper: cargar participantes desde localStorage como fallback
function loadLocalParticipants(): Participant[] {
  try {
    const stored = localStorage.getItem('quiniela_participants');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveLocalParticipants(participants: Participant[]) {
  try {
    localStorage.setItem('quiniela_participants', JSON.stringify(participants));
  } catch { /* ignore */ }
}

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

// Access codes storage (simulated - in a real app this would be server-side/email API)
const accessCodes: Record<string, { code: string; expiresAt: number }> = {};

function generateRandomCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

const useQuinielaStore = create<QuinielaState>((set, get) => ({
  activeTab: 'dashboard',
  teams: MOCK_TEAMS,
  participants: MOCK_PARTICIPANTS,
  matches: MOCK_MATCHES,
  myRegistration: loadLocalRegistration(),
  loading: false,
  supabaseAvailable: true,

  setActiveTab: (tab) => set({ activeTab: tab }),

  fetchInitialData: async () => {
    // Intentar cargar desde localStorage primero (rápido)
    const localParticipants = loadLocalParticipants();
    const localRegistration = loadLocalRegistration();
    if (localParticipants.length > 0) {
      set({
        participants: localParticipants,
        myRegistration: localRegistration,
      });
    }
    if (localRegistration) {
      set({ myRegistration: localRegistration });
    }

    // Intentar cargar desde Supabase (para tener datos actualizados)
    try {
      const { data: participantsData, error: participantsError } = await supabase
        .from('participants')
        .select('*');

      if (participantsError) {
        // Silencio total - ya tenemos datos de localStorage
        set({ supabaseAvailable: false });
      } else if (participantsData) {
        // Mapear participantes desde Supabase
        const mappedParticipants: Participant[] = participantsData.map((p: any) => {
          let finalPhotoType = p.photo_type || 'avatar';
          let finalPhoto = p.photo || null;

          // Si el photo es null o vacío, intentar preservar datos de localStorage
          if (!finalPhoto || finalPhoto.length <= 2) {
            const localData = localParticipants.find(lp => lp.email === p.email);
            if (localData && localData.photoType === 'upload' && localData.photo && localData.photo.length > 2) {
              // Preservar los datos del localStorage que sí tienen la foto
              finalPhotoType = localData.photoType;
              finalPhoto = localData.photo;
            } else {
              finalPhoto = '💼';
              if (finalPhotoType === 'upload') finalPhotoType = 'avatar';
            }
          }

          // Validar que la URL sea válida
          if (finalPhotoType === 'upload' && finalPhoto !== '💼' && !finalPhoto.startsWith('http') && !finalPhoto.startsWith('data:')) {
            finalPhotoType = 'avatar';
            finalPhoto = '💼';
          }

          return {
            id: p.email || p.id,
            name: p.name,
            email: p.email,
            teamIds: p.team_ids || [p.team_id].filter(Boolean), // compatibilidad: team_id singular también
            photoType: finalPhotoType,
            photo: finalPhoto,
            status: 'activo',
          };
        });
        
        // Fusionar: datos de Supabase tienen prioridad, pero preservamos fotos de localStorage
        // que no están en Supabase
        const mergedParticipants = [...mappedParticipants];
        
        // Agregar participantes de localStorage que no estén en Supabase
        for (const localP of localParticipants) {
          const existsInSupabase = mergedParticipants.some(mp => mp.email === localP.email);
          if (!existsInSupabase) {
            mergedParticipants.push(localP);
          }
        }
        
        // Actualizar localStorage con datos fusionados
        saveLocalParticipants(mergedParticipants);
        
        // Buscar si nuestro registro está en Supabase o localStorage
        const myReg = localRegistration?.email 
          ? mergedParticipants.find(p => p.email === localRegistration.email)
          : null;
        
        // Si encontramos nuestro registro, actualizar localStorage con datos fresh
        if (myReg) {
          saveLocalRegistration(myReg);
        }
        
        set({ 
          participants: mergedParticipants, 
          myRegistration: myReg || localRegistration,
          supabaseAvailable: true 
        });
      }
    } catch (error) {
      // Ignorar error - ya tenemos localStorage
      set({ supabaseAvailable: false });
    }

    set({ loading: false });
    get().recalculateTournament();
  },

  registerUser: async (name, email, teamIds, photoType, photo) => {
    try {
      let finalPhotoType = photoType;
      let photoUrl = photo;

      // If it's an uploaded photo (base64), try to upload to Supabase Storage
      if (photoType === 'upload' && photo.startsWith('data:')) {
        try {
          const response = await fetch(photo);
          const blob = await response.blob();
          const fileExt = blob.type.split('/')[1] || 'png';
          const fileName = `${Date.now()}_${name.replace(/[^a-zA-Z0-9]/g, '_')}.${fileExt}`;

          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('participant-photos')
            .upload(fileName, blob, {
              contentType: blob.type,
              upsert: true,
            });

          if (uploadError) {
            console.warn('No se pudo subir la foto, usando avatar.');
            finalPhotoType = 'avatar';
            photoUrl = '💼';
          } else {
            const { data: urlData } = supabase.storage
              .from('participant-photos')
              .getPublicUrl(fileName);
            photoUrl = urlData.publicUrl;
          }
        } catch (storageError) {
          // Storage no configurado, usar avatar
          finalPhotoType = 'avatar';
          photoUrl = '💼';
        }
      }

      // Si photoType era upload pero la foto final es un emoji (≤2 chars) o base64 falló,
      // aseguramos que photoType refleje la realidad
      if (finalPhotoType === 'upload' && (photoUrl.length <= 2 || photoUrl === '💼')) {
        finalPhotoType = 'avatar';
      }

      console.log('[DEBUG] registerUser final:', { finalPhotoType, photoUrl, length: photoUrl?.length, teamIds });

      const newParticipant: Participant = {
        id: email,
        name,
        email,
        teamIds,
        photoType: finalPhotoType,
        photo: photoUrl,
        status: 'activo'
      };

      // Intentar guardar en Supabase
      if (get().supabaseAvailable) {
        try {
          const { data: existingReg } = await supabase
            .from('participants')
            .select('id')
            .eq('email', email)
            .maybeSingle();

          if (existingReg) {
            await supabase
              .from('participants')
              .update({
                name,
                team_ids: teamIds,
                team_id: teamIds[0] || null, // mantener compatibilidad con campo singular
                photo_type: finalPhotoType,
                photo: photoUrl,
                updated_at: new Date().toISOString(),
              })
              .eq('email', email);
          } else {
            await supabase
              .from('participants')
              .insert({
                name,
                email,
                team_ids: teamIds,
                team_id: teamIds[0] || null, // mantener compatibilidad con campo singular
                photo_type: finalPhotoType,
                photo: photoUrl,
              });
          }
        } catch (dbError) {
          console.warn('Error guardando en Supabase, usando localStorage:', dbError);
        }
      }

      // Siempre guardar en localStorage como respaldo
      const state = get();
      const filteredParticipants = state.participants.filter(p => p.email !== email);
      const updatedParticipants = [...filteredParticipants, newParticipant];
      saveLocalParticipants(updatedParticipants);
      saveLocalRegistration(newParticipant);

      set({
        participants: updatedParticipants,
        myRegistration: newParticipant,
        activeTab: 'representantes'
      });
      
      get().recalculateTournament();
      const allTeams = get().teams;
      const teamsStr = teamIds.map((id: string) => allTeams.find(t => t.id === id)?.name).filter(Boolean).join(', ');
      toast.success(`¡Registro completado! Ahora representas a: ${teamsStr}`);
    } catch (error) {
      console.error('Error al registrar:', error);
      toast.error('Error al registrar usuario. Intenta de nuevo.');
    }
  },

  deleteMyRegistration: async () => {
    const { myRegistration } = get();
    if (myRegistration?.email) {
      // Intentar eliminar la foto del Storage de Supabase
      if (myRegistration.photoType === 'upload' && myRegistration.photo && myRegistration.photo.length > 2 && myRegistration.photo.startsWith('http')) {
        try {
          // Extraer el nombre del archivo de la URL
          const urlParts = myRegistration.photo.split('/');
          const fileName = urlParts[urlParts.length - 1]?.split('?')[0]; // quitar query params si los hay
          if (fileName) {
            const { error: removeError } = await supabase.storage
              .from('participant-photos')
              .remove([fileName]);
            if (removeError) {
              console.warn('No se pudo eliminar la foto del storage:', removeError);
            }
          }
        } catch (storageError) {
          console.warn('Error al eliminar foto del storage:', storageError);
        }
      }

      // Intentar eliminar de Supabase (silenciosamente)
      try {
        await supabase.from('participants').delete().eq('email', myRegistration.email);
      } catch { /* ignore */ }

      // Eliminar de localStorage
      const state = get();
      const updatedParticipants = state.participants.filter(p => p.email !== myRegistration.email);
      saveLocalParticipants(updatedParticipants);
      saveLocalRegistration(null);
      
      set({
        participants: updatedParticipants,
        myRegistration: null
      });
    } else {
      set({ myRegistration: null });
      saveLocalRegistration(null);
    }
    get().recalculateTournament();
    toast.warning('Tu registro ha sido eliminado de la quiniela.');
  },

    recalculateTournament: () => {
      set(state => {
        // Create deep copies to avoid mutating directly
        const teams = [...state.teams].map(t => ({...t, status: 'activo' as 'activo' | 'eliminado', stageReached: 'Octavos de Final'}));
        const matches = [...state.matches].map(m => {
          if (m.stage !== 'Octavos') {
            return { ...m, teamAId: null, teamBId: null };
          }
          return { ...m };
        });
        const participants = [...state.participants];
        let myRegistration = state.myRegistration ? { ...state.myRegistration } : null;

      // Evaluar cada partido
      matches.forEach(m => {
        if (m.winnerId) {
          const loserId = (m.winnerId === m.teamAId) ? m.teamBId : m.teamAId;
          
          if (loserId) {
            const loserTeam = teams.find(t => t.id === loserId);
            if (loserTeam) loserTeam.status = 'eliminado';
          }

          const winnerTeam = teams.find(t => t.id === m.winnerId);
          if (winnerTeam) {
            if (m.stage === 'Octavos') winnerTeam.stageReached = 'Cuartos de Final';
            else if (m.stage === 'Cuartos') winnerTeam.stageReached = 'Semifinales';
            else if (m.stage === 'Semis') winnerTeam.stageReached = 'Final';
            else if (m.stage === 'Final') winnerTeam.stageReached = 'Campeón';
          }

          if (m.nextMatchId) {
            const nextMatch = matches.find(nm => nm.id === m.nextMatchId);
            if (nextMatch) {
              if (m.slot === 'A') nextMatch.teamAId = m.winnerId;
              else nextMatch.teamBId = m.winnerId;
            }
          }
        }
      });

      // Actualizar estatus de participantes
      participants.forEach(p => {
        // Un participante está eliminado si TODOS sus equipos están eliminados
        if (!p.teamIds || p.teamIds.length === 0) {
          p.status = 'eliminado';
        } else {
          const anyActive = p.teamIds.some(tid => {
            const team = teams.find(t => t.id === tid);
            return team && team.status === 'activo';
          });
          p.status = anyActive ? 'activo' : 'eliminado';
        }
      });

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

  setMatchWinner: async (matchId, winnerId) => {
    set(state => {
      const matches = [...state.matches];
      const matchIndex = matches.findIndex(m => m.id === matchId);
      if (matchIndex >= 0) {
        matches[matchIndex] = { ...matches[matchIndex], winnerId };
      }
      return { matches };
    });
    
    get().recalculateTournament();
    
    const winnerTeam = get().teams.find(t => t.id === winnerId);
    if (winnerTeam) {
      toast.success(`Ganador registrado: ${winnerTeam.flag} ${winnerTeam.name}`);
    }
  },

  resetTournament: async () => {
    set(state => {
      const matches = state.matches.map(m => ({
        ...m,
        winnerId: null,
        teamAId: m.stage !== 'Octavos' ? null : m.teamAId,
        teamBId: m.stage !== 'Octavos' ? null : m.teamBId,
      }));
      return { matches };
    });
    get().recalculateTournament();
    toast.warning('Torneo reiniciado. Todos los equipos vuelven a Octavos.');
  },

  simulateRandom: async () => {
    // Reset first
    await get().resetTournament();
    
    const resolveMatches = () => {
      set(state => {
        let hasChanges = false;
        const matches = [...state.matches];
        
        matches.forEach((m, index) => {
          if (!m.winnerId && m.teamAId && m.teamBId) {
            const winner = Math.random() > 0.5 ? m.teamAId : m.teamBId;
            matches[index] = { ...m, winnerId: winner };
            hasChanges = true;
          }
        });
        
        return hasChanges ? { matches } : {};
      });
      
      get().recalculateTournament();
    };

    // We need to run this multiple times to propagate winners through all stages
    for (let i = 0; i < 4; i++) {
      resolveMatches();
    }
    
    toast.success('¡Se ha simulado todo el torneo de forma aleatoria!');
  },

  sendAccessCode: async (email: string) => {
    set({ loading: true });

    // Check if email exists in participants
    const state = get();
    const participant = state.participants.find(p => p.email.toLowerCase() === email.toLowerCase());

    if (!participant) {
      set({ loading: false });
      toast.error('Este correo no está registrado en la quiniela. ¿Ya te registraste?');
      return false;
    }

    // Generate a 6-digit code
    const code = generateRandomCode();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes expiry

    // Store the code
    accessCodes[email.toLowerCase()] = { code, expiresAt };

    console.log(`[ACCESS CODE for ${email}]: ${code}`);

    // Enviar el código por correo usando Resend
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: email,
          userName: participant.name,
          subject: '🔑 Tu código de acceso a la Quiniela de la Oficina',
          accessCode: code,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('[sendAccessCode] Error al enviar correo:', errorData);
        // Fallback: mostrar el código en pantalla
        toast.success(`🔑 Código de acceso: ${code}`, {
          description: `📧 Para ${email} — No se pudo enviar el correo, pero aquí tienes tu código: ${code}. Válido por 10 minutos.`,
          duration: 60000,
          position: 'top-center',
        });
      } else {
        toast.success(`🔑 Código de acceso enviado a ${email}`, {
          description: `📧 Revisa tu bandeja de entrada. Válido por 10 minutos.`,
          duration: 60000,
          position: 'top-center',
        });
      }
    } catch (error) {
      console.error('[sendAccessCode] Error de red:', error);
      // Fallback: mostrar el código en pantalla
      toast.success(`🔑 Código de acceso: ${code}`, {
        description: `📧 Para ${email} — (Error de red) Código: ${code}. Válido por 10 minutos.`,
        duration: 60000,
        position: 'top-center',
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
      toast.error('No se ha solicitado un código para este correo. Solicita uno nuevo.');
      return false;
    }

    if (Date.now() > stored.expiresAt) {
      // Code expired
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

    // Code is valid - log in the user
    const state = get();
    const participant = state.participants.find(p => p.email.toLowerCase() === email.toLowerCase());

    if (participant) {
      saveLocalRegistration(participant);
      set({ myRegistration: participant });

      // Clean up the used code
      delete accessCodes[email.toLowerCase()];

      set({ loading: false });
      return true;
    }

    set({ loading: false });
    toast.error('No se encontró tu registro. Vuelve a registrarte.');
    return false;
  },
}));

export default useQuinielaStore;
