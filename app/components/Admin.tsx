import useQuinielaStore from "../store/quiniela";
import { ShieldAlert, Sparkles, RefreshCw, Award } from "lucide-react";

const Admin = () => {
  const { matches, teams, setMatchWinner, resetTournament, simulateRandom } = useQuinielaStore();

  const getTeam = (id: string | null) => teams.find(t => t.id === id);

  const renderAdminMatch = (m: any, stageConfig: any) => (
    <div key={m.id} className={`bg-white dark:bg-gray-950 p-4 rounded-xl border border-gray-200 dark:border-gray-800 space-y-3 ${(!m.teamAId || !m.teamBId) ? 'opacity-50' : ''}`}>
        <div className="flex justify-between items-center text-[10px] text-gray-500 dark:text-gray-400 font-bold">
            <span>{`Partido #${m.id}`}</span>
            <span>{m.date.split('•')[0]}</span>
        </div>
        {(!m.teamAId || !m.teamBId) ? (
            <p className="text-xs text-gray-400 dark:text-gray-500 italic text-center py-4">{stageConfig.waitingText}</p>
        ) : (
            <div className="space-y-2">
                {/* Team A */}
                <button
                    onClick={() => setMatchWinner(m.id, m.teamAId!)}
                    className={`w-full p-2 rounded-lg border text-xs font-semibold flex items-center justify-between transition ${
                        m.winnerId === m.teamAId ? stageConfig.winnerClass : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-700'
                    }`}
                >
                    <span className="flex items-center gap-1.5">
                        <img src={getTeam(m.teamAId)?.flagUrl} alt="" className="w-5 h-3.5 object-cover rounded inline-block" loading="lazy" />
                        <span>{getTeam(m.teamAId)?.name}</span>
                    </span>
                    {m.winnerId === m.teamAId && <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded ${stageConfig.winBadgeClass} font-extrabold`}>WIN</span>}
                </button>
                {/* Team B */}
                <button
                    onClick={() => setMatchWinner(m.id, m.teamBId!)}
                    className={`w-full p-2 rounded-lg border text-xs font-semibold flex items-center justify-between transition ${
                        m.winnerId === m.teamBId ? stageConfig.winnerClass : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-700'
                    }`}
                >
                    <span className="flex items-center gap-1.5">
                        <img src={getTeam(m.teamBId)?.flagUrl} alt="" className="w-5 h-3.5 object-cover rounded inline-block" loading="lazy" />
                        <span>{getTeam(m.teamBId)?.name}</span>
                    </span>
                    {m.winnerId === m.teamBId && <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded ${stageConfig.winBadgeClass} font-extrabold`}>WIN</span>}
                </button>
            </div>
        )}
    </div>
);

  const stages = {
    Octavos: {
        title: "OCTAVOS DE FINAL",
        borderColor: "border-emerald-200 dark:border-emerald-500/20",
        textColor: "text-emerald-600 dark:text-emerald-400",
        winnerClass: "bg-emerald-50 dark:bg-emerald-950 border-emerald-300 dark:border-emerald-500 text-emerald-800 dark:text-emerald-300",
        winBadgeClass: "bg-emerald-500 text-white",
        waitingText: "Equipos listos",
        gridCols: "grid-cols-1 md:grid-cols-2 xl:grid-cols-4"
    },
    Cuartos: {
        title: "CUARTOS DE FINAL",
        borderColor: "border-blue-200 dark:border-blue-500/20",
        textColor: "text-blue-600 dark:text-blue-400",
        winnerClass: "bg-blue-50 dark:bg-blue-950 border-blue-300 dark:border-blue-500 text-blue-800 dark:text-blue-300",
        winBadgeClass: "bg-blue-500 text-white",
        waitingText: "Esperando resultados de Octavos...",
        gridCols: "grid-cols-1 md:grid-cols-2 xl:grid-cols-4"
    },
    Semis: {
      title: "SEMIFINALES",
      borderColor: "border-purple-200 dark:border-purple-500/20",
      textColor: "text-purple-600 dark:text-purple-400",
      winnerClass: "bg-purple-50 dark:bg-purple-950 border-purple-300 dark:border-purple-500 text-purple-800 dark:text-purple-300",
      winBadgeClass: "bg-purple-500 text-white",
      waitingText: "Esperando resultados de Cuartos...",
      gridCols: "grid-cols-1 sm:grid-cols-2"
  },
  Final: {
      title: "GRAN FINAL",
      borderColor: "border-amber-200 dark:border-amber-500/20",
      textColor: "text-amber-600 dark:text-amber-400",
      winnerClass: "bg-amber-50 dark:bg-amber-950 border-amber-300 dark:border-amber-500 text-amber-800 dark:text-amber-300",
      winBadgeClass: "bg-amber-500 text-white",
      waitingText: "Esperando resultados de Semifinales...",
      gridCols: "" // Special layout
  }
  };

  const renderStageSection = (stageName: string, matchesForStage: any[]) => {
    const stageConfig = stages[stageName as keyof typeof stages];
    return (
        <div className="space-y-4 pt-4">
            <span className={`text-xs font-bold ${stageConfig.textColor} tracking-wider block border-b ${stageConfig.borderColor} pb-1`}>
                {stageConfig.title}
            </span>
            <div className={`grid gap-4 ${stageConfig.gridCols}`}>
                {matchesForStage.map(m => renderAdminMatch(m, stageConfig))}
            </div>
        </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="glass rounded-2xl p-6 sm:p-8 space-y-6 border border-amber-200 dark:border-amber-500/20 bg-white/50 dark:bg-transparent">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 flex items-center gap-2">
              <ShieldAlert /> Consola del Administrador (RH / TI)
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Determina los ganadores reales o simulados del torneo para ver
              progresar a la oficina en tiempo real.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={simulateRandom}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-lg shadow-purple-500/20"
            >
              <Sparkles className="w-3.5 h-3.5" /> Simular Todo el Torneo
            </button>
            <button
              onClick={resetTournament}
              className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-bold text-xs border border-gray-200 dark:border-gray-700 transition flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Reiniciar Torneo
            </button>
          </div>
        </div>

        <div className="space-y-6 pt-4 border-t border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            <Award className="text-amber-500 dark:text-amber-400" /> Definir Ganadores por Partido
          </h3>
          {renderStageSection('Octavos', matches.filter(m => m.stage === 'Octavos'))}
          {renderStageSection('Cuartos', matches.filter(m => m.stage === 'Cuartos'))}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
            {renderStageSection('Semis', matches.filter(m => m.stage === 'Semis'))}
            {renderStageSection('Final', matches.filter(m => m.stage === 'Final'))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
