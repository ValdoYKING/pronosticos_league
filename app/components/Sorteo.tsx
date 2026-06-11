/* eslint-disable @next/next/no-img-element */
"use client";
import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import useQuinielaStore from "../store/quiniela";
import { Participant } from "../lib/mockData";
import { 
  Dice5, Trophy, Users, RefreshCw, X, 
  PartyPopper, Loader2, Dices, ArrowRight
} from "lucide-react";
import { toast } from "sonner";

const Sorteo = () => {
  const { 
    participants, teams, 
    assignRandomTeamToParticipant, 
    ordenSorteo, 
    posicionActual,
    getSiguientePendiente 
  } = useQuinielaStore();
  
  // Estado del sorteo
  const [isSpinning, setIsSpinning] = useState(false);
  const [showWinner, setShowWinner] = useState(false);
  const [currentWinner, setCurrentWinner] = useState<any>(null);
  const [assignedTeam, setAssignedTeam] = useState<any>(null);
  const [confetti, setConfetti] = useState<{ id: number; x: number; y: number; emoji: string }[]>([]);
  const [spinPhase, setSpinPhase] = useState<"idle" | "shuffling" | "selecting" | "teamShuffling" | "result">("idle");
  const [animationProgress, setAnimationProgress] = useState(0);
  // Estado para la ruleta de banderas
  const [displayFlagTeam, setDisplayFlagTeam] = useState<any>(null);
  const [selectedWinner, setSelectedWinner] = useState<any>(null);
  const [isTopTeamAssigned, setIsTopTeamAssigned] = useState(false);
  const [showTopTeamGlow, setShowTopTeamGlow] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const shuffleRef = useRef<NodeJS.Timeout | null>(null);
  const confettiIdRef = useRef(0);

  // ============================================================
  // DATOS DINÁMICOS - calculados en tiempo real desde el store
  // ============================================================

  // Participantes DISPONIBLES para sorteo (los que aún necesitan equipos)
  // Se obtienen desde la tabla orden_sorteo: las posiciones pendientes ordenadas
  const siguientePendiente = useMemo(() => getSiguientePendiente(), [ordenSorteo, getSiguientePendiente]);
  
  // Participantes que aún necesitan equipos, pero en el orden definido por orden_sorteo
  const participantsAvailable = useMemo(() => {
    // Obtener las posiciones pendientes ordenadas
    const pendientes = ordenSorteo
      .filter(o => o.status === 'pendiente')
      .sort((a, b) => a.posicion - b.posicion);
    
    // Mapear a participantes, manteniendo el orden de las posiciones
    const result: { participant: Participant; posicion: number }[] = [];
    for (const pos of pendientes) {
      if (!pos.participantEmail) continue;
      const p = participants.find(pp => pp.email === pos.participantEmail);
      if (p) {
        const needed = p.drawCount ?? 1;
        const have = (p.teamIds || []).length;
        if (have < needed) {
          result.push({ participant: p, posicion: pos.posicion });
        }
      }
    }
    return result;
  }, [ordenSorteo, participants]);

  // Participantes COMPLETOS (ya tienen todos los equipos que necesitan)
  const participantsCompleted = useMemo(() => {
    return participants.filter(p => {
      const needed = p.drawCount ?? 1;
      const have = (p.teamIds || []).length;
      return have >= needed;
    });
  }, [participants]);

  // IDs de equipos que ya están asignados a algún participante
  const assignedTeamIds = useMemo(() => {
    const ids = new Set<string>();
    for (const p of participants) {
      if (p.teamIds) {
        for (const tid of p.teamIds) {
          ids.add(tid);
        }
      }
    }
    return ids;
  }, [participants]);

  // Equipos disponibles (sin representante)
  const availableTeams = useMemo(() => {
    return teams.filter(t => !assignedTeamIds.has(t.id));
  }, [teams, assignedTeamIds]);

  // Equipos ya asignados (con su representante)
  const assignedTeamsWithRepresentatives = useMemo(() => {
    const result: { team: any; representatives: any[] }[] = [];
    for (const p of participantsCompleted) {
      if (p.teamIds) {
        for (const tid of p.teamIds) {
          const team = teams.find(t => t.id === tid);
          if (team) {
            const existing = result.find(r => r.team.id === team.id);
            if (existing) {
              existing.representatives.push(p);
            } else {
              result.push({ team, representatives: [p] });
            }
          }
        }
      }
    }
    return result;
  }, [participantsCompleted, teams]);

  // Nombre que cambia durante la animación
  const [displayName, setDisplayName] = useState("");

  // Limpiar timers al desmontar
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (shuffleRef.current) clearInterval(shuffleRef.current);
    };
  }, []);

  const startSorteo = useCallback(() => {
    if (participantsAvailable.length === 0) {
      toast.warning("Todos los participantes ya tienen todos los equipos que necesitan. Ve a Registrar para añadir más.");
      return;
    }
    if (availableTeams.length === 0) {
      toast.error("Todos los equipos ya tienen representante. No hay equipos disponibles para asignar.");
      return;
    }

    // Buscar el siguiente pendiente desde la tabla orden_sorteo
    const siguiente = getSiguientePendiente();
    if (!siguiente || !siguiente.participantEmail) {
      toast.warning("No hay más posiciones pendientes en el orden de sorteo. Ve a Registrar para asignar posiciones.");
      return;
    }

    const winnerData = participantsAvailable.find(p => p.participant.email === siguiente.participantEmail);
    if (!winnerData) {
      toast.warning("El siguiente participante en orden ya tiene todos sus equipos. Verifica el orden de sorteo.");
      return;
    }

    const winner = winnerData.participant;
    setSelectedWinner(winner);
    setDisplayName(winner.name);
    setSpinPhase("shuffling");
    setIsSpinning(true);

    // ============================================================
    // FASE 1: Animación de "papelitos" mezclándose (~1.5 segundos)
    // Muestra el nombre del siguiente en orden
    // ============================================================
    let shuffleCount = 0;
    const totalShuffles = 15;

    shuffleRef.current = setInterval(() => {
      shuffleCount++;
      setDisplayName(winner.name);
      setAnimationProgress((shuffleCount / totalShuffles) * 100);

      if (shuffleCount >= totalShuffles) {
        clearInterval(shuffleRef.current!);
        shuffleRef.current = null;
        
        // ============================================================
        // FASE 2: Ruleta de equipos (~7 segundos)
        // ============================================================
        setSpinPhase("teamShuffling");
        
        let teamShuffleCount = 0;
        const totalTeamShuffles = 70; // ~7s con intervalos de ~100ms
        
        shuffleRef.current = setInterval(() => {
          teamShuffleCount++;
          const randomTeam = availableTeams[Math.floor(Math.random() * availableTeams.length)];
          setDisplayFlagTeam(randomTeam);
          setAnimationProgress((teamShuffleCount / totalTeamShuffles) * 100);

          if (teamShuffleCount >= totalTeamShuffles) {
            clearInterval(shuffleRef.current!);
            shuffleRef.current = null;
            
            // ============================================================
            // FASE 3: Resultado final
            // ============================================================
            setSpinPhase("result");
            setIsSpinning(false);
            setShowWinner(true);
            setCurrentWinner(winner);
            
            // Asignar equipo automáticamente (async)
            handleAssignTeam(winner.email);
            
            // Lanzar confetti
            launchConfetti();
          }
        }, 100);
      }
    }, 100);
  }, [participantsAvailable, availableTeams]);

  const handleAssignTeam = async (email: string) => {
    const result = await assignRandomTeamToParticipant(email);
    if (result.assigned && result.team) {
      setAssignedTeam(result.team);
      setIsTopTeamAssigned(result.isTopTeam ?? false);
      setShowTopTeamGlow(result.isTopTeam ?? false);
      // Una vez asignado, fijamos la bandera final en la ruleta
      setDisplayFlagTeam(result.team);
      // Actualizar el avatar del ganador con la bandera del equipo asignado
      setCurrentWinner((prev: any) => {
        if (prev) {
          return {
            ...prev,
            photoType: 'upload' as const,
            photo: result.team.flagUrl,
          };
        }
        return prev;
      });
    } else if (!result.assigned) {
      toast.error("No se pudo asignar un equipo. Verifica que haya equipos disponibles.");
    }
  };

  const launchConfetti = () => {
    const emojis = ["🎉", "🎊", "⭐", "✨", "🏆", "🥳", "🎯", "💫", "🌟", "🎲"];
    const newConfetti = [];
    for (let i = 0; i < 30; i++) {
      confettiIdRef.current++;
      newConfetti.push({
        id: confettiIdRef.current,
        x: Math.random() * 100,
        y: -10 - Math.random() * 20,
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
      });
    }
    setConfetti(newConfetti);

    let frame = 0;
    const maxFrames = 60;
    const confettiInterval = setInterval(() => {
      frame++;
      setConfetti(prev => prev.map(c => ({
        ...c,
        y: c.y + 2 + Math.random() * 3,
        x: c.x + (Math.random() - 0.5) * 2,
      })));
      if (frame >= maxFrames) {
        clearInterval(confettiInterval);
        setConfetti([]);
      }
    }, 50);
  };

  const resetSorteo = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (shuffleRef.current) clearInterval(shuffleRef.current);
    setIsSpinning(false);
    setShowWinner(false);
    setCurrentWinner(null);
    setAssignedTeam(null);
    setDisplayName("");
    setSelectedWinner(null);
    setDisplayFlagTeam(null);
    setIsTopTeamAssigned(false);
    setShowTopTeamGlow(false);
    setSpinPhase("idle");
    setAnimationProgress(0);
    setConfetti([]);
  };

  return (
    <div className="space-y-6">
      <div className="max-w-5xl mx-auto">
        {/* Panel principal de la tómbola */}
        <div className="glass rounded-2xl p-6 sm:p-8 space-y-8 border border-amber-200 dark:border-amber-500/20 bg-white/50 dark:bg-transparent relative overflow-hidden">
          
          {/* Confetti overlay */}
          {confetti.length > 0 && (
            <div className="absolute inset-0 pointer-events-none z-10">
              {confetti.map(c => (
                <span
                  key={c.id}
                  className="absolute text-2xl animate-bounce"
                  style={{ left: `${c.x}%`, top: `${c.y}%`, animationDuration: `${0.5 + Math.random()}s` }}
                >
                  {c.emoji}
                </span>
              ))}
            </div>
          )}

          {/* Encabezado */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-400/30 text-amber-700 dark:text-amber-400 font-bold text-sm mb-2">
              <Dices className="w-4 h-4" />
              TÓMBOLA - Sorteo de Equipos
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">
              ¡La Suerte Decide!
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Los &quot;papelitos&quot; se mezclan y se sortea un participante, quien recibe un equipo disponible asignado aleatoriamente.
            </p>
          </div>

          {/* Estadísticas dinámicas */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white dark:bg-gray-950/50 rounded-xl p-4 border border-gray-200 dark:border-gray-800 text-center">
              <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {ordenSorteo.filter(o => o.status === 'pendiente').length}
              </p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold">Sorteos<br/>pendientes</p>
            </div>
            <div className="bg-white dark:bg-gray-950/50 rounded-xl p-4 border border-gray-200 dark:border-gray-800 text-center">
              <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {ordenSorteo.filter(o => o.status === 'completado').length}
              </p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold">Sorteos<br/>completados</p>
            </div>
            <div className="bg-white dark:bg-gray-950/50 rounded-xl p-4 border border-gray-200 dark:border-gray-800 text-center">
              <p className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">{availableTeams.length}</p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold">Equipos<br/>disponibles</p>
            </div>
            <div className="bg-white dark:bg-gray-950/50 rounded-xl p-4 border border-gray-200 dark:border-gray-800 text-center">
              <p className="text-2xl font-extrabold text-purple-600 dark:text-purple-400">{assignedTeamIds.size}</p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold">Equipos<br/>asignados</p>
            </div>
          </div>

          {/* Barra de progreso del sorteo */}
          {ordenSorteo.length > 0 && (
            <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-amber-500 transition-all duration-500"
                style={{ width: `${(ordenSorteo.filter(o => o.status === 'completado').length / ordenSorteo.length) * 100}%` }}
              />
              <p className="text-[9px] text-gray-500 dark:text-gray-400 text-center mt-1">
                Progreso: {ordenSorteo.filter(o => o.status === 'completado').length} de {ordenSorteo.length} sorteos
                {posicionActual <= ordenSorteo.length && ` • Siguiente: #${posicionActual}`}
              </p>
            </div>
          )}

          {/* TÓMBOLA / ANIMACIÓN PRINCIPAL */}
          <div className="relative">
            <div className={`
              relative w-full max-w-md mx-auto 
              ${spinPhase === "shuffling" ? 'animate-shake' : ''}
            `}>
              <div className={`
                relative rounded-3xl border-2 overflow-hidden p-6 sm:p-8 text-center
                ${spinPhase === "result" 
                  ? 'bg-gradient-to-br from-amber-50 via-emerald-50 to-amber-50 dark:from-amber-950/30 dark:via-emerald-950/30 dark:to-amber-950/30 border-amber-400 dark:border-amber-500/50 shadow-2xl shadow-amber-500/20' 
                  : spinPhase === "shuffling" || spinPhase === "teamShuffling"
                    ? 'bg-gradient-to-br from-gray-50 to-amber-50 dark:from-gray-900 dark:to-amber-950/20 border-amber-300 dark:border-amber-500/30 shadow-xl'
                    : 'bg-white dark:bg-gray-950/60 border-gray-200 dark:border-gray-800'
                }
                transition-all duration-500
              `}>
                {/* Etiqueta de fase */}
                <div className="absolute top-3 left-3">
                  {spinPhase === "shuffling" && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 text-[9px] font-bold border border-amber-200 dark:border-amber-500/20">
                      <Loader2 className="w-2.5 h-2.5 animate-spin" />
                      MEZCLANDO PARTICIPANTES
                    </span>
                  )}
                  {spinPhase === "teamShuffling" && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 text-[9px] font-bold border border-blue-200 dark:border-blue-500/20 animate-pulse">
                      <Loader2 className="w-2.5 h-2.5 animate-spin" />
                      RULETA DE EQUIPOS
                    </span>
                  )}
                  {spinPhase === "result" && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[9px] font-bold border border-emerald-200 dark:border-emerald-500/20">
                      <PartyPopper className="w-2.5 h-2.5" />
                      ¡RESULTADO!
                    </span>
                  )}
                </div>

                <div className="text-6xl mb-4">
                  {spinPhase === "idle" ? "🎰" : spinPhase === "result" ? "🏆" : "🔄"}
                </div>

                <div className="min-h-[120px] flex items-center justify-center">
                  {spinPhase === "idle" ? (
                    <p className="text-gray-400 dark:text-gray-500 text-sm italic">
                      Presiona &quot;Iniciar Sorteo&quot; para comenzar
                    </p>
                  ) : (
                    <div className="space-y-4 w-full">
                      {/* FASE 1: Mezcla de participantes */}
                      {spinPhase === "shuffling" && (
                        <div className="space-y-2">
                          <div className="flex justify-center gap-1 mb-2">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <span key={i} className="inline-block text-lg animate-bounce" style={{ animationDelay: `${i * 0.1}s` }}>
                                📄
                              </span>
                            ))}
                          </div>
                          <p className="text-2xl sm:text-3xl font-extrabold text-gray-700 dark:text-gray-200 transition-all duration-300">
                            {displayName || <span className="text-gray-300 dark:text-gray-600">••••••</span>}
                          </p>
                        </div>
                      )}

                      {/* FASE 2: Ruleta de equipos (7s) */}
                      {spinPhase === "teamShuffling" && selectedWinner && (
                        <div className="space-y-3">
                          {/* Participante seleccionado */}
                          <div className="flex items-center justify-center gap-2">
                            <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold">Participante:</span>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/20 text-sm font-bold text-emerald-700 dark:text-emerald-300">
                              {selectedWinner.photo && selectedWinner.photo.length <= 2 ? selectedWinner.photo : '🎯'}
                              {selectedWinner.name}
                            </span>
                          </div>

                          {/* Texto de transición */}
                          <p className="text-xs text-gray-400 dark:text-gray-500 font-semibold animate-pulse">
                            Buscando equipo disponible...
                          </p>

                          {/* Ruleta de banderas */}
                          <div className={`relative overflow-hidden rounded-2xl border-2 p-4 ${
                            showTopTeamGlow
                              ? 'border-yellow-400 dark:border-yellow-500/60 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/30 dark:to-amber-950/20 shadow-2xl shadow-yellow-500/30'
                              : 'border-blue-300 dark:border-blue-500/40 bg-blue-50/50 dark:bg-blue-950/20'
                          }`}>
                            {/* Efecto de carrusel vertical */}
                            <div className={`flex items-center justify-center gap-4 ${
                              spinPhase === "teamShuffling" ? 'animate-flagShuffle' : ''
                            }`}>
                              {displayFlagTeam && (
                                <div className="flex flex-col items-center gap-2 transition-all duration-75">
                                  <div className="relative">
                                    <img 
                                      src={displayFlagTeam.flagUrl} 
                                      alt={displayFlagTeam.name}
                                      className={`object-cover rounded-xl shadow-lg border-2 transform transition-transform ${
                                        showTopTeamGlow
                                          ? 'w-24 h-16 border-yellow-400 dark:border-yellow-500/60 shadow-yellow-500/40 scale-110'
                                          : 'w-20 h-14 border-blue-300 dark:border-blue-500/40'
                                      }`}
                                    />
                                    {showTopTeamGlow ? (
                                      <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-white text-sm font-bold animate-bounce shadow-lg shadow-yellow-500/50">
                                        ⭐
                                      </div>
                                    ) : (
                                      <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-[10px] font-bold animate-pulse">
                                        🎲
                                      </div>
                                    )}
                                    {/* Efecto de brillo para top team */}
                                    {showTopTeamGlow && (
                                      <>
                                        <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-yellow-400/20 to-transparent animate-pulse" />
                                        <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-yellow-400/10 via-amber-300/20 to-yellow-400/10 blur-xl animate-pulse" />
                                      </>
                                    )}
                                  </div>
                                  <div className="text-center">
                                    <p className={`font-extrabold ${
                                      showTopTeamGlow
                                        ? 'text-yellow-700 dark:text-yellow-300 text-base'
                                        : 'text-sm text-gray-800 dark:text-gray-100'
                                    }`}>
                                      {showTopTeamGlow ? ' ' : ''}
                                      {displayFlagTeam.name}
                                      {showTopTeamGlow ? ' ' : ''}
                                    </p>
                                    <p className="text-[9px] text-gray-500 dark:text-gray-400">Grupo {displayFlagTeam.group}</p>
                                  </div>
                                  {showTopTeamGlow && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-100 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 text-[9px] font-bold border border-yellow-200 dark:border-yellow-500/20 animate-pulse">
                                      EQUIPO ASIGNADO
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Luces decorativas alrededor */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-amber-400 to-emerald-400 animate-pulse" />
                            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 via-amber-400 to-blue-400 animate-pulse" />
                          </div>
                        </div>
                      )}

                      {/* FASE 3: Resultado */}
                      {spinPhase === "result" && (
                        <div className="space-y-2">
                          <p className={`
                            text-2xl sm:text-3xl font-extrabold transition-all duration-300
                            ${showWinner 
                              ? 'text-emerald-600 dark:text-emerald-400 scale-110' 
                              : 'text-gray-700 dark:text-gray-200'
                            }
                          `}>
                            {displayName || <span className="text-gray-300 dark:text-gray-600">••••••</span>}
                          </p>
                        </div>
                      )}

                      {/* Barra de progreso durante animaciones */}
                      {(spinPhase === "shuffling" || spinPhase === "teamShuffling") && (
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-2 overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-150 ${
                              spinPhase === "teamShuffling" 
                                ? 'bg-gradient-to-r from-blue-500 via-amber-500 to-emerald-500' 
                                : 'bg-gradient-to-r from-amber-500 to-emerald-500'
                            }`}
                            style={{ width: `${animationProgress}%` }}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {showWinner && currentWinner && assignedTeam && (
                  <div className="mt-6 space-y-3 animate-fadeIn">
                    <div className="border-t border-amber-200 dark:border-amber-500/20 pt-4">
                      <div className="flex items-center justify-center gap-3">
                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/20">
                          {currentWinner.photoType === "upload" && currentWinner.photo && currentWinner.photo !== '💼' && currentWinner.photo.startsWith('http') ? (
                            <img src={currentWinner.photo} alt="" className="w-8 h-8 rounded-full object-cover border border-emerald-500/30" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center text-lg border border-emerald-500/30">
                              {currentWinner.photo || '💼'}
                            </div>
                          )}
                          <div className="text-left">
                            <p className="text-xs text-gray-500 dark:text-gray-400">SELECCIONADO</p>
                            <p className="font-extrabold text-emerald-700 dark:text-emerald-300">{currentWinner.name}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-center gap-3 mt-3">
                        <ArrowRight className="w-5 h-5 text-amber-500 animate-pulse" />
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${
                          isTopTeamAssigned 
                            ? 'bg-yellow-50 dark:bg-yellow-950/40 border-yellow-200 dark:border-yellow-500/30 shadow-lg shadow-yellow-500/10'
                            : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-500/20'
                        }`}>
                          <img 
                            src={assignedTeam.flagUrl} 
                            alt={assignedTeam.name}
                            className="w-8 h-6 object-cover rounded shadow-sm" 
                          />
                          <div className="text-left">
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {isTopTeamAssigned ? ' EQUIPO ASIGNADO' : 'EQUIPO ASIGNADO'}
                            </p>
                            <p className={`font-extrabold ${
                              isTopTeamAssigned ? 'text-yellow-700 dark:text-yellow-300' : 'text-amber-700 dark:text-amber-300'
                            }`}>
                              {isTopTeamAssigned ? ' ' : ''}{assignedTeam.name}{isTopTeamAssigned ? ' ' : ''}
                            </p>
                            <p className="text-[9px] text-gray-400 dark:text-gray-500">Grupo {assignedTeam.group}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-bold border border-emerald-200 dark:border-emerald-500/20">
                        <PartyPopper className="w-3.5 h-3.5" />
                        ¡Equipo asignado con éxito!
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {spinPhase !== "idle" && (
              <div className="mt-4 flex justify-center gap-1">
                {["shuffling", "teamShuffling", "result"].map((phase, i) => (
                  <div key={phase} className={`w-3 h-3 rounded-full transition-all duration-500 ${
                    spinPhase === phase 
                      ? 'bg-amber-500 scale-125 shadow-lg shadow-amber-500/50' 
                      : ['shuffling', 'teamShuffling', 'result'].indexOf(spinPhase) > i
                        ? 'bg-emerald-500'
                        : 'bg-gray-300 dark:bg-gray-700'
                  }`} />
                ))}
              </div>
            )}
          </div>

          {/* CONTROLES */}
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            {spinPhase === "idle" ? (
              <button
                onClick={startSorteo}
                disabled={participantsAvailable.length === 0 || availableTeams.length === 0 || isSpinning}
                className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-600 hover:to-orange-700 font-extrabold shadow-xl shadow-amber-500/20 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                <Dice5 className="w-5 h-5" />
                Iniciar Sorteo
              </button>
            ) : (
              spinPhase === "result" && (
                <button
                  onClick={resetSorteo}
                  className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 font-extrabold shadow-xl shadow-emerald-500/20 transition flex items-center gap-2 text-sm"
                >
                  <RefreshCw className="w-5 h-5" />
                  Nuevo Sorteo
                </button>
              )
            )}

            {spinPhase !== "idle" && spinPhase !== "result" && (
              <button
                onClick={resetSorteo}
                className="px-4 py-3.5 rounded-xl bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-700 font-bold transition flex items-center gap-2 text-xs"
              >
                <X className="w-4 h-4" />
                Cancelar
              </button>
            )}
          </div>

          {availableTeams.length === 0 && participants.length > 0 && (
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-500/20 text-center">
              <p className="text-sm text-amber-700 dark:text-amber-400 font-semibold">
                🏁 Todos los equipos tienen representante. No hay más equipos disponibles para asignar.
              </p>
            </div>
          )}
        </div>

        {/* LISTA DE PARTICIPANTES DISPONIBLES */}
        <div className="mt-6 glass rounded-2xl p-6 sm:p-8 space-y-4 border border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-transparent">
          <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-500" />
            Participantes disponibles para sorteo ({participantsAvailable.length})
          </h3>

          {participantsAvailable.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-sm text-gray-400 dark:text-gray-500 italic">
                Todos los participantes ya tienen los equipos que necesitan. ¡Ve a Registrar para añadir más!
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {participantsAvailable.map((item) => {
                const p = item.participant;
                const needed = p.drawCount ?? 1;
                const have = (p.teamIds || []).length;
                return (
                  <span key={`pos-${item.posicion}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-500/20 text-xs font-semibold text-amber-700 dark:text-amber-300">
                    <span className="text-[8px] font-bold text-amber-500 dark:text-amber-400 bg-amber-100 dark:bg-amber-500/10 px-1 py-0.2 rounded min-w-[18px] text-center">
                      #{item.posicion}
                    </span>
                    {p.photoType === "upload" && p.photo && p.photo !== '💼' && p.photo.startsWith('http') ? (
                      <img src={p.photo} alt="" className="w-4 h-4 rounded-full object-cover" />
                    ) : (
                      <span>{p.photo && p.photo.length <= 2 ? p.photo : '💼'}</span>
                    )}
                    <span>{p.name}</span>
                    <span className="text-[8px] text-amber-400 dark:text-amber-500 ml-0.5">
                      ({have}/{needed})
                    </span>
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {/* EQUIPOS DISPONIBLES */}
        <div className="mt-6 glass rounded-2xl p-6 sm:p-8 space-y-4 border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50/20 dark:bg-emerald-950/10">
          <h3 className="text-sm font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
            <Dices className="w-4 h-4" />
            Equipos disponibles para sorteo ({availableTeams.length})
          </h3>

          {availableTeams.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-sm text-gray-400 dark:text-gray-500 italic">
                No hay equipos disponibles. Todos los equipos ya tienen al menos un representante.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {availableTeams.map(team => (
                <div key={team.id} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white dark:bg-gray-950/40 border border-emerald-200 dark:border-emerald-800/30 text-xs font-semibold text-gray-700 dark:text-gray-300">
                  <img src={team.flagUrl} alt={team.name} className="w-5 h-3.5 object-cover rounded shadow-sm" />
                  <div className="truncate">
                    <span className="truncate block">{team.name}</span>
                    <span className="text-[8px] text-gray-400 dark:text-gray-500">Grupo {team.group}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* PARTICIPANTES COMPLETOS + EQUIPOS ASIGNADOS */}
        <div className="mt-6 glass rounded-2xl p-6 sm:p-8 space-y-4 border border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-transparent">
          <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-emerald-500" />
            Participantes con todos sus equipos ({participantsCompleted.length})
          </h3>

          {participantsCompleted.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-sm text-gray-400 dark:text-gray-500 italic">
                Aún no hay participantes con equipo asignado. ¡Usa la tómbola para empezar a sortear!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {participantsCompleted.map(p => {
                const teamNames = (p.teamIds || []).map(tid => teams.find(t => t.id === tid)).filter(Boolean);
                return (
                  <div key={p.email} className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/30 text-xs">
                    {p.photoType === "upload" && p.photo && p.photo !== '💼' && p.photo.startsWith('http') ? (
                      <img src={p.photo} alt="" className="w-7 h-7 rounded-full object-cover border border-emerald-500/30" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center text-sm border border-emerald-500/30">
                        {p.photo && p.photo.length <= 2 ? p.photo : '💼'}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="font-semibold text-gray-700 dark:text-gray-300 truncate">{p.name}</p>
                        <span className="text-[8px] font-bold text-emerald-500 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/10 px-1 py-0.5 rounded-full">
                          {(p.teamIds || []).length}/{p.drawCount ?? 1}
                        </span>
                      </div>
                      <div className="flex gap-1 mt-0.5">
                        {teamNames.map((t: any) => (
                          <img key={t.id} src={t.flagUrl} alt={t.name} className="w-4 h-3 object-cover rounded shadow-sm" title={t.name} />
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Mapa de equipos con sus representantes */}
          {assignedTeamsWithRepresentatives.length > 0 && (
            <div className="pt-4 border-t border-gray-200 dark:border-gray-800 mt-6">
              <h4 className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-3 uppercase tracking-wider">
                Equipos con representantes ({assignedTeamsWithRepresentatives.length})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {assignedTeamsWithRepresentatives.map(({ team, representatives }) => (
                  <div key={team.id} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 dark:bg-amber-950/10 border border-amber-200 dark:border-amber-800/20 text-xs">
                    <img src={team.flagUrl} alt={team.name} className="w-5 h-3.5 object-cover rounded shadow-sm" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-amber-700 dark:text-amber-400 truncate">{team.name}</p>
                      <p className="text-[9px] text-gray-500 dark:text-gray-400 truncate">
                        {representatives.map(r => `${r.name} (${(r.teamIds || []).length}/${r.drawCount ?? 1})`).join(', ')}
                      </p>
                    </div>
                    <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-500/10 px-1.5 py-0.5 rounded-full">
                      x{representatives.length}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sorteo;

