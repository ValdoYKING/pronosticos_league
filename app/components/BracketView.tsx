"use client";
/* eslint-disable @next/next/no-img-element */
import { useRef, useEffect, useState, useCallback } from "react";
import useQuinielaStore from "../store/quiniela";
import { sortMatchesForStage, type Match, type Team } from "../lib/mockData";
import { Crown, Trophy, ChevronRight, Loader2 } from "lucide-react";
import { toast } from "sonner";

// ─── Tipos ────────────────────────────────────────────────
interface ConnectorData {
  key: string;
  x1: number; y1: number; x2: number; y2: number;
  midX: number;
  hasWinner: boolean;
}

// ─── Constantes ───────────────────────────────────────────
const STAGE_LABELS: Record<string, string> = {
  Dieciseisavos: "Dieciseisavos",
  Octavos: "Octavos",
  Cuartos: "Cuartos",
  Semis: "Semifinales",
  Final: "Final",
  TercerLugar: "3er Lugar",
};

const STAGE_COLORS: Record<string, string> = {
  Dieciseisavos: "orange",
  Octavos: "emerald",
  Cuartos: "blue",
  Semis: "purple",
  Final: "amber",
  TercerLugar: "bronze",
};

const ADMIN_EMAILS = [
  "osvaldovm2002@gmail.com",
  "osvaldovillalba-02@hotmail.com",
  "sebasduranarriola@gmail.com",
  "dulce.mg.19@gmail.com",
];

