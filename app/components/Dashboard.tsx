/* eslint-disable @next/next/no-img-element */
import useQuinielaStore from "../store/quiniela";
import { Calendar, UserPlus, Users, Crown, Trophy, MessageSquareCode, CalendarDays } from "lucide-react";

const Dashboard = () => {
  const { matches, teams, setActiveTab } = useQuinielaStore();

  const getTeam = (id: string | null) => teams.find((t) => t.id === id);

  const renderMatch = (m: any, stageConfig: any) => (
    <div
      key={m.id}
      className={`bg-white/50 dark:bg-gray-950/50 rounded-lg p-3 border border-gray-200 dark:border-gray-800/50 text-xs space-y-2 relative ${
        m.winnerId ? stageConfig.borderClass : ""
      }`}
    >
      <div className="flex justify-between items-center text-[10px] text-gray-500 dark:text-gray-400">
        <span>{m.date}</span>
        <span className="font-semibold text-amber-600 dark:text-amber-500">
          {m.venue.split(",")[1] || m.venue}
        </span>
      </div>
      <div className="space-y-1.5">
        {/* Team A */}
        <div
          className={`flex items-center justify-between p-1.5 rounded min-h-[32px] ${
            m.winnerId === m.teamAId
              ? `${stageConfig.winnerBgClass} font-bold`
              : m.winnerId
              ? "opacity-40 line-through"
              : ""
          }`}
        >
          {m.teamAId ? (
            <span className="flex items-center gap-1.5">
              <img src={getTeam(m.teamAId)?.flagUrl} alt="" className="w-5 h-3.5 object-cover rounded inline-block" loading="lazy" />
              <span>{getTeam(m.teamAId)?.name}</span>
            </span>
          ) : (
            <span className="text-gray-500 italic">
              {stageConfig.waitingText}
            </span>
          )}
          {m.winnerId === m.teamAId && stageConfig.icon}
        </div>
        {/* Team B */}
        <div
          className={`flex items-center justify-between p-1.5 rounded min-h-[32px] ${
            m.winnerId === m.teamBId
              ? `${stageConfig.winnerBgClass} font-bold`
              : m.winnerId
              ? "opacity-40 line-through"
              : ""
          }`}
        >
          {m.teamBId ? (
            <span className="flex items-center gap-1.5">
              <img src={getTeam(m.teamBId)?.flagUrl} alt="" className="w-5 h-3.5 object-cover rounded inline-block" loading="lazy" />
              <span>{getTeam(m.teamBId)?.name}</span>
            </span>
          ) : (
            <span className="text-gray-500 italic">
              {stageConfig.waitingText}
            </span>
          )}
          {m.winnerId === m.teamBId && stageConfig.icon}
        </div>
      </div>
      {m.stage === "Final" && m.winnerId && (
        <div className="mt-4 p-2 bg-gradient-to-r from-amber-500/20 to-yellow-600/20 rounded border border-amber-500/30 text-center animate-pulse">
          <p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">
            🏆 CAMPEÓN DEL MUNDIAL 🏆
          </p>
          <p className="font-extrabold text-base text-yellow-300 mt-1">
            <img src={getTeam(m.winnerId)?.flagUrl} alt="" className="w-6 h-4 object-cover rounded inline-block mr-1" loading="lazy" />
            {getTeam(m.winnerId)?.name}
          </p>
        </div>
      )}
    </div>
  );

  const stages = {
    Octavos: {
      title: "OCTAVOS DE FINAL",
      badgeClass: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300",
      borderClass: "border-emerald-500/20",
      winnerBgClass: "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300",
      icon: <Crown className="w-3.5 h-3.5 text-amber-500" />,
      waitingText: "Esperando Ganador...",
    },
    Cuartos: {
      title: "CUARTOS DE FINAL",
      badgeClass: "bg-blue-100 text-blue-800 dark:bg-blue-500/10 dark:text-blue-300",
      borderClass: "border-blue-500/20",
      winnerBgClass: "bg-blue-100 dark:bg-blue-950/40 text-blue-900 dark:text-blue-300",
      icon: <Crown className="w-3.5 h-3.5 text-amber-500" />,
      waitingText: "Esperando Ganador...",
    },
    Semis: {
      title: "SEMIFINALES",
      badgeClass: "bg-purple-100 text-purple-800 dark:bg-purple-500/10 dark:text-purple-300",
      borderClass: "border-purple-500/20",
      winnerBgClass: "bg-purple-100 dark:bg-purple-950/40 text-purple-900 dark:text-purple-300",
      icon: <Crown className="w-3.5 h-3.5 text-amber-500" />,
      waitingText: "Esperando Ganador...",
    },
    Final: {
      title: "GRAN FINAL",
      badgeClass: "bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-300",
      borderClass: "border-amber-500/30 ring-2 ring-amber-500/20",
      winnerBgClass: "bg-amber-100 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300",
      icon: <Trophy className="w-4 h-4 text-amber-500 dark:text-amber-400" />,
      waitingText: "Esperando Finalista...",
    },
  };

  const renderStageColumn = (stageName: string, matchesForStage: any[]) => {
    const stageConfig = stages[stageName as keyof typeof stages];
    return (
      <div className="glass rounded-xl p-4 border border-gray-200 dark:border-gray-800/80 space-y-4 bg-white/50 dark:bg-transparent">
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-2">
          <span className="font-extrabold text-sm text-emerald-600 dark:text-emerald-400">
            {stageConfig.title}
          </span>
          <span
            className={`text-[10px] ${stageConfig.badgeClass} px-2 py-0.5 rounded-full font-bold`}
          >
            {matchesForStage.length} Partido{matchesForStage.length > 1 && 's'}
          </span>
        </div>
        <div className="space-y-3 overflow-y-auto max-h-[450px] pr-1">
          {matchesForStage.map(m => renderMatch(m, stageConfig))}
        </div>
      </div>
    );
  };



  return (
    <div className="space-y-8">
      {/* Jumbotron */}
      <div className="relative overflow-hidden rounded-2xl glass-premium p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 bg-white/60 dark:bg-transparent">
        <div className="space-y-4 text-center md:text-left z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse"></span>
            Fases Eliminatorias del Mundial 2026
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Fechas y Progresión de Equipos
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-xl text-sm leading-relaxed">
            Sigue de cerca las fechas del torneo. Cuando un equipo es derrotado
            en su partido oficial, queda automáticamente{" "}
            <span className="text-red-500 dark:text-red-400 font-bold">Eliminado</span> de la
            quiniela junto con todos sus representantes. ¡Avanza con tu equipo
            hasta la final!
          </p>
          <div className="flex flex-wrap justify-center md:justify-start gap-4">
            <button
              onClick={() => setActiveTab("register")}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 dark:hover:bg-emerald-400 font-bold shadow-lg shadow-emerald-500/20 transition flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" /> Unirme a la Quiniela
            </button>
            <button
              onClick={() => setActiveTab("representantes")}
              className="px-5 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 font-bold transition flex items-center gap-2 border border-gray-200 dark:border-gray-700"
            >
              <Users className="w-4 h-4" /> Ver Representantes
            </button>
          </div>
        </div>
        <div className="relative w-40 h-40 flex items-center justify-center bg-gray-100/50 dark:bg-gray-800/20 rounded-full border border-gray-200 dark:border-white/5 shadow-inner">
          <div className="absolute inset-4 rounded-full bg-emerald-100 dark:bg-emerald-500/5 animate-pulse"></div>
          <Calendar className="w-20 h-20 text-emerald-500/80 filter drop-shadow-[0_10px_15px_rgba(16,185,129,0.4)]" />
        </div>
      </div>

      {/* Calendar Section */}
      <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-4">
          <h3 className="text-xl font-bold tracking-tight flex items-center gap-2 text-gray-900 dark:text-white">
            <CalendarDays className="text-emerald-500 dark:text-emerald-400" /> Rol de Partidos y Fechas Oficiales
          </h3>
          <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-3 py-1 rounded-full font-semibold border border-gray-200 dark:border-transparent">
            {matches.length} Partidos Totales
          </span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {renderStageColumn('Octavos', matches.filter(m => m.stage === 'Octavos'))}
            {renderStageColumn('Cuartos', matches.filter(m => m.stage === 'Cuartos'))}
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
            <h4 className="font-bold text-sm text-emerald-600 dark:text-emerald-400">
              Reglamento Oficial de la Cafetera
            </h4>
            <p className="text-xs text-gray-600 dark:text-gray-300">
              &quot;El representante de equipo que logre coronar Campeón a su país,
              tendrá derecho a no hacer café durante un mes.&quot;
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-gray-500 dark:text-gray-400">
            Aprobado por el sindicato no-oficial
          </span>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
