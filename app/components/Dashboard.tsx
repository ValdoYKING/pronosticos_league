"use client";
import { useEffect, useState } from "react";
/* eslint-disable @next/next/no-img-element */
import useQuinielaStore from "../store/quiniela";
import { Calendar, UserPlus, Users, Crown, Trophy, MessageSquareCode, CalendarDays, Swords, Medal, Database, CheckCircle2 } from "lucide-react";
import { GROUP_LABELS } from "../lib/mockData";

const Dashboard = () => {
  const { matches, teams, setActiveTab, myRegistration, getGroupStandings, supabaseResults } = useQuinielaStore();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  // Contar resultados persistidos
  const persistedCount = Object.keys(supabaseResults).length;

  const getTeam = (id: string | null) => teams.find((t) => t.id === id);

  // ============================================================
  // RENDER: Match card for Dashboard
  // ============================================================
  const renderMatch = (m: any, stageConfig: any) => (
    <div key={m.id} className={`bg-white/50 dark:bg-gray-950/50 rounded-lg p-3 border border-gray-200 dark:border-gray-800/50 text-xs space-y-2 relative ${m.winnerId ? stageConfig.borderClass : ''}`}>
      <div className="flex justify-between items-center text-[10px] text-gray-500 dark:text-gray-400">
        <span>{m.date}</span>
        <span className="font-semibold text-amber-600 dark:text-amber-500">{m.venue.split(',')[1] || m.venue}</span>
      </div>
      <div className="space-y-1.5">
        {/* Team A */}
        <div className={`flex items-center justify-between p-1.5 rounded min-h-[32px] ${m.winnerId === m.teamAId ? `${stageConfig.winnerBgClass} font-bold` : m.winnerId ? 'opacity-40 line-through' : ''}`}>
          {m.teamAId ? (
            <>
              <span className="flex items-center gap-1.5">
                <img src={getTeam(m.teamAId)?.flagUrl} alt="" className="w-5 h-3.5 object-cover rounded inline-block" loading="lazy" />
                <span>{getTeam(m.teamAId)?.name}</span>
              </span>
              {m.scoreA !== null && <span className="font-extrabold text-sm">{m.scoreA}</span>}
            </>
          ) : (
            <span className="text-gray-500 italic">{stageConfig.waitingText}</span>
          )}
        </div>
        {/* Team B */}
        <div className={`flex items-center justify-between p-1.5 rounded min-h-[32px] ${m.winnerId === m.teamBId ? `${stageConfig.winnerBgClass} font-bold` : m.winnerId ? 'opacity-40 line-through' : ''}`}>
          {m.teamBId ? (
            <>
              <span className="flex items-center gap-1.5">
                <img src={getTeam(m.teamBId)?.flagUrl} alt="" className="w-5 h-3.5 object-cover rounded inline-block" loading="lazy" />
                <span>{getTeam(m.teamBId)?.name}</span>
              </span>
              {m.scoreB !== null && <span className="font-extrabold text-sm">{m.scoreB}</span>}
            </>
          ) : (
            <span className="text-gray-500 italic">{stageConfig.waitingText}</span>
          )}
        </div>
      </div>
      {m.stage === 'Final' && m.winnerId && (
        <div className="mt-4 p-2 bg-gradient-to-r from-amber-500/20 to-yellow-600/20 rounded border border-amber-500/30 text-center animate-pulse">
          <p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">🏆 CAMPEÓN DEL MUNDIAL 🏆</p>
          <p className="font-extrabold text-base text-yellow-300 mt-1">
            <img src={getTeam(m.winnerId)?.flagUrl} alt="" className="w-6 h-4 object-cover rounded inline-block mr-1" loading="lazy" />
            {getTeam(m.winnerId)?.name}
          </p>
        </div>
      )}
    </div>
  );

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
  // RENDER: Stage column
  // ============================================================
  const renderStageColumn = (stageName: string, matchesForStage: any[]) => {
    const stages: Record<string, any> = {
      Grupos: { title: 'FASE DE GRUPOS', badgeClass: 'bg-gray-100 text-gray-800 dark:bg-gray-500/10 dark:text-gray-300', borderClass: 'border-gray-500/20', winnerBgClass: 'bg-gray-100 dark:bg-gray-950/40 text-gray-900 dark:text-gray-300', icon: <Crown className="w-3.5 h-3.5 text-amber-500" />, waitingText: 'Por definir...' },
      Dieciseisavos: { title: 'DIECISÉISAVOS', badgeClass: 'bg-orange-100 text-orange-800 dark:bg-orange-500/10 dark:text-orange-300', borderClass: 'border-orange-500/20', winnerBgClass: 'bg-orange-100 dark:bg-orange-950/40 text-orange-900 dark:text-orange-300', icon: <Crown className="w-3.5 h-3.5 text-amber-500" />, waitingText: 'Esperando Ganador...' },
      Octavos: { title: 'OCTAVOS DE FINAL', badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300', borderClass: 'border-emerald-500/20', winnerBgClass: 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300', icon: <Crown className="w-3.5 h-3.5 text-amber-500" />, waitingText: 'Esperando Ganador...' },
      Cuartos: { title: 'CUARTOS DE FINAL', badgeClass: 'bg-blue-100 text-blue-800 dark:bg-blue-500/10 dark:text-blue-300', borderClass: 'border-blue-500/20', winnerBgClass: 'bg-blue-100 dark:bg-blue-950/40 text-blue-900 dark:text-blue-300', icon: <Crown className="w-3.5 h-3.5 text-amber-500" />, waitingText: 'Esperando Ganador...' },
      Semis: { title: 'SEMIFINALES', badgeClass: 'bg-purple-100 text-purple-800 dark:bg-purple-500/10 dark:text-purple-300', borderClass: 'border-purple-500/20', winnerBgClass: 'bg-purple-100 dark:bg-purple-950/40 text-purple-900 dark:text-purple-300', icon: <Crown className="w-3.5 h-3.5 text-amber-500" />, waitingText: 'Esperando Ganador...' },
      Final: { title: 'GRAN FINAL', badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-300', borderClass: 'border-amber-500/30 ring-2 ring-amber-500/20', winnerBgClass: 'bg-amber-100 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300', icon: <Trophy className="w-4 h-4 text-amber-500 dark:text-amber-400" />, waitingText: 'Esperando Finalista...' },
    };
    const sc = stages[stageName];
    if (!sc) return null;
    return (
      <div className="glass rounded-xl p-4 border border-gray-200 dark:border-gray-800/80 space-y-4 bg-white/50 dark:bg-transparent">
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-2">
          <span className="font-extrabold text-sm text-emerald-600 dark:text-emerald-400">{sc.title}</span>
          <span className={`text-[10px] ${sc.badgeClass} px-2 py-0.5 rounded-full font-bold`}>{matchesForStage.length} Partido{matchesForStage.length > 1 && 's'}</span>
        </div>
        <div className="space-y-3 overflow-y-auto max-h-[450px] pr-1">{matchesForStage.map(m => renderMatch(m, sc))}</div>
      </div>
    )
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
            {(!hydrated || !myRegistration) && (
              <button onClick={() => setActiveTab('register')} className="px-5 py-2.5 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 dark:hover:bg-emerald-400 font-bold shadow-lg shadow-emerald-500/20 transition flex items-center gap-2">
                <UserPlus className="w-4 h-4" /> Unirme a la Quiniela
              </button>
            )}
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

      {/* Bracket / Partidos */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-4">
          <h3 className="text-xl font-bold tracking-tight flex items-center gap-2 text-gray-900 dark:text-white">
            <Swords className="text-emerald-500 dark:text-emerald-400" /> Fase Eliminatoria
          </h3>
          <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-3 py-1 rounded-full font-semibold border border-gray-200 dark:border-transparent">
            {matches.filter(m => m.stage !== 'Grupos').length} Partidos
          </span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {renderStageColumn('Dieciseisavos', matches.filter(m => m.stage === 'Dieciseisavos'))}
          {renderStageColumn('Octavos', matches.filter(m => m.stage === 'Octavos'))}
          {renderStageColumn('Cuartos', matches.filter(m => m.stage === 'Cuartos'))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {renderStageColumn('Semis', matches.filter(m => m.stage === 'Semis'))}
          {renderStageColumn('Final', matches.filter(m => m.stage === 'Final'))}
        </div>
      </div>

      {/* Funny Office Quote */}
      <div className="glass rounded-xl p-5 border-l-4 border-emerald-500 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/50 dark:bg-transparent shadow-sm dark:shadow-none">
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
      </div>
    </div>
  );
};

export default Dashboard;
