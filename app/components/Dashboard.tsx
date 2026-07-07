"use client";
import { useEffect, useState } from "react";
/* eslint-disable @next/next/no-img-element */
import useQuinielaStore from "../store/quiniela";
import { Calendar, Users, Crown, Trophy, CalendarDays, Swords, Medal, Database } from "lucide-react";
import { GROUP_LABELS, sortMatchesForStage, type Match } from "../lib/mockData";

const Dashboard = () => {
  const { matches, teams, setActiveTab, myRegistration, getGroupStandings, supabaseResults } = useQuinielaStore();
  const [hydrated, setHydrated] = useState(false);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    setHydrated(true);
  }, []);

  // Contar resultados persistidos
  const persistedCount = Object.keys(supabaseResults).length;

  const getTeam = (id: string | null) => teams.find((t) => t.id === id);

  // ============================================================
  // RENDER: Tabla de posiciones de un grupo
  // ============================================================
  const renderGroupTable = (group: string) => {
    const standings = getGroupStandings(group);
    return (
      <div key={group} className="glass rounded-xl p-3 border border-gray-200 dark:border-gray-800/80 bg-white/50 dark:bg-transparent">
        <h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-2">{GROUP_LABELS[group]}</h4>
        <table className="w-full text-[10px]">
          <thead>
            <tr className="text-gray-400 dark:text-gray-500 border-b border-gray-200 dark:border-gray-800">
              <th className="text-left py-1 pr-1">#</th>
              <th className="text-left py-1 pr-1">Equipo</th>
              <th className="text-center py-1 px-1">PJ</th>
              <th className="text-center py-1 px-1">PTS</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((t, i) => (
              <tr key={t.id} className={`${i < 2 ? 'text-emerald-600 dark:text-emerald-300 font-semibold' : 'text-gray-500 dark:text-gray-400'} border-b border-gray-100 dark:border-gray-900 last:border-0`}>
                <td className="py-1 pr-1">{i + 1}</td>
                <td className="py-1 pr-1 flex items-center gap-1">
                  <img src={t.flagUrl} alt="" className="w-4 h-3 object-cover rounded" />
                  <span className="truncate max-w-[80px]">{t.name}</span>
                </td>
                <td className="text-center py-1 px-1">{t.pj}</td>
                <td className="text-center py-1 px-1 font-bold">{t.pts}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // ============================================================
  // RENDER: Bracket de un partido knockout (estilo cuadro)
  // ============================================================
  interface BracketStageConfig {
    title: string;
    color: string;
    badgeClass: string;
    borderClass: string;
    winnerBgClass: string;
    waitingText: string;
    icon: React.ReactNode;
  }

  const renderBracketMatch = (m: Match, stageConfig: BracketStageConfig, compact: boolean = false) => {
    const teamA = m.teamAId ? getTeam(m.teamAId) : null;
    const teamB = m.teamBId ? getTeam(m.teamBId) : null;
    const hasResult = m.winnerId !== null;
    const isPending = !m.teamAId || !m.teamBId;

    return (
      <div
        key={m.id}
        className={`relative rounded-lg border transition-all ${
          hasResult
            ? `${stageConfig.borderClass} bg-white/70 dark:bg-gray-950/70`
            : 'border-gray-200 dark:border-gray-800 bg-white/40 dark:bg-gray-950/40'
        } ${isPending ? 'opacity-40' : ''}`}
      >
        {/* Match header */}
        {!compact && (
          <div className="flex justify-between items-center px-3 pt-2 pb-1 text-[9px] text-gray-500 dark:text-gray-400 font-bold">
            <span>#{m.id}</span>
            {m.date && <span>{m.date}</span>}
          </div>
        )}

        {/* Team A */}
        <div
          className={`flex items-center justify-between px-3 py-2 ${compact ? 'py-1.5 rounded-t-lg' : ''} ${
            hasResult && m.winnerId === m.teamAId
              ? `${stageConfig.winnerBgClass} font-bold rounded-t-lg`
              : hasResult
                ? 'opacity-30 line-through'
                : ''
          }`}
        >
          {teamA ? (
            <span className="flex items-center gap-1.5 text-xs">
              <img src={teamA.flagUrl} alt="" className="w-5 h-3.5 object-cover rounded" loading="lazy" />
              <span className="truncate max-w-[100px]">{teamA.name}</span>
            </span>
          ) : (
            <span className="text-[10px] text-gray-400 italic">{stageConfig.waitingText}</span>
          )}
          {hasResult && m.scoreA !== null && (
            <span className={`font-extrabold text-sm ${m.winnerId === m.teamAId ? 'text-green-700 dark:text-green-400' : ''}`}>
              {m.scoreA}
            </span>
          )}
        </div>

        {/* Divider */}
        <div className="flex items-center px-3">
          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
          <span className="text-[9px] font-bold text-gray-400 px-1">VS</span>
          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
        </div>

        {/* Team B */}
        <div
          className={`flex items-center justify-between px-3 py-2 ${compact ? 'py-1.5 rounded-b-lg' : ''} ${
            hasResult && m.winnerId === m.teamBId
              ? `${stageConfig.winnerBgClass} font-bold rounded-b-lg`
              : hasResult
                ? 'opacity-30 line-through'
                : ''
          }`}
        >
          {teamB ? (
            <span className="flex items-center gap-1.5 text-xs">
              <img src={teamB.flagUrl} alt="" className="w-5 h-3.5 object-cover rounded" loading="lazy" />
              <span className="truncate max-w-[100px]">{teamB.name}</span>
            </span>
          ) : (
            <span className="text-[10px] text-gray-400 italic">{stageConfig.waitingText}</span>
          )}
          {hasResult && m.scoreB !== null && (
            <span className={`font-extrabold text-sm ${m.winnerId === m.teamBId ? 'text-green-700 dark:text-green-400' : ''}`}>
              {m.scoreB}
            </span>
          )}
        </div>

        {/* Winner badge */}
        {hasResult && m.winnerId && (
          <div className="px-3 pb-2 pt-0.5 flex justify-center">
            <span className={`text-[8px] uppercase px-1.5 py-0.5 rounded-full bg-green-500 text-white font-extrabold flex items-center gap-0.5`}>
              <Crown className="w-2 h-2" />
              {getTeam(m.winnerId)?.name} AVANZA
            </span>
          </div>
        )}

        {isPending && (
          <div className="text-center py-1 pb-2">
            <span className="text-[9px] text-gray-400 italic">Por definir</span>
          </div>
        )}
      </div>
    );
  };

  // ============================================================
  // RENDER: Columna de bracket para una fase eliminatoria
  // ============================================================
  const renderBracketColumn = (stageName: string, matchesForStage: Match[], compact: boolean = false) => {
    const stages: Record<string, BracketStageConfig> = {
      Dieciseisavos: {
        title: 'DIECISÉISAVOS',
        color: 'orange',
        badgeClass: 'bg-orange-100 text-orange-800 dark:bg-orange-500/10 dark:text-orange-300',
        borderClass: 'border-orange-500/20',
        winnerBgClass: 'bg-orange-100 dark:bg-orange-950/40 text-orange-900 dark:text-orange-300',
        waitingText: 'Esperando clasificado...',
        icon: <Swords className="w-3.5 h-3.5" />,
      },
      Octavos: {
        title: 'OCTAVOS',
        color: 'emerald',
        badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300',
        borderClass: 'border-emerald-500/20',
        winnerBgClass: 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300',
        waitingText: 'Esperando ganador...',
        icon: <Swords className="w-3.5 h-3.5" />,
      },
      Cuartos: {
        title: 'CUARTOS',
        color: 'blue',
        badgeClass: 'bg-blue-100 text-blue-800 dark:bg-blue-500/10 dark:text-blue-300',
        borderClass: 'border-blue-500/20',
        winnerBgClass: 'bg-blue-100 dark:bg-blue-950/40 text-blue-900 dark:text-blue-300',
        waitingText: 'Esperando ganador...',
        icon: <Swords className="w-3.5 h-3.5" />,
      },
      Semis: {
        title: 'SEMIFINALES',
        color: 'purple',
        badgeClass: 'bg-purple-100 text-purple-800 dark:bg-purple-500/10 dark:text-purple-300',
        borderClass: 'border-purple-500/20',
        winnerBgClass: 'bg-purple-100 dark:bg-purple-950/40 text-purple-900 dark:text-purple-300',
        waitingText: 'Esperando ganador...',
        icon: <Medal className="w-3.5 h-3.5" />,
      },
      Final: {
        title: 'GRAN FINAL',
        color: 'amber',
        badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-300',
        borderClass: 'border-amber-500/30 ring-2 ring-amber-500/20',
        winnerBgClass: 'bg-amber-100 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300',
        waitingText: 'Esperando finalista...',
        icon: <Trophy className="w-4 h-4 text-amber-500" />,
      },
      TercerLugar: {
        title: '3ER LUGAR',
        color: 'orange',
        badgeClass: 'bg-orange-100 text-orange-800 dark:bg-orange-500/10 dark:text-orange-300',
        borderClass: 'border-orange-500/20',
        winnerBgClass: 'bg-orange-100 dark:bg-orange-950/40 text-orange-900 dark:text-orange-300',
        waitingText: 'Esperando perdedores...',
        icon: <Medal className="w-3.5 h-3.5 text-orange-500" />,
      },
    };

    const sc = stages[stageName];
    if (!sc) return null;

    return (
      <div className="glass rounded-xl p-4 border border-gray-200 dark:border-gray-800/80 space-y-3 bg-white/50 dark:bg-transparent">
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-2">
          <span className={`font-extrabold text-xs text-${sc.color}-600 dark:text-${sc.color}-400 flex items-center gap-1.5`}>
            {sc.icon} {sc.title}
          </span>
          <span className={`text-[10px] ${sc.badgeClass} px-2 py-0.5 rounded-full font-bold`}>
            {matchesForStage.filter((m: Match) => m.winnerId !== null).length}/{matchesForStage.length}
          </span>
        </div>
        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
          {sortMatchesForStage(stageName, matchesForStage).map((m: Match) => renderBracketMatch(m, sc, compact))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Jumbotron */}
      <div className="relative overflow-hidden rounded-2xl glass-premium p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 bg-white/60 dark:bg-transparent">
        <div className="space-y-4 text-center md:text-left z-10">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse"></span>
              Mundial 2026 — 48 Equipos · 12 Grupos
            </div>
            {persistedCount > 0 && (
              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[9px] font-semibold border border-blue-200 dark:border-blue-800/30">
                <Database className="w-3 h-3" />
                {persistedCount} resultado{persistedCount !== 1 ? 's' : ''} guardado{persistedCount !== 1 ? 's' : ''} en BD
              </div>
            )}
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Quiniela del Mundial 2026
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-xl text-sm leading-relaxed">
            <strong>Fase de Grupos:</strong> Cada equipo juega 3 partidos. 3 pts por victoria, 1 por empate, 0 por derrota.
            Los 2 primeros de cada grupo + los 8 mejores terceros lugares clasifican a Dieciseisavos de Final.
          </p>
          <div className="flex flex-wrap justify-center md:justify-start gap-4">
            <button onClick={() => setActiveTab('representantes')} className="px-5 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 font-bold transition flex items-center gap-2 border border-gray-200 dark:border-gray-700">
              <Users className="w-4 h-4" /> Ver Representantes
            </button>
          </div>
        </div>
        <div className="relative w-40 h-40 flex items-center justify-center bg-gray-100/50 dark:bg-gray-800/20 rounded-full border border-gray-200 dark:border-white/5 shadow-inner">
          <div className="absolute inset-4 rounded-full bg-emerald-100 dark:bg-emerald-500/5 animate-pulse"></div>
          <Calendar className="w-20 h-20 text-emerald-500/80 filter drop-shadow-[0_10px_15px_rgba(16,185,129,0.4)]" />
        </div>
      </div>

      {/* Tablas de grupos */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-4">
          <h3 className="text-xl font-bold tracking-tight flex items-center gap-2 text-gray-900 dark:text-white">
            <Medal className="text-emerald-500 dark:text-emerald-400" /> Tablas de Posiciones — Fase de Grupos
          </h3>
          <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-3 py-1 rounded-full font-semibold border border-gray-200 dark:border-transparent">
            12 grupos · 48 equipos
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'].map(g => renderGroupTable(g))}
        </div>
        <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/30 text-center">
          <p className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold">
            🏆 Top 2 de cada grupo (24) + 8 mejores terceros = <strong>32 equipos</strong> clasifican a Dieciseisavos de Final
          </p>
        </div>
      </div>

      {/* FASE DE GRUPOS — Partidos */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-4">
          <h3 className="text-xl font-bold tracking-tight flex items-center gap-2 text-gray-900 dark:text-white">
            <CalendarDays className="text-emerald-500 dark:text-emerald-400" /> Fase de Grupos — Partidos del Mundial
          </h3>
          <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-3 py-1 rounded-full font-semibold border border-gray-200 dark:border-transparent">
            {matches.filter(m => m.stage === 'Grupos').length} Partidos
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'].map(group => {
            const groupMatches = matches.filter(m => m.stage === 'Grupos' && m.group === group);
            return (
              <div key={group} className="glass rounded-xl p-3 border border-gray-200 dark:border-gray-800/80 bg-white/50 dark:bg-transparent">
                <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-2 mb-2">
                  <span className="font-extrabold text-xs text-emerald-600 dark:text-emerald-400">{GROUP_LABELS[group]}</span>
                  <span className="text-[9px] bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-1.5 py-0.5 rounded-full font-semibold">
                    {groupMatches.filter(m => m.scoreA !== null && m.scoreB !== null).length}/6
                  </span>
                </div>
                <div className="space-y-1.5 max-h-[360px] overflow-y-auto pr-0.5">
                  {groupMatches.map(m => (
                    <div key={m.id} className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-2 border border-gray-100 dark:border-gray-800/50">
                      <div className="flex justify-between items-center text-[9px] text-gray-400 dark:text-gray-500 mb-1">
                        <span>{m.date}</span>
                        <span className="truncate max-w-[80px]">{m.venue.split(',')[1] || m.venue}</span>
                      </div>
                      {/* Local */}
                      <div className={`flex items-center justify-between text-[10px] py-0.5 px-1 rounded ${m.scoreA !== null && m.scoreB !== null && m.scoreA > m.scoreB ? 'bg-emerald-50 dark:bg-emerald-950/30 font-bold text-emerald-700 dark:text-emerald-300' : 'text-gray-600 dark:text-gray-300'}`}>
                        <span className="flex items-center gap-1">
                          <img src={getTeam(m.teamAId)?.flagUrl} alt="" className="w-3.5 h-2.5 object-cover rounded" loading="lazy" />
                          <span>{getTeam(m.teamAId)?.name}</span>
                        </span>
                        <span className="font-extrabold text-xs">{m.scoreA !== null ? m.scoreA : '-'}</span>
                      </div>
                      {/* Visitante */}
                      <div className={`flex items-center justify-between text-[10px] py-0.5 px-1 rounded ${m.scoreA !== null && m.scoreB !== null && m.scoreB > m.scoreA ? 'bg-emerald-50 dark:bg-emerald-950/30 font-bold text-emerald-700 dark:text-emerald-300' : 'text-gray-600 dark:text-gray-300'}`}>
                        <span className="flex items-center gap-1">
                          <img src={getTeam(m.teamBId)?.flagUrl} alt="" className="w-3.5 h-2.5 object-cover rounded" loading="lazy" />
                          <span>{getTeam(m.teamBId)?.name}</span>
                        </span>
                        <span className="font-extrabold text-xs">{m.scoreB !== null ? m.scoreB : '-'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FASE ELIMINATORIA — Bracket visual */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-4">
          <h3 className="text-xl font-bold tracking-tight flex items-center gap-2 text-gray-900 dark:text-white">
            <Swords className="text-emerald-500 dark:text-emerald-400" /> Fase Eliminatoria — Cuadro de Campeonato
          </h3>
          <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-3 py-1 rounded-full font-semibold border border-gray-200 dark:border-transparent">
            {matches.filter(m => m.stage !== 'Grupos').length} Partidos
          </span>
        </div>

        {/* Bracket layout: columnas progresivas */}
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-[900px]">
            {/* Dieciseisavos — 16 partidos (columna más ancha) */}
            <div className="flex-1 min-w-[180px]">
              {renderBracketColumn('Dieciseisavos', matches.filter(m => m.stage === 'Dieciseisavos'), true)}
            </div>
            {/* Octavos — 8 partidos */}
            <div className="flex-1 min-w-[180px]">
              {renderBracketColumn('Octavos', matches.filter(m => m.stage === 'Octavos'), true)}
            </div>
            {/* Cuartos — 4 partidos */}
            <div className="flex-1 min-w-[180px]">
              {renderBracketColumn('Cuartos', matches.filter(m => m.stage === 'Cuartos'), true)}
            </div>
            {/* Semifinal — 2 partidos */}
            <div className="flex-1 min-w-[180px]">
              {renderBracketColumn('Semis', matches.filter(m => m.stage === 'Semis'))}
            </div>
            {/* Final — 1 partido */}
            <div className="flex-1 min-w-[200px]">
              {renderBracketColumn('Final', matches.filter(m => m.stage === 'Final'))}
            </div>
            {/* Tercer Lugar — 1 partido */}
            <div className="flex-1 min-w-[200px]">
              {renderBracketColumn('TercerLugar', matches.filter(m => m.stage === 'TercerLugar'))}
            </div>
          </div>
        </div>

        {/* Leyenda */}
        <div className="flex flex-wrap items-center gap-4 text-[10px] text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-green-100 dark:bg-green-950/40 border border-green-300 dark:border-green-700" />
            Ganador registrado
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-white/40 dark:bg-gray-950/40 border border-gray-200 dark:border-gray-800" />
            Pendiente
          </span>
          <span className="flex items-center gap-1">
            <span className="text-gray-400 italic">Equipos por definir</span>
          </span>
        </div>

        {/* Campeón */}
        {(() => {
          const finalMatch = matches.find(m => m.stage === 'Final' && m.winnerId);
          if (!finalMatch) return null;
          const champion = getTeam(finalMatch.winnerId);
          if (!champion) return null;
          return (
            <div className="mt-4 p-6 bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 rounded-2xl border border-amber-500/30 text-center animate-pulse">
              <p className="text-sm font-extrabold text-amber-500 dark:text-amber-400 uppercase tracking-widest mb-2">
                🏆 Campeón del Mundial 2026 🏆
              </p>
              <div className="flex items-center justify-center gap-3">
                <img src={champion.flagUrl} alt="" className="w-12 h-8 object-cover rounded shadow-lg" loading="lazy" />
                <p className="font-extrabold text-3xl text-yellow-300 tracking-tight">{champion.name}</p>
                <span className="text-4xl">{champion.flag}</span>
              </div>
              {finalMatch.scoreA !== null && finalMatch.scoreB !== null && (
                <p className="text-xs text-amber-400/80 mt-2">
                  Resultado final: {finalMatch.scoreA} - {finalMatch.scoreB}
                </p>
              )}
            </div>
          );
        })()}
      </div>

      {/* Funny Office Quote */}
      {/* <div className="glass rounded-xl p-5 border-l-4 border-emerald-500 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/50 dark:bg-transparent shadow-sm dark:shadow-none">
        <div className="flex items-center gap-3">
          <span className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <MessageSquareCode className="w-5 h-5" />
          </span>
          <div>
            <h4 className="font-bold text-sm text-emerald-600 dark:text-emerald-400">Reglamento Oficial de la Cafetera</h4>
            <p className="text-xs text-gray-600 dark:text-gray-300">
              &quot;El representante que logre coronar Campeón a su país, tendrá derecho a no hacer café durante un mes.&quot;
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-gray-500 dark:text-gray-400">Aprobado por el sindicato no-oficial</span>
        </div>
      </div> */}
    </div>
  );
};

export default Dashboard;
