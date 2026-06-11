/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import useQuinielaStore from "../store/quiniela";
import {
  UserPlus,
  User,
  Camera,
  ShieldAlert,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

const ADMIN_EMAILS = [
  "osvaldovm2002@gmail.com",
  "osvaldovillalba-02@hotmail.com",
];

const Register = () => {
  const {
    myRegistration,
    deleteMyRegistration,
    registerUserWithoutTeams,
    participants,
    teams,
  } = useQuinielaStore();
  const [regName, setRegName] = useState("");
  const [regDrawCount, setRegDrawCount] = useState(1);
  const [regPhotoType, setRegPhotoType] = useState<"avatar" | "flag">("avatar");
  const [regAvatar, setRegAvatar] = useState("💼");
  const [regFlagAvatar, setRegFlagAvatar] = useState("");
  const [uploading, setUploading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Estados para errores de validación en tiempo real
  const [nameError, setNameError] = useState("");

  const avatares = [
    "🇦🇷", // Argentina
    "🇦🇺", // Australia
    "🇦🇹", // Austria
    "🇧🇪", // Bélgica
    "🇧🇷", // Brasil
    "🇨🇦", // Canadá
    "🇨🇱", // Chile
    "🇨🇴", // Colombia
    "🇨🇷", // Costa Rica
    "🇨🇭", // Suiza
    "🇩🇰", // Dinamarca
    "🇪🇨", // Ecuador
    "🇪🇬", // Egipto
    "🇪🇸", // España
    "🇺🇸", // Estados Unidos
    "🇫🇷", // Francia
    "🇩🇪", // Alemania
    "🇬🇭", // Ghana
    "🇬🇷", // Grecia
    "🇭🇳", // Honduras
    "🇮🇹", // Italia
    "🇯🇵", // Japón
    "🇰🇷", // Corea del Sur
    "🇲🇽", // México
    "🇳🇱", // Países Bajos
    "🇳🇬", // Nigeria
    "🇵🇦", // Panamá
    "🇵🇪", // Perú
    "🇵🇹", // Portugal
    "🇶🇦", // Qatar
    "🇷🇺", // Rusia
    "🇸🇦", // Arabia Saudita
    "🇸🇳", // Senegal
    "🇷🇸", // Serbia
    "🇸🇪", // Suecia
    "🇹🇳", // Túnez
    "🇹🇷", // Turquía
    "🇺🇾", // Uruguay
    "🇻🇪", // Venezuela
    "🇲🇦", // Marruecos
    "🇨🇿", // República Checa
    "🇵🇱", // Polonia
    "🇨🇲", // Camerún
    "🇭🇷", // Croacia
    "🇮🇳", // India
    "🇨🇳", // China
    "🇿🇦", // Sudáfrica
  ];

  // Validar nombre único
  const validateName = (value: string) => {
    if (!value.trim()) {
      setNameError("");
      return true;
    }
    const exists = participants.some(
      (p) => p.name.toLowerCase() === value.trim().toLowerCase(),
    );
    if (exists) {
      setNameError("Este nombre o alias ya está registrado por otra persona.");
      return false;
    }
    setNameError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!regName.trim()) {
      toast.warning("Por favor, ingresa el nombre o alias del participante.");
      return;
    }
    if (!validateName(regName)) {
      toast.error("Ese nombre o alias ya está ocupado. Elige otro.");
      return;
    }

    setUploading(true);

    let finalPhotoType: "avatar" | "upload" = "avatar";
    let finalPhoto = regAvatar;

    if (regPhotoType === "flag" && regFlagAvatar) {
      finalPhotoType = "upload";
      finalPhoto = regFlagAvatar;
    }

    const emailBase = regName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "_");
    const generatedEmail = `${emailBase}@quiniela.internal`;

    try {
      await registerUserWithoutTeams(
        regName,
        generatedEmail,
        finalPhotoType,
        finalPhoto,
        regDrawCount,
      );

      setRegName("");
      setRegAvatar("💼");
      setRegFlagAvatar("");
      setRegPhotoType("avatar");
      setRegDrawCount(1);
      toast.success(
        `¡${regName} ha sido registrado! Le tocarán ${regDrawCount} equipo(s) en el Sorteo.`,
      );
    } catch (error) {
      console.error("Error en el proceso de registro:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* ============================================ */}
        {/* FORMULARIO DE REGISTRO (siempre visible) */}
        {/* ============================================ */}
        <div className="glass rounded-2xl p-6 sm:p-8 space-y-8 border border-amber-200 dark:border-amber-500/20 bg-white/50 dark:bg-transparent">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-semibold mb-2 border border-amber-200 dark:border-amber-500/20">
              <ShieldAlert className="w-3.5 h-3.5" />
              Solo Administrador
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">
              Registro de Nuevo Participante
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Crea un nuevo participante. Después, ve al <strong>Sorteo</strong>{" "}
              para asignarle su(s) equipo(s).
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* SECCIÓN 1: DATOS DEL PARTICIPANTE */}
            <div className="space-y-5">
              <h3 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 pb-2">
                <User className="w-4 h-4" /> Datos del Participante
              </h3>

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest">
                    Nombre o Alias
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={regName}
                      onChange={(e) => {
                        setRegName(e.target.value);
                        validateName(e.target.value);
                      }}
                      className={`w-full bg-white dark:bg-gray-950/60 border ${
                        nameError
                          ? "border-red-400 dark:border-red-500"
                          : "border-gray-300 dark:border-gray-800"
                      } focus:border-emerald-500 dark:focus:border-emerald-500 focus:outline-none rounded-xl pl-10 pr-4 py-3 text-sm transition text-gray-900 dark:text-gray-100`}
                      placeholder="Ej. El Licenciado Martínez"
                    />
                    {                    nameError && (
                      <p className="text-[10px] text-red-500 dark:text-red-400 mt-1">
                        {nameError}
                      </p>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500">
                    Nombre único que identificará al participante en la
                    quiniela.
                  </p>
                </div>

                {/* CAMPO: Cantidad de Sorteos */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest">
                    Cantidad de Sorteos
                  </label>
                  <div className="relative">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setRegDrawCount(Math.max(1, regDrawCount - 1))}
                        className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition font-bold text-lg"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        min="1"
                        max="48"
                        value={regDrawCount}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          if (!isNaN(val) && val >= 1 && val <= 48) {
                            setRegDrawCount(val);
                          }
                        }}
                        className="w-20 text-center bg-white dark:bg-gray-950/60 border border-gray-300 dark:border-gray-800 focus:border-emerald-500 dark:focus:border-emerald-500 focus:outline-none rounded-xl py-3 text-sm font-bold text-gray-900 dark:text-gray-100 transition"
                      />
                      <button
                        type="button"
                        onClick={() => setRegDrawCount(Math.min(48, regDrawCount + 1))}
                        className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition font-bold text-lg"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500">
                    Número de equipos que recibirá este participante en el sorteo.
                    {regDrawCount > 1 ? ` (será sorteado ${regDrawCount} veces)` : ' (será sorteado 1 vez)'}
                  </p>
                </div>
              </div>
            </div>

            {/* SECCIÓN 2: AVATAR */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 pb-2">
                <Camera className="w-4 h-4" /> Avatar del Participante
              </h3>

              <div className="flex gap-4">
                <label className="inline-flex items-center gap-1.5 text-xs text-gray-700 dark:text-gray-300 cursor-pointer">
                  <input
                    type="radio"
                    checked={regPhotoType === "avatar"}
                    onChange={() => setRegPhotoType("avatar")}
                    className="text-emerald-500 focus:ring-emerald-500 bg-white dark:bg-gray-950 border-gray-300 dark:border-gray-800"
                  />
                  <span>Avatar Divertido</span>
                </label>
                <label className="inline-flex items-center gap-1.5 text-xs text-gray-700 dark:text-gray-300 cursor-pointer">
                  <input
                    type="radio"
                    checked={regPhotoType === "flag"}
                    onChange={() => setRegPhotoType("flag")}
                    className="text-emerald-500 focus:ring-emerald-500 bg-white dark:bg-gray-950 border-gray-300 dark:border-gray-800"
                  />
                  <span>Bandera de País</span>
                </label>
              </div>

              {regPhotoType === "avatar" && (
                <div className="flex flex-wrap gap-2 p-3 bg-gray-50 dark:bg-gray-950/40 rounded-xl border border-gray-200 dark:border-gray-800/80">
                  {avatares.map((av) => (
                    <button
                      key={av}
                      type="button"
                      onClick={() => setRegAvatar(av)}
                      className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition ${
                        regAvatar === av
                          ? "bg-emerald-100 dark:bg-emerald-500/20 border border-emerald-500 shadow-md scale-110"
                          : "bg-white dark:bg-gray-800/40 border border-gray-200 dark:border-transparent hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                    >
                      <span>{av}</span>
                    </button>
                  ))}
                </div>
              )}

              {regPhotoType === "flag" && (
                <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-950/40 rounded-xl border border-gray-200 dark:border-gray-800/80">
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">
                    Selecciona la bandera del país que servirá como avatar del
                    participante:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {teams.map((team) => (
                      <button
                        key={team.id}
                        type="button"
                        onClick={() => setRegFlagAvatar(team.flagUrl)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition border ${
                          regFlagAvatar === team.flagUrl
                            ? "bg-emerald-100 dark:bg-emerald-500/20 border-emerald-500 shadow-md scale-105 text-emerald-700 dark:text-emerald-300"
                            : "bg-white dark:bg-gray-800/40 border-gray-200 dark:border-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        <img
                          src={team.flagUrl}
                          alt={team.name}
                          className="w-5 h-3.5 object-cover rounded"
                        />
                        <span>{team.name}</span>
                      </button>
                    ))}
                  </div>
                  {regFlagAvatar && (
                    <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400">
                      <span>✓ Avatar seleccionado:</span>
                      <img
                        src={regFlagAvatar}
                        alt="Flag avatar"
                        className="w-6 h-4 object-cover rounded border border-emerald-400"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* BOTÓN DE REGISTRO */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={uploading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 dark:text-white font-extrabold shadow-xl shadow-emerald-500/10 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Registrando...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5" /> Registrar Nuevo
                    Participante
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* ============================================ */}
        {/* LISTA DE PARTICIPANTES YA REGISTRADOS */}
        {/* ============================================ */}
        <div className="glass rounded-2xl p-6 sm:p-8 space-y-6 border border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-transparent">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                Participantes Registrados
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Total: {participants.length} participantes —{" "}
                {
                  participants.filter(
                    (p) => !p.teamIds || p.teamIds.length === 0,
                  ).length
                }{" "}
                sin equipo
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {participants.length === 0 ? (
              <div className="col-span-full text-center py-6">
                <p className="text-sm text-gray-400 dark:text-gray-500 italic">
                  Aún no hay participantes registrados. ¡Usa el formulario de
                  arriba para agregar el primero!
                </p>
              </div>
            ) : (
              participants.map((p) => {
                const teamNames = (p.teamIds || [])
                  .map((tid) => teams.find((t) => t.id === tid))
                  .filter(Boolean);
                return (
                  <div
                    key={p.email}
                    className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-950/40 border border-gray-200 dark:border-gray-800 transition hover:border-emerald-300 dark:hover:border-emerald-700/30"
                  >
                    {/* Avatar */}
                    {p.photoType === "upload" &&
                    p.photo &&
                    p.photo !== "💼" &&
                    p.photo.startsWith("http") ? (
                      <img
                        src={p.photo}
                        alt=""
                        className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-500/10 border-2 border-gray-200 dark:border-gray-700 flex items-center justify-center text-lg">
                        {p.photo && p.photo.length <= 2 ? p.photo : "💼"}
                      </div>
                    )}
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">
                        {p.name}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-0.5">
                        {teamNames.length > 0 ? (
                          teamNames.map((t: any) => (
                            <span
                              key={t.id}
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-500/5 text-[9px] font-semibold text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/10"
                            >
                              <img
                                src={t.flagUrl}
                                alt=""
                                className="w-3 h-2 object-cover rounded"
                              />
                              {t.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-[9px] text-gray-400 dark:text-gray-500 italic">
                            Sin equipo
                          </span>
                        )}
                      </div>
                    </div>
                    {/* Badge estado */}
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap ${
                        p.status === "activo"
                          ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20"
                          : "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/20"
                      }`}
                    >
                      {p.status === "activo" ? "Vivo" : "Eliminado"}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ============================================ */}
        {/* MI REGISTRO (si el admin también es participante) */}
        {/* ============================================ */}
        {myRegistration && (
          <div className="glass rounded-2xl p-6 sm:p-8 space-y-6 border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50/30 dark:bg-emerald-950/20">
            <div className="text-center space-y-2">
              <h2 className="text-xl font-extrabold text-emerald-700 dark:text-emerald-400">
                🎯 Tu Registro Personal
              </h2>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Este es tu registro en la quiniela como participante.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-white dark:bg-gray-950/40 border border-emerald-200 dark:border-emerald-500/30 flex flex-col sm:flex-row items-center gap-4">
              <div className="flex-shrink-0">
                {myRegistration.photoType === "upload" &&
                myRegistration.photo &&
                myRegistration.photo !== "💼" &&
                myRegistration.photo.startsWith("https") ? (
                  <img
                    src={myRegistration.photo}
                    alt="User"
                    className="w-16 h-16 rounded-full object-cover border-2 border-emerald-300 dark:border-emerald-500/40"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-500/20 border-2 border-emerald-300 dark:border-emerald-500/40 flex items-center justify-center text-3xl">
                    {myRegistration.photo && myRegistration.photo.length <= 2
                      ? myRegistration.photo
                      : "💼"}
                  </div>
                )}
              </div>
              <div className="text-center sm:text-left space-y-1">
                <p className="text-lg font-extrabold text-gray-900 dark:text-white">
                  {myRegistration.name}
                </p>
                <div className="flex flex-wrap gap-1.5 justify-center sm:justify-start">
                  {(myRegistration.teamIds || []).map((tid) => {
                    const t = teams.find((team) => team.id === tid);
                    return t ? (
                      <span
                        key={t.id}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 text-xs font-semibold border border-amber-200 dark:border-amber-500/20"
                      >
                        <img
                          src={t.flagUrl}
                          alt=""
                          className="w-4 h-3 object-cover rounded"
                        />
                        {t.name}
                        <span className="text-[9px] text-gray-500 dark:text-gray-400 ml-0.5">
                          (Grupo {t.group})
                        </span>
                      </span>
                    ) : null;
                  })}
                  {(!myRegistration.teamIds ||
                    myRegistration.teamIds.length === 0) && (
                    <span className="text-xs text-gray-400 dark:text-gray-500 italic">
                      Sin equipo asignado aún
                    </span>
                  )}
                </div>
                <span
                  className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full ${
                    myRegistration.status === "activo"
                      ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20"
                      : "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/20"
                  }`}
                >
                  {myRegistration.status === "activo"
                    ? "✅ Sigues vivo en el torneo"
                    : "❌ Eliminado del torneo"}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-3">
              {!confirmDelete ? (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="px-5 py-2.5 rounded-xl bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/30 hover:bg-red-200 dark:hover:bg-red-900/40 text-sm font-semibold transition flex items-center gap-2"
                >
                  Eliminar Mi Registro
                </button>
              ) : (
                <div className="flex flex-col sm:flex-row items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-500/30">
                  <span className="text-xs font-bold text-red-700 dark:text-red-400 whitespace-nowrap">
                    ¿Eliminar definitivamente?
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setConfirmDelete(false);
                        deleteMyRegistration();
                      }}
                      className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition"
                    >
                      Sí, eliminar
                    </button>
                    <button
                      onClick={() => setConfirmDelete(false)}
                      className="px-4 py-1.5 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 text-xs font-semibold transition"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Register;
