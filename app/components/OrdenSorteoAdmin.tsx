"use client";
import { useState, useMemo } from "react";
import useQuinielaStore from "../store/quiniela";
import {
  ListOrdered,
  Save,
  Users,
  CheckCircle2,
  XCircle,
  ArrowUpDown,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

const TOTAL_POSICIONES = 48;

const OrdenSorteoAdmin = () => {
  const { ordenSorteo, participants, asignarPosicionSorteo, fetchOrdenSorteo } = useQuinielaStore();
  const [saving, setSaving] = useState<number | null>(null);
  const [editandoPosicion, setEditandoPosicion] = useState<number | null>(null);
  const [participanteSeleccionado, setParticipanteSeleccionado] = useState<string>("");

  // Participantes registrados (para el select)
  const participantesList = useMemo(() => {
    return participants.filter(p => (p.drawCount ?? 1) > 0);
  }, [participants]);

  // Posiciones ordenadas 1-48
  const posiciones = useMemo(() => {
    const result: { posicion: number; item: typeof ordenSorteo[0] | undefined }[] = [];
    for (let i = 1; i <= TOTAL_POSICIONES; i++) {
      const item = ordenSorteo.find(o => o.posicion === i);
      result.push({ posicion: i, item });
    }
    return result;
  }, [ordenSorteo]);

  const handleAsignar = async (posicion: number) => {
    if (!participanteSeleccionado) {
      toast.warning("Selecciona un participante primero.");
      return;
    }

    const participante = participants.find(p => p.email === participanteSeleccionado);
    if (!participante) {
      toast.error("Participante no encontrado.");
      return;
    }

    setSaving(posicion);
    await asignarPosicionSorteo(posicion, participante.email, participante.name);
    await fetchOrdenSorteo();
    setSaving(null);
    setEditandoPosicion(null);
    setParticipanteSeleccionado("");
    toast.success(`Posición #${posicion} asignada a ${participante.name}`);
  };

  const handleQuitar = async (posicion: number) => {
    setSaving(posicion);
    // Asignar null para liberar la posición
    await asignarPosicionSorteo(posicion, "", "");
    await fetchOrdenSorteo();
    setSaving(null);
    setEditandoPosicion(null);
    toast.success(`Posición #${posicion} liberada`);
  };

  const iniciarEdicion = (posicion: number, emailActual: string | null) => {
    setEditandoPosicion(posicion);
    setParticipanteSeleccionado(emailActual || "");
  };

  // Contar posiciones ocupadas por cada participante
  const conteoParticipantes = useMemo(() => {
    const conteo: Record<string, number> = {};
    for (const o of ordenSorteo) {
      if (o.participantEmail && o.status === 'pendiente') {
        conteo[o.participantEmail] = (conteo[o.participantEmail] || 0) + 1;
      }
    }
    return conteo;
  }, [ordenSorteo]);

  const posicionesOcupadas = ordenSorteo.filter(o => o.participantEmail).length;
  const posicionesPendientes = ordenSorteo.filter(o => o.status === 'pendiente').length;
  const posicionesCompletadas = ordenSorteo.filter(o => o.status === 'completado').length;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Encabezado */}
      <div className="glass rounded-2xl p-6 sm:p-8 space-y-4 border border-amber-200 dark:border-amber-500/20 bg-white/50 dark:bg-transparent">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-400/30 text-amber-700 dark:text-amber-400 font-bold text-sm mb-2">
            <ListOrdered className="w-4 h-4" />
            ORDEN DE SORTEO
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">
            Gestionar Orden de los 48 Sorteos
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Asigna el orden en que los participantes pasarán al sorteo. Cada posición (1-48) corresponde al turno en que se sortea un equipo.
          </p>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white dark:bg-gray-950/50 rounded-xl p-4 border border-gray-200 dark:border-gray-800 text-center">
            <p className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">{posicionesPendientes}</p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold">Posiciones pendientes</p>
          </div>
          <div className="bg-white dark:bg-gray-950/50 rounded-xl p-4 border border-gray-200 dark:border-gray-800 text-center">
            <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">{posicionesCompletadas}</p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold">Posiciones completadas</p>
          </div>
          <div className="bg-white dark:bg-gray-950/50 rounded-xl p-4 border border-gray-200 dark:border-gray-800 text-center">
            <p className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">{posicionesOcupadas}</p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold">Posiciones ocupadas</p>
          </div>
        </div>
      </div>

      {/* Tabla de posiciones */}
      <div className="glass rounded-2xl p-6 sm:p-8 space-y-6 border border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-transparent">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-amber-500" />
            Tabla de Posiciones de Sorteo
          </h3>
          <span className="text-[10px] text-gray-400 dark:text-gray-500">
            Haz clic en una posición para asignar/modificar
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2">
          {posiciones.map(({ posicion, item }) => {
            const participante = item?.participantEmail
              ? participants.find(p => p.email === item.participantEmail)
              : null;
            const estaEditando = editandoPosicion === posicion;
            const status = item?.status || 'pendiente';
            const isCompletado = status === 'completado';
            const isSaltado = status === 'saltado';

            return (
              <div
                key={posicion}
                className={`
                  rounded-xl border p-3 text-center transition relative
                  ${isCompletado 
                    ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-700/30 opacity-70' 
                    : isSaltado
                      ? 'bg-gray-50 dark:bg-gray-950/30 border-gray-200 dark:border-gray-700/30 opacity-50'
                      : estaEditando
                        ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-400 dark:border-amber-500/50 shadow-lg shadow-amber-500/10'
                        : 'bg-white dark:bg-gray-950/40 border-gray-200 dark:border-gray-800 hover:border-amber-300 dark:hover:border-amber-600/40 cursor-pointer'
                  }
                `}
                onClick={() => {
                  if (!isCompletado && !isSaltado && !estaEditando) {
                    iniciarEdicion(posicion, item?.participantEmail || null);
                  }
                }}
              >
                {/* Número de posición */}
                <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 mb-1">
                  #{posicion}
                </div>

                {/* Participante asignado */}
                {isCompletado ? (
                  <div className="space-y-1">
                    {participante && (
                      <div className="flex items-center justify-center gap-1">
                        {participante.photo && participante.photo.length <= 2 ? (
                          <span className="text-base">{participante.photo}</span>
                        ) : (
                          <span className="text-base">✅</span>
                        )}
                        <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 truncate block">
                          {item?.participantName || participante.name}
                        </span>
                      </div>
                    )}
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[8px] font-bold">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      COMPLETADO
                    </span>
                  </div>
                ) : isSaltado ? (
                  <div className="space-y-1">
                    {participante && (
                      <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 truncate block">
                        {item?.participantName || participante.name}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-[8px] font-bold">
                      <XCircle className="w-2.5 h-2.5" />
                      SALTADO
                    </span>
                  </div>
                ) : estaEditando ? (
                  <div className="space-y-2" onClick={e => e.stopPropagation()}>
                    {/* Select de participantes */}
                    <select
                      value={participanteSeleccionado}
                      onChange={(e) => setParticipanteSeleccionado(e.target.value)}
                      className="w-full text-[9px] bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg px-1.5 py-1 text-gray-900 dark:text-gray-100 focus:border-amber-500 focus:outline-none"
                    >
                      <option value="">-- Sin asignar --</option>
                      {participantesList.map(p => (
                        <option key={p.email} value={p.email}>
                          {p.name} ({conteoParticipantes[p.email] || 0}/{p.drawCount ?? 1})
                        </option>
                      ))}
                    </select>

                    {/* Botones de acción */}
                    <div className="flex gap-1 justify-center">
                      <button
                        onClick={() => handleAsignar(posicion)}
                        disabled={saving === posicion || !participanteSeleccionado}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white text-[8px] font-bold transition"
                      >
                        {saving === posicion ? (
                          <Loader2 className="w-2.5 h-2.5 animate-spin" />
                        ) : (
                          <Save className="w-2.5 h-2.5" />
                        )}
                        Asignar
                      </button>
                      {item?.participantEmail && (
                        <button
                          onClick={() => handleQuitar(posicion)}
                          disabled={saving === posicion}
                          className="flex items-center gap-1 px-2 py-1 rounded-lg bg-red-500 hover:bg-red-400 text-white text-[8px] font-bold transition"
                        >
                          <XCircle className="w-2.5 h-2.5" />
                          Quitar
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setEditandoPosicion(null);
                          setParticipanteSeleccionado("");
                        }}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-[8px] font-bold transition"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {participante ? (
                      <>
                        <div className="flex items-center justify-center gap-1">
                          {participante.photo && participante.photo.length <= 2 ? (
                            <span className="text-base">{participante.photo}</span>
                          ) : participante.photoType === "upload" && participante.photo.startsWith('http') ? (
                            <img src={participante.photo} alt="" className="w-4 h-4 rounded-full object-cover" />
                          ) : (
                            <span className="text-base">👤</span>
                          )}
                          <span className="text-[10px] font-semibold text-gray-800 dark:text-gray-200 truncate block max-w-[80px]">
                            {item?.participantName || participante.name}
                          </span>
                        </div>
                        <span className="text-[8px] text-gray-400 dark:text-gray-500">
                          {conteoParticipantes[participante.email] || 0}/{participante.drawCount ?? 1}
                        </span>
                      </>
                    ) : (
                      <div className="py-2">
                        <span className="text-[9px] text-gray-300 dark:text-gray-600 italic">Vacío</span>
                      </div>
                    )}
                    <span className="text-[8px] text-gray-400 dark:text-gray-500">
                      Click para editar
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Resumen de participantes */}
      <div className="glass rounded-2xl p-6 sm:p-8 space-y-4 border border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-transparent">
        <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
          <Users className="w-4 h-4 text-blue-500" />
          Resumen de Participantes
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {participantesList.map(p => {
            const asignadas = ordenSorteo.filter(o => o.participantEmail === p.email && o.status === 'pendiente').length;
            const completadas = ordenSorteo.filter(o => o.participantEmail === p.email && o.status === 'completado').length;
            const totalDebe = p.drawCount ?? 1;
            const totalAsignadas = asignadas + completadas;
            return (
              <div key={p.email} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-950/40 border border-gray-200 dark:border-gray-800 text-xs">
                {p.photo && p.photo.length <= 2 ? (
                  <span className="text-lg">{p.photo}</span>
                ) : (
                  <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-[10px]">
                    👤
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 dark:text-gray-200 truncate">{p.name}</p>
                  <p className={`text-[9px] ${totalAsignadas >= totalDebe ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                    {totalAsignadas}/{totalDebe} posiciones {totalAsignadas >= totalDebe ? '✅' : '⏳'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default OrdenSorteoAdmin;