// ─── Componente ───────────────────────────────────────────
const BracketView = () => {
  const { matches, teams, setKnockoutWinner, myRegistration, participants } = useQuinielaStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const [connectors, setConnectors] = useState<ConnectorData[]>([]);
  const [saving, setSaving] = useState<number | null>(null);

  const isAdmin = myRegistration?.email && ADMIN_EMAILS.includes(myRegistration.email.toLowerCase());
  const getTeam = (id: string | null) => teams.find(t => t.id === id);

  // ─── Agrupar matches por stage ──────────────────────────
  const stageMatches = useCallback((stage: string) =>
    sortMatchesForStage(stage, matches.filter(m => m.stage === stage)),
  [matches]);

  const d16 = stageMatches("Dieciseisavos");
  const octavos = stageMatches("Octavos");
  const cuartos = stageMatches("Cuartos");
  const semis = stageMatches("Semis");
  const finalMatch = stageMatches("Final")[0];
  const tercerLugarMatch = stageMatches("TercerLugar")[0];

  // ─── Calcular líneas conectoras SVG ─────────────────────
  const calcConnectors = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const data: ConnectorData[] = [];

    const getCenter = (id: string) => {
      const el = document.getElementById(id);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2 - rect.left, y: r.top + r.height / 2 - rect.top };
    };

    // Helper: conectar dos slots a su padre
    const connectPair = (childAId: number, childBId: number, parentId: number) => {
      const cA = getCenter(`match-${childAId}`);
      const cB = getCenter(`match-${childBId}`);
      const cP = getCenter(`match-${parentId}`);
      if (!cA || !cB || !cP) return;

      const matchA = matches.find(m => m.id === childAId);
      const matchB = matches.find(m => m.id === childBId);

      // Línea de A al punto medio
      const midXA = (cA.x + cP.x) / 2;
      data.push({
        key: `c-${childAId}-${parentId}-a`,
        x1: cA.x, y1: cA.y, x2: midXA, y2: cA.y,
        midX: midXA,
        hasWinner: !!matchA?.winnerId,
      });
      // Línea vertical de A's mid al nivel de parent
      data.push({
        key: `c-${childAId}-${parentId}-av`,
        x1: midXA, y1: cA.y, x2: midXA, y2: cP.y,
        midX: midXA,
        hasWinner: !!matchA?.winnerId,
      });
      // Línea de B al punto medio
      const midXB = (cB.x + cP.x) / 2;
      data.push({
        key: `c-${childBId}-${parentId}-b`,
        x1: cB.x, y1: cB.y, x2: midXB, y2: cB.y,
        midX: midXB,
        hasWinner: !!matchB?.winnerId,
      });
      // Línea vertical de B's mid al nivel de parent
      data.push({
        key: `c-${childBId}-${parentId}-bv`,
        x1: midXB, y1: cB.y, x2: midXB, y2: cP.y,
        midX: midXB,
        hasWinner: !!matchB?.winnerId,
      });
      // Líneas horizontales de mid al parent
      data.push({
        key: `c-${childAId}-${parentId}-ah`,
        x1: midXA, y1: cP.y, x2: cP.x, y2: cP.y,
        midX: (midXA + cP.x) / 2,
        hasWinner: !!matchA?.winnerId || !!matchB?.winnerId,
      });
      data.push({
        key: `c-${childBId}-${parentId}-bh`,
        x1: midXB, y1: cP.y, x2: cP.x, y2: cP.y,
        midX: (midXB + cP.x) / 2,
        hasWinner: !!matchA?.winnerId || !!matchB?.winnerId,
      });
    };

    // Conexiones: D16 → Octavos (pares consecutivos)
    for (let i = 0; i < d16.length && i < octavos.length * 2; i += 2) {
      const octIdx = i / 2;
      if (d16[i] && d16[i + 1] && octavos[octIdx]) {
        connectPair(d16[i].id, d16[i + 1].id, octavos[octIdx].id);
      }
    }

    // Conexiones: Octavos → Cuartos
    for (let i = 0; i < octavos.length && i < cuartos.length * 2; i += 2) {
      const cuIdx = i / 2;
      if (octavos[i] && octavos[i + 1] && cuartos[cuIdx]) {
        connectPair(octavos[i].id, octavos[i + 1].id, cuartos[cuIdx].id);
      }
    }

    // Conexiones: Cuartos → Semis
    for (let i = 0; i < cuartos.length && i < semis.length * 2; i += 2) {
      const semiIdx = i / 2;
      if (cuartos[i] && cuartos[i + 1] && semis[semiIdx]) {
        connectPair(cuartos[i].id, cuartos[i + 1].id, semis[semiIdx].id);
      }
    }

    // Conexiones: Semis → Final
    if (semis[0] && semis[1] && finalMatch) {
      connectPair(semis[0].id, semis[1].id, finalMatch.id);
    }

    // Conexiones: Semis (perdedores) → TercerLugar
    if (semis[0] && semis[1] && tercerLugarMatch) {
      connectPair(semis[0].id, semis[1].id, tercerLugarMatch.id);
    }

    setConnectors(data);
  }, [d16, octavos, cuartos, semis, finalMatch, tercerLugarMatch, matches]);

  // Recalcular conectores después de pintar
  useEffect(() => {
    const timer = setTimeout(calcConnectors, 100);
    return () => clearTimeout(timer);
  }, [calcConnectors]);

  useEffect(() => {
    const onResize = () => calcConnectors();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [calcConnectors]);

  // ─── Seleccionar ganador ────────────────────────────────
  const handleSelectWinner = async (matchId: number, winnerId: string) => {
    if (!isAdmin) {
      toast.error("Solo el administrador puede registrar ganadores");
      return;
    }
    const match = matches.find(m => m.id === matchId);
    if (!match || match.winnerId) return;

    setSaving(matchId);
    try {
      // Usar setKnockoutWinner que ya persiste a Supabase
      setKnockoutWinner(matchId, winnerId);
      // Recalcular conectores después del cambio
      setTimeout(calcConnectors, 150);
    } catch {
      toast.error("Error al guardar el resultado");
    } finally {
      setSaving(null);
    }
  };

  // ─── Render: tarjeta de partido compacta ─────────────────
  const renderMatchCard = (m: Match, compact = false) => {
    const teamA = getTeam(m.teamAId);
    const teamB = getTeam(m.teamBId);
    const hasWinner = !!m.winnerId;
    const isPending = !m.teamAId || !m.teamBId;
    const color = STAGE_COLORS[m.stage] || "gray";
    const isSaving = saving === m.id;

    const borderColor = hasWinner
      ? "border-green-400 dark:border-green-600"
      : `border-${color}-300 dark:border-${color}-700`;

        const renderTeam = (team: Team | undefined, side: "A" | "B") => {
      const isWinner = hasWinner && m.winnerId === m[`team${side}Id` as "teamAId" | "teamBId"];
      const score = m[`score${side}` as "scoreA" | "scoreB"];

      if (!team) {
        return (
          <div className="flex items-center gap-1 px-2 py-1 text-[10px] text-gray-400 italic">
            Por definir
          </div>
        );
      }

      const representative = participants.find(p => p.teamIds.includes(team.id));

      const content = (
        <div
          className={`flex items-center gap-2 px-2 py-1.5 rounded transition-all group ${
            hasWinner
              ? isWinner
                ? "bg-green-100 dark:bg-green-950/40 font-bold text-green-800 dark:text-green-300"
                : "opacity-30 line-through text-gray-500"
              : `hover:bg-${color}-50 dark:hover:bg-${color}-950/20 cursor-pointer text-gray-700 dark:text-gray-300`
          }`}
          onClick={() => {
            if (!hasWinner && isAdmin && m.teamAId && m.teamBId) {
              handleSelectWinner(m.id, team.id);
            }
          }}
          title={!hasWinner && isAdmin ? `Click para seleccionar a ${team.name} como ganador` : undefined}
        >
          <img src={team.flagUrl} alt="" className="w-5 h-3.5 object-cover rounded flex-shrink-0" loading="lazy" />
          <div className="flex-1 truncate">
            <span className="text-[11px] font-semibold truncate block">{team.name}</span>
            {representative && (
              <span className="text-[9px] text-gray-500 dark:text-gray-400 truncate block">{representative.name}</span>
            )}
          </div>
          {isWinner && <Crown className="w-3 h-3 text-yellow-500 flex-shrink-0" />}
          {hasWinner && score !== null && (
            <span className={`text-xs font-extrabold flex-shrink-0 ${isWinner ? "text-green-700 dark:text-green-400" : ""}`}>
              {score}
            </span>
          )}
          {!hasWinner && isAdmin && (
            <span className="text-[9px] text-gray-400 opacity-0 group-hover:opacity-100 flex-shrink-0">Ganador?</span>
          )}
        </div>
      );

      return content;
    };

    return (
      <div
        id={`match-${m.id}`}
        className={`relative bg-white dark:bg-gray-950 rounded-lg border-2 ${borderColor} shadow-sm transition-all ${
          isPending ? "opacity-40" : ""
        } ${hasWinner ? "ring-1 ring-green-300 dark:ring-green-800" : ""} ${
          m.stage === "Final" && hasWinner ? "ring-2 ring-amber-400 animate-pulse" : ""
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-2 pt-1.5 pb-0.5 text-[8px] text-gray-400 font-bold">
          <span className="flex items-center gap-1">
            <span className={`w-1.5 h-1.5 rounded-full bg-${color}-500`} />
            {m.stage === "Dieciseisavos" ? `#${m.id}` : STAGE_LABELS[m.stage]}
          </span>
          {m.date && <span className="truncate ml-1">{m.date}</span>}
        </div>

        {/* Teams */}
        <div className="divide-y divide-gray-100 dark:divide-gray-800/30">
          {renderTeam(teamA, "A")}
          {renderTeam(teamB, "B")}
        </div>

        {/* Saving indicator */}
        {isSaving && (
          <div className="absolute inset-0 bg-white/70 dark:bg-gray-950/70 rounded-lg flex items-center justify-center z-10">
            <Loader2 className="w-5 h-5 animate-spin text-green-500" />
          </div>
        )}

        {/* Winner badge */}
        {hasWinner && m.winnerId && (
          <div className="px-2 pb-1.5 pt-0.5 flex justify-center">
            <span className="text-[7px] uppercase px-2 py-0.5 rounded-full bg-green-500 text-white font-extrabold flex items-center gap-0.5">
              <Crown className="w-2 h-2" />
              {getTeam(m.winnerId)?.name} AVANZA
            </span>
          </div>
        )}

        {/* Champion for Final */}
        {m.stage === "Final" && hasWinner && m.winnerId && (
          <div className="px-2 pb-2 text-center">
            <div className="inline-flex items-center gap-1 text-[10px] font-extrabold text-yellow-500 bg-amber-50 dark:bg-amber-950/50 px-2 py-1 rounded-full border border-amber-300 dark:border-amber-700">
              <Trophy className="w-3 h-3" /> CAMPEÓN
            </div>
          </div>
        )}
      </div>
    );
  };

  // ─── Render: columna de ronda ────────────────────────────
  const renderRoundColumn = (label: string, stageMatches: Match[], showLabel = true) => {
    const color = STAGE_COLORS[label] || "gray";
    const done = stageMatches.filter(m => !!m.winnerId).length;

    return (
      <div className="flex flex-col gap-3" style={{ minWidth: 150, maxWidth: 170 }}>
        {showLabel && (
          <div className={`text-center py-1.5 px-2 rounded-lg bg-${color}-50 dark:bg-${color}-950/30 border border-${color}-200 dark:border-${color}-800`}>
            <div className={`text-[10px] font-extrabold uppercase tracking-wider text-${color}-700 dark:text-${color}-300`}>
              {STAGE_LABELS[label]}
            </div>
            <div className="text-[9px] text-gray-400 font-semibold">
              {done}/{stageMatches.length}
            </div>
          </div>
        )}
        <div className="flex flex-col" style={{ gap: stageMatches.length <= 2 ? 24 : stageMatches.length <= 4 ? 16 : 8 }}>
          {stageMatches.map(m => renderMatchCard(m, stageMatches.length > 4))}
        </div>
      </div>
    );
  };

  // ─── Vista principal del bracket (simétrico) ─────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
            <Trophy className="text-amber-500" /> Cuadro del Campeonato
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {isAdmin
              ? "Haz clic en un equipo para registrarlo como ganador. Resultados se guardan automáticamente."
              : "Visualización de la fase eliminatoria. Líneas verdes = ganador definido."}
          </p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
              <span>{matches.filter(m => m.stage !== "Grupos" && m.winnerId).length}</span>
            </div>
            <span>/</span>
            <span>{matches.filter(m => m.stage !== "Grupos").length}</span>
            <span className="text-[10px]">resueltos</span>
          </div>
        </div>
      </div>

      {/* ─── BRACKET ─────────────────────────────────────── */}
      <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/40 dark:bg-gray-950/40 p-4 sm:p-6">
        <div ref={containerRef} className="relative" style={{ minWidth: 1100, minHeight: 700 }}>
          {/* SVG Connectors Layer */}
          <svg className="absolute inset-0 pointer-events-none" style={{ width: "100%", height: "100%", zIndex: 5 }}>
            {connectors.map(c => (
              <line
                key={c.key}
                x1={c.x1} y1={c.y1} x2={c.x2} y2={c.y2}
                stroke={c.hasWinner ? "#22c55e" : "#9ca3af"}
                strokeWidth={c.hasWinner ? 1.5 : 0.7}
                strokeDasharray={c.hasWinner ? "none" : "3 2"}
                className="transition-all duration-500"
              />
            ))}
          </svg>

          {/* Bracket Grid (z-index above SVG) */}
          <div className="relative flex justify-start gap-2 sm:gap-4" style={{ zIndex: 10, minWidth: 1300 }}>
            {/* ─── LADO IZQUIERDO ─── */}
            <div className="flex gap-1 sm:gap-2">
              {/* D16 Left (matches 1-8) */}
              <div className="flex flex-col justify-around" style={{ gap: 6 }}>
                {d16.slice(0, 8).map(m => (
                  <div key={m.id} style={{ width: 150 }}>{renderMatchCard(m, true)}</div>
                ))}
              </div>

              {/* Octavos Left (matches 1-4) */}
              <div className="flex flex-col justify-around" style={{ gap: 16 }}>
                {octavos.slice(0, 4).map(m => (
                  <div key={m.id} style={{ width: 150 }}>{renderMatchCard(m, true)}</div>
                ))}
              </div>

              {/* Cuartos Left (matches 1-2) */}
              <div className="flex flex-col justify-around" style={{ gap: 48 }}>
                {cuartos.slice(0, 2).map(m => (
                  <div key={m.id} style={{ width: 150 }}>{renderMatchCard(m)}</div>
                ))}
              </div>

              {/* Semis Left (match 1) */}
              <div className="flex items-center">
                {semis[0] && <div style={{ width: 150 }}>{renderMatchCard(semis[0])}</div>}
              </div>
            </div>

            {/* ─── CENTRO: FINAL + TERCER LUGAR ─── */}
            <div className="flex flex-col justify-center gap-8 mx-1 sm:mx-2">
              {/* FINAL */}
              {finalMatch && (
                <div style={{ width: 160 }}>
                  <div className="text-center mb-1">
                    <span className="text-[9px] font-extrabold uppercase tracking-widest text-amber-500 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-700">
                      🏆 FINAL
                    </span>
                  </div>
                  {renderMatchCard(finalMatch)}
                </div>
              )}

              {/* TERCER LUGAR */}
              {tercerLugarMatch && (
                <div style={{ width: 160 }}>
                  <div className="text-center mb-1">
                    <span className="text-[9px] font-extrabold uppercase tracking-widest text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/50 px-2 py-0.5 rounded-full border border-orange-300 dark:border-orange-700">
                      🥉 3ER LUGAR
                    </span>
                  </div>
                  {renderMatchCard(tercerLugarMatch)}
                </div>
              )}
            </div>

            {/* ─── LADO DERECHO ─── */}
            <div className="flex gap-1 sm:gap-2">
              {/* Semis Right (match 2) */}
              <div className="flex items-center">
                {semis[1] && <div style={{ width: 150 }}>{renderMatchCard(semis[1])}</div>}
              </div>

              {/* Cuartos Right (matches 3-4) */}
              <div className="flex flex-col justify-around" style={{ gap: 48 }}>
                {cuartos.slice(2, 4).map(m => (
                  <div key={m.id} style={{ width: 150 }}>{renderMatchCard(m)}</div>
                ))}
              </div>

              {/* Octavos Right (matches 5-8) */}
              <div className="flex flex-col justify-around" style={{ gap: 16 }}>
                {octavos.slice(4, 8).map(m => (
                  <div key={m.id} style={{ width: 150 }}>{renderMatchCard(m, true)}</div>
                ))}
              </div>

              {/* D16 Right (matches 9-16) */}
              <div className="flex flex-col justify-around" style={{ gap: 6 }}>
                {d16.slice(8, 16).map(m => (
                  <div key={m.id} style={{ width: 150 }}>{renderMatchCard(m, true)}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── LEYENDA ─────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-5 text-[10px] text-gray-500 dark:text-gray-400 bg-white/30 dark:bg-gray-950/30 rounded-xl p-3 border border-gray-200 dark:border-gray-800">
        <span className="flex items-center gap-1.5">
          <span className="w-5 h-0.5 bg-green-500 rounded" /> Ganador definido
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-5 h-0.5 bg-gray-400 rounded border-t border-dashed border-gray-400" /> Pendiente
        </span>
        <span className="flex items-center gap-1.5">
          <Crown className="w-3 h-3 text-yellow-500" /> Ganador
        </span>
        <span className="flex items-center gap-1.5">
          <Trophy className="w-3 h-3 text-amber-500" /> Campeón
        </span>
        {isAdmin && (
          <span className="flex items-center gap-1.5 text-green-600 dark:text-green-400 font-semibold">
            🖱️ Click en equipo = registrar ganador
          </span>
        )}
      </div>
    </div>
  );
};

export default BracketView;
