/* eslint-disable @next/next/no-img-element */
import useQuinielaStore from "../store/quiniela";

const Representantes = () => {
  const { teams, participants } = useQuinielaStore();

  const getRepresentativesOf = (teamId: string) => {
    return participants.filter((p) => p.teamIds?.includes(teamId));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 dark:border-gray-800 pb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Equipos y sus Representantes
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Visualiza quién de la oficina ha seleccionado cada equipo y conoce
            su estatus en el torneo.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-xs bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-400 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800/30">
            <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400"></span>{" "}
            Activos
          </span>
          <span className="flex items-center gap-1.5 text-xs bg-red-100 dark:bg-red-950/50 text-red-800 dark:text-red-400 px-3 py-1 rounded-full border border-red-200 dark:border-red-800/30">
            <span className="w-2 h-2 rounded-full bg-red-500 dark:bg-red-400"></span> Eliminados
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {teams.map((t) => (
          <div
            key={t.id}
            className={`glass rounded-2xl p-5 border relative overflow-hidden flex flex-col justify-between h-48 bg-white/50 dark:bg-transparent ${
              t.status === "activo"
                ? "border-gray-200 dark:border-gray-800/80 hover:border-emerald-300 dark:hover:border-emerald-500/30"
                : "border-red-200 dark:border-red-950/80 bg-red-50/50 dark:bg-red-950/5 opacity-75"
            }`}
          >
            {/* Header Card: Equipo, Bandera y Estado */}
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <img src={t.flagUrl} alt={t.name} className="w-8 h-6 object-cover rounded shadow-sm" loading="lazy" />
                  <div>
                    <h3 className="font-extrabold text-base text-gray-900 dark:text-white">{t.name}</h3>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">
                      {t.stageReached} {t.group ? `• ${t.group}` : ''}
                    </p>
                  </div>
                </div>
                {/* Badge de Estatus */}
                <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                  t.stageReached === 'Campeón' ? 'bg-amber-100 dark:bg-amber-500/10 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20' :
                  t.status === 'activo' ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20' :
                  'bg-red-100 dark:bg-red-500/10 text-red-800 dark:text-red-400 border border-red-200 dark:border-red-500/20'
                }`}>
                  {t.stageReached === 'Campeón' ? '🏆 Campeón' : (t.status === 'activo' ? 'Vivo' : 'Eliminado')}
                </span>
              </div>
            </div>

            {/* Content Card: Lista de Representantes */}
            <div className="space-y-2 mt-4">
              <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Representantes de la Oficina:</p>
              <div className="flex flex-wrap gap-2 overflow-y-auto max-h-[64px] pr-1">
                {getRepresentativesOf(t.id).length === 0 ? (
                  <p className="text-xs text-gray-400 dark:text-gray-500 italic">Sin representante godín aún...</p>
                ) : (
                  getRepresentativesOf(t.id).map(p => (
                    <div key={p.id} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs ${
                      p.status === 'activo' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/20' : 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-500/20'
                    }`}>
                      {p.photoType === 'upload' && p.photo && p.photo !== '💼' && p.photo.startsWith('http') ? (
                        <img key={p.photo} src={p.photo} alt={p.name} className="w-4 h-4 rounded-full object-cover border border-white/20" onError={(e) => { 
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none'; 
                          const parent = target.parentElement;
                          if (parent) {
                            const fallback = document.createElement('span');
                            fallback.className = 'text-sm';
                            fallback.textContent = '💼';
                            parent.insertBefore(fallback, target.nextSibling);
                          }
                        }} />
                      ) : (
                        <span className="text-sm">{p.photo && p.photo.length <= 2 ? p.photo : '💼'}</span>
                      )}
                      <span className="font-semibold truncate max-w-[80px]">{p.name}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Decoration Line */}
            <div className={`absolute bottom-0 left-0 right-0 h-1 ${
              t.stageReached === 'Campeón' ? 'bg-gradient-to-r from-amber-400 to-amber-600 dark:to-yellow-600' :
              (t.status === 'activo' ? 'bg-emerald-500' : 'bg-red-500')
            }`}>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Representantes;
