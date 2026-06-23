"use client";
import { useState } from "react";
import useQuinielaStore from "../store/quiniela";
import { ShieldAlert, Sparkles, RefreshCw, Award, Trophy, Database, CheckCircle2, Loader2, UserPlus, Dices, Users, ListOrdered } from "lucide-react";
import OrdenSorteoAdmin from "./OrdenSorteoAdmin";
import type { Match } from "../lib/mockData";

const Admin = () => {
  const { matches, teams, setMatchResult, resetTournament, simulateRandom, getGroupStandings, syncMatchResultsFromSupabase, supabaseAvailable, participants, setActiveTab, ordenSorteo } = useQuinielaStore();
  const [scores, setScores] = useState<Record<number, { a: number | string; b: number | string }>>({});
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [showOrdenSorteo, setShowOrdenSorteo] = useState(false);

  const getTeam = (id: string | null) => teams.find(t => t.id === id);

  // Inicializar scores desde datos existentes
  const getScore = (matchId: number, side: 'a' | 'b'): number | string => {
    if (scores[matchId]) return scores[matchId][side];
    const m = matches.find(mm => mm.id === matchId);
    if (!m) return '';
    return side === 'a' ? (m.scoreA ?? '') : (m.scoreB ?? '');
  };

  const handleScoreChange = (matchId: number, side: 'a' | 'b', value: string) => {
    const num = value === '' ? '' : parseInt(value, 10);
    if (value !== '' && (isNaN(num as number) || (num as number) < 0)) return;
    setScores(prev => ({
      ...prev,
      [matchId]: { ...prev[matchId], [side]: num },
    }));
  };

  const handleSubmitResult = (matchId: number) => {
    const s = scores[matchId];
    if (!s || s.a === '' || s.b === '') return;
    setMatchResult(matchId, s.a as number, s.b as number);
    // Limpiar temporal
    setScores(prev => {
      const copy = { ...prev };
      delete copy[matchId];
      return copy;
    });
  };

  interface StageConfig {
    title: string;
    color: string;
    waitingText: string;
    gridCols: string;
    showResultInput: boolean;
  }

  const stageConfigs: Record<string, StageConfig> = {
    Grupos: {
      title: "FASE DE GRUPOS",
      color: 'gray',
      waitingText: 'Partido por jugar',
      gridCols: 'grid-cols-1 md:grid-cols-2 xl:grid-cols-4',
      showResultInput: true,
    },
    Dieciseisavos: {
      title: "DIECISÉISAVOS DE FINAL",
      color: 'orange',
      waitingText: 'Esperando clasificados...',
      gridCols: 'grid-cols-1 md:grid-cols-2 xl:grid-cols-4',
      showResultInput: true,
    },
    Octavos: {
      title: "OCTAVOS DE FINAL",
      color: 'emerald',
      waitingText: 'Esperando resultados...',
      gridCols: 'grid-cols-1 md:grid-cols-2 xl:grid-cols-4',
      showResultInput: true,
    },
    Cuartos: {
      title: "CUARTOS DE FINAL",
      color: 'blue',
      waitingText: 'Esperando resultados...',
      gridCols: 'grid-cols-1 md:grid-cols-2 xl:grid-cols-4',
      showResultInput: true,
    },
    Semis: {
      title: "SEMIFINALES",
      color: 'purple',
      waitingText: 'Esperando resultados...',
      gridCols: 'grid-cols-1 sm:grid-cols-2',
      showResultInput: true,
    },
    Final: {
      title: "GRAN FINAL",
      color: 'amber',
      waitingText: 'Esperando resultados...',
      gridCols: '',
      showResultInput: true,
    },
  };

  const colorClasses: Record<string, { border: string; text: string; winner: string; badge: string }> = {
    gray: { border: 'border-gray-200 dark:border-gray-500/20', text: 'text-gray-600 dark:text-gray-400', winner: 'bg-gray-100 dark:bg-gray-950 border-gray-300 dark:border-gray-500 text-gray-800 dark:text-gray-300', badge: 'bg-gray-500 text-white' },
    orange: { border: 'border-orange-200 dark:border-orange-500/20', text: 'text-orange-600 dark:text-orange-400', winner: 'bg-orange-50 dark:bg-orange-950 border-orange-300 dark:border-orange-500 text-orange-800 dark:text-orange-300', badge: 'bg-orange-500 text-white' },
    emerald: { border: 'border-emerald-200 dark:border-emerald-500/20', text: 'text-emerald-600 dark:text-emerald-400', winner: 'bg-emerald-50 dark:bg-emerald-950 border-emerald-300 dark:border-emerald-500 text-emerald-800 dark:text-emerald-300', badge: 'bg-emerald-500 text-white' },
    blue: { border: 'border-blue-200 dark:border-blue-500/20', text: 'text-blue-600 dark:text-blue-400', winner: 'bg-blue-50 dark:bg-blue-950 border-blue-300 dark:border-blue-500 text-blue-800 dark:text-blue-300', badge: 'bg-blue-500 text-white' },
    purple: { border: 'border-purple-200 dark:border-purple-500/20', text: 'text-purple-600 dark:text-purple-400', winner: 'bg-purple-50 dark:bg-purple-950 border-purple-300 dark:border-purple-500 text-purple-800 dark:text-purple-300', badge: 'bg-purple-500 text-white' },
    amber: { border: 'border-amber-200 dark:border-amber-500/20', text: 'text-amber-600 dark:text-amber-400', winner: 'bg-amber-50 dark:bg-amber-950 border-amber-300 dark:border-amber-500 text-amber-800 dark:text-amber-300', badge: 'bg-amber-500 text-white' },
  };

  const renderMatchCard = (m: Match, stageConfig: StageConfig) => {
    const cc = colorClasses[stageConfig.color];
    const hasResult = m.scoreA !== null && m.scoreB !== null;
    const scoreA = getScore(m.id, 'a');
    const scoreB = getScore(m.id, 'b');
    const canSubmit = scoreA !== '' && scoreB !== '';

    return (
      <div key={m.id} className={`bg-white dark:bg-gray-950 p-4 rounded-xl border border-gray-200 dark:border-gray-800 space-y-3 ${(!m.teamAId || !m.teamBId) ? 'opacity-50' : ''}`}>
        <div className="flex justify-between items-center text-[10px] text-gray-500 dark:text-gray-400 font-bold">
          <span>{m.stage === 'Grupos' ? `Grupo ${m.group} • Partido #${m.id}` : `Partido #${m.id}`}</span>
          <span>{m.date}</span>
        </div>

        {(!m.teamAId || !m.teamBId) ? (
          <p className="text-xs text-gray-400 dark:text-gray-500 italic text-center py-4">{stageConfig.waitingText}</p>
        ) : (
          <div className="space-y-2">
            {/* Team A */}
            <div className={`w-full p-2 rounded-lg border text-xs font-semibold flex items-center justify-between ${
              hasResult && m.winnerId === m.teamAId ? cc.winner : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300'
            }`}>
              <span className="flex items-center gap-1.5">
                <img src={getTeam(m.teamAId)?.flagUrl} alt="" className="w-5 h-3.5 object-cover rounded inline-block" loading="lazy" />
                <span>{getTeam(m.teamAId)?.name}</span>
              </span>
              {hasResult && <span className="font-extrabold text-sm">{m.scoreA}</span>}
            </div>
            {/* Team B */}
            <div className={`w-full p-2 rounded-lg border text-xs font-semibold flex items-center justify-between ${
              hasResult && m.winnerId === m.teamBId ? cc.winner : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300'
            }`}>
              <span className="flex items-center gap-1.5">
                <img src={getTeam(m.teamBId)?.flagUrl} alt="" className="w-5 h-3.5 object-cover rounded inline-block" loading="lazy" />
                <span>{getTeam(m.teamBId)?.name}</span>
              </span>
              {hasResult && <span className="font-extrabold text-sm">{m.scoreB}</span>}
            </div>

            {/* Inputs para resultado */}
            {!hasResult && (
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={scoreA}
                  onChange={e => handleScoreChange(m.id, 'a', e.target.value)}
                  placeholder="0"
                  className="w-14 text-center text-sm font-bold bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg py-1 text-gray-900 dark:text-gray-100 focus:border-emerald-500 focus:outline-none"
                />
                <span className="text-xs text-gray-400 font-bold">vs</span>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={scoreB}
                  onChange={e => handleScoreChange(m.id, 'b', e.target.value)}
                  placeholder="0"
                  className="w-14 text-center text-sm font-bold bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg py-1 text-gray-900 dark:text-gray-100 focus:border-emerald-500 focus:outline-none"
                />
                <button
                  onClick={() => handleSubmitResult(m.id)}
                  disabled={!canSubmit}
                  className="ml-auto px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white text-[10px] font-bold transition disabled:cursor-not-allowed"
                >
                  Registrar
                </button>
              </div>
            )}

            {/* Si hay resultado, mostrar badge de ganador */}
            {hasResult && m.winnerId && (
              <div className="flex justify-end">
                <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded ${cc.badge} font-extrabold`}>
                  {m.winnerId === m.teamAId ? getTeam(m.teamAId)?.name : getTeam(m.teamBId)?.name} AVANZA
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderStageSection = (stageName: string, matchesForStage: Match[]) => {
    const stageConfig = stageConfigs[stageName];
    if (!stageConfig) return null;
    const cc = colorClasses[stageConfig.color] || colorClasses.gray;

    return (
      <div className="space-y-4 pt-4">
        <span className={`text-xs font-bold ${cc.text} tracking-wider block border-b ${cc.border} pb-1`}>
          {stageConfig.title}
        </span>
        <div className={`grid gap-4 ${stageConfig.gridCols}`}>
          {matchesForStage.map(m => renderMatchCard(m, stageConfig))}
        </div>
      </div>
    );
  };

  // Tabla de posiciones para cada grupo
  const renderGroupTable = (group: string) => {
    const standings = getGroupStandings(group);
    return (
      <div key={group} className="bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800 p-3">
        <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">Grupo {group}</h4>
        <div className="overflow-x-auto -mx-1">
          <table className="w-full text-[10px] min-w-[380px]">
            <thead>
              <tr className="text-gray-400 dark:text-gray-500 border-b border-gray-200 dark:border-gray-800">
                <th className="text-center py-1 px-0.5 w-6">Pos</th>
                <th className="text-left py-1 pr-1">Equipo</th>
                <th className="text-center py-1 px-1">PJ</th>
                <th className="text-center py-1 px-1">PG</th>
                <th className="text-center py-1 px-1">PE</th>
                <th className="text-center py-1 px-1">PP</th>
                <th className="text-center py-1 px-1">GF</th>
                <th className="text-center py-1 px-1">GC</th>
                <th className="text-center py-1 px-1">DG</th>
                <th className="text-center py-1 pl-1 font-bold">Pts</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((t) => {
                const isQualified = t.pos <= 2;
                return (
                  <tr key={t.id} className={`${isQualified ? 'bg-emerald-50 dark:bg-emerald-950/30' : ''} border-b border-gray-100 dark:border-gray-900 last:border-0`}>
                    <td className="text-center py-1 px-0.5">
                      {isQualified ? (
                        <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-emerald-500 text-white text-[8px] font-extrabold leading-none">{t.pos}</span>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500">{t.pos}</span>
                      )}
                    </td>
                    <td className={`py-1 pr-1 ${isQualified ? 'text-gray-900 dark:text-white font-semibold' : 'text-gray-600 dark:text-gray-400'}`}>
                      <span className="flex items-center gap-1">
                        <img src={t.flagUrl} alt="" className="w-4 h-3 object-cover rounded flex-shrink-0" />
                        <span className="truncate max-w-[70px]">{t.name}</span>
                        {isQualified && (
                          <span className="flex-shrink-0 text-[7px] uppercase px-1 py-0.5 rounded bg-emerald-500 text-white font-extrabold leading-none ml-auto">
                            Clasifica
                          </span>
                        )}
                      </span>
                    </td>
                    <td className={`text-center py-1 px-1 ${isQualified ? 'font-semibold text-gray-800 dark:text-gray-200' : 'text-gray-500 dark:text-gray-400'}`}>{t.pj}</td>
                    <td className={`text-center py-1 px-1 ${isQualified ? 'font-semibold text-gray-800 dark:text-gray-200' : 'text-gray-500 dark:text-gray-400'}`}>{t.pg}</td>
                    <td className={`text-center py-1 px-1 ${isQualified ? 'font-semibold text-gray-800 dark:text-gray-200' : 'text-gray-500 dark:text-gray-400'}`}>{t.pe}</td>
                    <td className={`text-center py-1 px-1 ${isQualified ? 'font-semibold text-gray-800 dark:text-gray-200' : 'text-gray-500 dark:text-gray-400'}`}>{t.pp}</td>
                    <td className={`text-center py-1 px-1 ${isQualified ? 'font-semibold text-gray-800 dark:text-gray-200' : 'text-gray-500 dark:text-gray-400'}`}>{t.gf}</td>
                    <td className={`text-center py-1 px-1 ${isQualified ? 'font-semibold text-gray-800 dark:text-gray-200' : 'text-gray-500 dark:text-gray-400'}`}>{t.gc}</td>
                    <td className={`text-center py-1 px-1 font-mono ${isQualified ? 'font-semibold text-gray-800 dark:text-gray-200' : 'text-gray-500 dark:text-gray-400'}`}>
                      {t.dif > 0 ? `+${t.dif}` : t.dif}
                    </td>
                    <td className={`text-center py-1 pl-1 font-bold ${isQualified ? 'text-emerald-700 dark:text-emerald-400' : 'text-gray-700 dark:text-gray-300'}`}>{t.pts}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const handleSyncFromSupabase = async () => {
    setSyncing(true);
    await syncMatchResultsFromSupabase();
    setSyncing(false);
    setLastSync(new Date());
  };

  return (
    <div className="space-y-6">
      <div className="glass rounded-2xl p-6 sm:p-8 space-y-6 border border-amber-200 dark:border-amber-500/20 bg-white/50 dark:bg-transparent">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 flex items-center gap-2">
              <ShieldAlert /> Consola del Administrador
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Registra los resultados de cada partido. Los ganadores avanzan automáticamente.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {/* Botón de sincronización con Supabase */}
            <button
              onClick={handleSyncFromSupabase}
              disabled={syncing}
              className={`px-3 py-2 rounded-xl font-bold text-xs transition flex items-center gap-1.5 ${
                supabaseAvailable
                  ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-700/30 hover:bg-emerald-200 dark:hover:bg-emerald-800/40'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 border border-gray-300 dark:border-gray-700 cursor-not-allowed'
              }`}
            >
              {syncing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Database className="w-3.5 h-3.5" />
              )}
              {syncing ? 'Sincronizando...' : 'Sincronizar BD'}
            </button>
            {lastSync && (
              <span className="text-[9px] text-emerald-500 dark:text-emerald-400 self-center">
                <CheckCircle2 className="w-3 h-3 inline mr-0.5" />
                {lastSync.toLocaleTimeString()}
              </span>
            )}
            <button onClick={simulateRandom} className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-lg shadow-purple-500/20">
              <Sparkles className="w-3.5 h-3.5" /> Simular Todo
            </button>
            <button onClick={resetTournament} className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-bold text-xs border border-gray-200 dark:border-gray-700 transition flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5" /> Reiniciar
            </button>
          </div>
        </div>

        {/* ============================================ */}
        {/* GESTIÓN DE PARTICIPANTES */}
        {/* ============================================ */}
        <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            <Users className="text-emerald-500 dark:text-emerald-400" /> Gestión de Participantes
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Administra los participantes de la quiniela: {participants.length} registrados
            ({participants.filter(p => !p.teamIds || p.teamIds.length === 0).length} sin equipo asignado).
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Botón: Orden de Sorteo */}
            <button
              onClick={() => setShowOrdenSorteo(!showOrdenSorteo)}
              className="flex items-center gap-3 p-4 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-700/30 hover:bg-purple-100 dark:hover:bg-purple-900/40 transition text-left"
            >
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                <ListOrdered className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-purple-700 dark:text-purple-300">
                  {showOrdenSorteo ? 'Ocultar Orden' : 'Orden de Sorteo'}
                </p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">
                  {showOrdenSorteo ? 'Cerrar panel de posiciones' : `Gestionar las ${ordenSorteo.length} posiciones de sorteo`}
                </p>
              </div>
            </button>

            {/* Botón: Registrar Nuevo Participante */}
            <button
              onClick={() => setActiveTab("register")}
              className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-700/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition text-left"
            >
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <UserPlus className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">Registrar Participante</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">Dar de alta un nuevo usuario en la quiniela</p>
              </div>
            </button>

            {/* Botón: Ir al Sorteo */}
            <button
              onClick={() => setActiveTab("sorteo")}
              className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-700/30 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition text-left"
            >
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                <Dices className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-amber-700 dark:text-amber-300">Sorteo de Equipos</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">Tómbola para asignar equipos aleatorios</p>
              </div>
            </button>

            {/* Botón: Ver Representantes */}
            <button
              onClick={() => setActiveTab("representantes")}
              className="flex items-center gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-700/30 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition text-left"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-blue-700 dark:text-blue-300">Ver Participantes</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">Lista completa de todos los representantes</p>
              </div>
            </button>
          </div>
        </div>

        {/* Tablas de grupos */}
        <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            <Award className="text-amber-500 dark:text-amber-400" /> Tabla de Posiciones - Fase de Grupos
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Clasifican: Top 2 de cada grupo (24) + 8 mejores terceros lugares = 32 equipos
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'].map(g => renderGroupTable(g))}
          </div>
        </div>

        {/* Resultados de partidos */}
        <div className="space-y-6 pt-4 border-t border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            <Trophy className="text-amber-500 dark:text-amber-400" /> Registrar Resultados
          </h3>
          {renderStageSection('Grupos', matches.filter(m => m.stage === 'Grupos'))}
          {renderStageSection('Dieciseisavos', matches.filter(m => m.stage === 'Dieciseisavos'))}
          {renderStageSection('Octavos', matches.filter(m => m.stage === 'Octavos'))}
          {renderStageSection('Cuartos', matches.filter(m => m.stage === 'Cuartos'))}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
            {renderStageSection('Semis', matches.filter(m => m.stage === 'Semis'))}
            {renderStageSection('Final', matches.filter(m => m.stage === 'Final'))}
          </div>
        </div>
      </div>

      {/* Panel de Orden de Sorteo */}
      {showOrdenSorteo && (
      <div className="mt-8">
        <OrdenSorteoAdmin />
      </div>
      )}
    </div>
  );
};

export default Admin;

