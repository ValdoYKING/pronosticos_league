/* eslint-disable @next/next/no-img-element */
import { useState, useMemo } from "react";
import useQuinielaStore from "../store/quiniela";
import useLoginModalStore from "../store/loginModal";
import { UserPlus, Mail, User, Camera, CheckCircle2, X, LogIn } from "lucide-react";
import { toast } from "sonner";
import { GROUP_LABELS } from "../lib/mockData";
// Nueva función para enviar el correo
const sendWelcomeEmail = async (to: string, userName: string) => {
  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to,
        userName,
        subject: '¡Bienvenido a la Quiniela de la Oficina!',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Algo salió mal al enviar el correo');
    }

    console.log('Correo de bienvenida enviado exitosamente!');
  } catch (error) {
    console.error('Error al enviar el correo de bienvenida:', error);
    // Mostrar el error al usuario para que pueda diagnosticar qué falla
    const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
    toast.error(`No se pudo enviar el correo de bienvenida: ${errorMsg}`);
  }
};

const Register = () => {
  const { myRegistration, deleteMyRegistration, registerUser, teams, participants } =
    useQuinielaStore();
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhotoType, setRegPhotoType] = useState<"avatar" | "upload">("avatar");
  const [regAvatar, setRegAvatar] = useState("💼");
  const [regPhotoBase64, setRegPhotoBase64] = useState("");
  const [regTeamIds, setRegTeamIds] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const { open: openLoginModal } = useLoginModalStore();

  // Detectar si el correo ingresado ya está registrado (para mostrar botón de acceso)
  const emailAlreadyRegistered = useMemo(() => {
    if (!regEmail.trim()) return null;
    const found = participants.find(
      (p) =>
        p.email.toLowerCase() === regEmail.trim().toLowerCase() &&
        p.email !== myRegistration?.email
    );
    return found || null;
  }, [regEmail, participants, myRegistration]);

  // Estados para errores de validación en tiempo real
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");

  const avatares = [
    "💼", "☕", "💻", "📊", "📁", "📈",
    "🍩", "🥑", "🦖", "🦄", "🐱", "🍕",
    "🎮", "🎯", "🎲", "🧠", "👨‍💻", "👩‍💼",
  ];

  // Agrupar equipos por grupo
  const groupedTeams = useMemo(() => {
    const groups: Record<string, typeof teams> = {};
    const groupOrder = ["A","B","C","D","E","F","G","H","I","J","K","L"];
    for (const g of groupOrder) {
      groups[g] = teams.filter(t => t.group === g);
    }
    return groups;
    //670063 
  }, [teams]);

  // Contar representantes por equipo
  const getParticipantCount = (teamId: string) => {
    return participants.filter(p => p.teamIds?.includes(teamId)).length;
  };

  // Validar nombre único (excluyendo mi propio registro si ya existe)
  const validateName = (value: string) => {
    if (!value.trim()) {
      setNameError("");
      return true;
    }
    const exists = participants.some(
      p => p.name.toLowerCase() === value.trim().toLowerCase() && p.email !== myRegistration?.email
    );
    if (exists) {
      setNameError("Este nombre o alias ya está registrado por otra persona.");
      return false;
    }
    setNameError("");
    return true;
  };

  // Validar email único (excluyendo mi propio registro si ya existe)
  const validateEmail = (value: string) => {
    if (!value.trim()) {
      setEmailError("");
      return true;
    }
    const exists = participants.some(
      p => p.email.toLowerCase() === value.trim().toLowerCase() && p.email !== myRegistration?.email
    );
    if (exists) {
      setEmailError("Este correo ya está registrado por otro participante.");
      return false;
    }
    setEmailError("");
    return true;
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.warning("La imagen es muy grande. Máximo 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        setRegPhotoBase64(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar nombre
    if (!regName.trim()) {
      toast.warning("Por favor, ingresa tu nombre o alias.");
      return;
    }
    if (!validateName(regName)) {
      toast.error("Ese nombre o alias ya está ocupado. Elige otro.");
      return;
    }

    // Validar email
    if (!regEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regEmail)) {
      toast.warning("Por favor, ingresa un correo electrónico válido.");
      return;
    }
    if (!validateEmail(regEmail)) {
      toast.error("Ese correo ya está registrado. Si es tuyo, revisa tus datos.");
      return;
    }

    // Validar que haya al menos un equipo seleccionado
    if (regTeamIds.length === 0) {
      toast.warning("Por favor, selecciona al menos un equipo.");
      return;
    }

    setUploading(true);
    const photo = regPhotoType === "avatar" ? regAvatar : regPhotoBase64;
    
    try {
      await registerUser(regName, regEmail, regTeamIds, regPhotoType, photo);
      
      // Enviar correo después del registro exitoso
      await sendWelcomeEmail(regEmail, regName);

    } catch (error) {
      // El error ya se maneja dentro de registerUser, pero por si acaso
      console.error("Error en el proceso de registro:", error);
    } finally {
      setUploading(false);
    }
  };

  // Si ya tiene registro, mostrar el resumen actualizado
  if (myRegistration) {
    const myTeams = (myRegistration.teamIds || [])
      .map(tid => teams.find(t => t.id === tid))
      .filter(Boolean);
    return (
      <div className="space-y-6">
          <div className="max-w-3xl mx-auto">
            <div className="glass rounded-2xl p-6 sm:p-8 space-y-6 border border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-transparent">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">
                ¡Ya estás registrado! 🎉
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Tus datos ya están en la quiniela. Aquí tienes tu resumen:
              </p>
            </div>

            <div className="p-5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/30 flex flex-col sm:flex-row items-center gap-4">
              <div className="flex-shrink-0">
                {myRegistration.photoType === "upload" && myRegistration.photo && myRegistration.photo !== '💼' && myRegistration.photo.startsWith('http') ? (
                  <img
                    key={myRegistration.photo}
                    src={myRegistration.photo}
                    alt="User"
                    className="w-16 h-16 rounded-full object-cover border-2 border-emerald-300 dark:border-emerald-500/40"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      console.warn('[Avatar Error] No se pudo cargar:', target.src);
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        const fallback = document.createElement('div');
                        fallback.className = 'w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-500/20 border-2 border-emerald-300 dark:border-emerald-500/40 flex items-center justify-center text-3xl';
                        fallback.textContent = myRegistration!.photoType === 'avatar' && myRegistration!.photo && myRegistration!.photo.length <= 2 ? myRegistration!.photo : '💼';
                        parent.appendChild(fallback);
                      }
                    }}
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-500/20 border-2 border-emerald-300 dark:border-emerald-500/40 flex items-center justify-center text-3xl">
                    {myRegistration.photo && myRegistration.photo.length <= 2 ? myRegistration.photo : "💼"}
                  </div>
                )}
              </div>
              <div className="text-center sm:text-left space-y-1">
                <p className="text-lg font-extrabold text-gray-900 dark:text-white">
                  {myRegistration.name}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5 justify-center sm:justify-start">
                  <Mail className="w-3.5 h-3.5" /> {myRegistration.email}
                </p>
                <div className="flex flex-wrap gap-1.5 justify-center sm:justify-start">
                  {myTeams.map((t: any) => (
                    <span key={t.id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 text-xs font-semibold border border-amber-200 dark:border-amber-500/20">
                      {t.flag} {t.name}
                      <span className="text-[9px] text-gray-500 dark:text-gray-400 ml-0.5">(Grupo {t.group})</span>
                    </span>
                  ))}
                </div>
                <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full ${
                  myRegistration.status === "activo"
                    ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20"
                    : "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/20"
                }`}>
                  {myRegistration.status === "activo" ? "✅ Sigues vivo en el torneo" : "❌ Eliminado del torneo"}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <button
                onClick={deleteMyRegistration}
                className="px-5 py-2.5 rounded-xl bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/30 hover:bg-red-200 dark:hover:bg-red-900/40 text-sm font-semibold transition flex items-center gap-2"
              >
                Eliminar Mi Registro
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="max-w-5xl mx-auto">
        <div className="glass rounded-2xl p-6 sm:p-8 space-y-8 border border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-transparent">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">
              Registro de Selección de Equipo
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Llena tus datos, selecciona la selección que vas a representar y
              ¡que gane el mejor!
            </p>
          </div>

          {/* Botón de acceso siempre visible */}
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/30 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm text-amber-800 dark:text-amber-300">
              <LogIn className="w-5 h-5 flex-shrink-0" />
              <span>¿Ya te registraste anteriormente? Recupera tu acceso aquí</span>
            </div>
            <button
              type="button"
              onClick={openLoginModal}
              className="px-5 py-2 rounded-xl bg-amber-500 text-white hover:bg-amber-600 dark:hover:bg-amber-400 font-bold text-sm transition flex items-center gap-2 shadow-md shadow-amber-500/20 whitespace-nowrap"
            >
              <LogIn className="w-4 h-4" /> Ingresa a tu quiniela
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* ===== SECCIÓN 1: DATOS PERSONALES ===== */}
            <div className="space-y-5">
              <h3 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 pb-2">
                <User className="w-4 h-4" /> Tus Datos
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Nombre */}
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
                        nameError ? 'border-red-400 dark:border-red-500' : 'border-gray-300 dark:border-gray-800'
                      } focus:border-emerald-500 dark:focus:border-emerald-500 focus:outline-none rounded-xl pl-10 pr-4 py-3 text-sm transition text-gray-900 dark:text-gray-100`}
                      placeholder="Ej. El Licenciado Martínez"
                    />
                    {nameError && (
                      <p className="text-[10px] text-red-500 dark:text-red-400 mt-1">{nameError}</p>
                    )}
                  </div>
                </div>

                {/* Correo Electrónico */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest">
                    Correo Electrónico
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => {
                        setRegEmail(e.target.value);
                        validateEmail(e.target.value);
                      }}
                      className={`w-full bg-white dark:bg-gray-950/60 border ${
                        emailError ? 'border-red-400 dark:border-red-500' : 'border-gray-300 dark:border-gray-800'
                      } focus:border-emerald-500 dark:focus:border-emerald-500 focus:outline-none rounded-xl pl-10 pr-4 py-3 text-sm transition text-gray-900 dark:text-gray-100`}
                      placeholder="ej. correo@oficina.com"
                    />
                    {emailError && (
                      <p className="text-[10px] text-red-500 dark:text-red-400 mt-1">{emailError}</p>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500">
                    Necesario para identificar tu registro.
                  </p>

                  {/* Botón de acceso para correo ya registrado */}
                  {emailAlreadyRegistered && (
                    <div className="mt-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/30">
                      <p className="text-xs text-emerald-700 dark:text-emerald-300 font-semibold mb-2">
                        ✨ Este correo ya está registrado por <strong>{emailAlreadyRegistered.name}</strong>
                      </p>
                      <button
                        type="button"
                        onClick={openLoginModal}
                        className="w-full py-2.5 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 dark:hover:bg-emerald-400 font-bold text-sm transition flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20"
                      >
                        <LogIn className="w-4 h-4" /> Ya seleccionaste equipo, ingresa aquí
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ===== SECCIÓN 2: FOTO / AVATAR ===== */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 pb-2">
                <Camera className="w-4 h-4" /> Foto de Representante (Opcional)
              </h3>

              <div className="flex gap-4">
                <label className="inline-flex items-center gap-1.5 text-xs text-gray-700 dark:text-gray-300 cursor-pointer">
                  <input
                    type="radio"
                    checked={regPhotoType === "avatar"}
                    onChange={() => setRegPhotoType("avatar")}
                    className="text-emerald-500 focus:ring-emerald-500 bg-white dark:bg-gray-950 border-gray-300 dark:border-gray-800"
                  />
                  <span>Elegir Avatar Divertido</span>
                </label>
                <label className="inline-flex items-center gap-1.5 text-xs text-gray-700 dark:text-gray-300 cursor-pointer">
                  <input
                    type="radio"
                    checked={regPhotoType === "upload"}
                    onChange={() => setRegPhotoType("upload")}
                    className="text-emerald-500 focus:ring-emerald-500 bg-white dark:bg-gray-950 border-gray-300 dark:border-gray-800"
                  />
                  <span>Subir mi propia Foto</span>
                </label>
              </div>

              {regPhotoType === "avatar" && (
                <div className="flex flex-wrap gap-2 p-3 bg-gray-50 dark:bg-gray-950/40 rounded-xl border border-gray-200 dark:border-gray-800/80">
                  {avatares.map(av => (
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

              {regPhotoType === "upload" && (
                <div className="p-4 bg-gray-50 dark:bg-gray-950/40 rounded-xl border border-gray-200 dark:border-gray-800/80 space-y-3">
                  <input
                    type="file"
                    onChange={handlePhotoUpload}
                    accept="image/*"
                    className="text-xs text-gray-600 dark:text-gray-400 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-gray-200 dark:file:bg-gray-800 file:text-gray-700 dark:file:text-gray-300 hover:file:bg-gray-300 dark:hover:file:bg-gray-700"
                  />
                  <p className="text-[10px] text-gray-400 dark:text-gray-500">
                    Máximo 2MB. Formatos: JPG, PNG, GIF.
                  </p>
                  {regPhotoBase64 && (
                    <div className="flex items-center gap-2">
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400">✓ Vista previa:</p>
                      <img
                        src={regPhotoBase64}
                        alt="Preview"
                        className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ===== SECCIÓN 3: SELECCIÓN DE EQUIPO POR GRUPOS (MINI TABLAS) ===== */}
            <div className="space-y-5">
              <h3 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 pb-2">
                Selecciona tu Equipo Mundialista
              </h3>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 italic">
                Cada equipo puede tener uno o varios representantes.
                Elige con sabiduría... o según tu equipo favorito. ¡Tú decides!
              </p>

              {/* Equipos seleccionados (chips) */}
              {regTeamIds.length > 0 && (
                <div className="flex flex-wrap gap-2 p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800/30">
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider self-center mr-1">
                    Tus equipos ({regTeamIds.length}):
                  </span>
                  {regTeamIds.map(tid => {
                    const tm = teams.find(t => t.id === tid);
                    return tm ? (
                      <span key={tid} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs font-semibold border border-emerald-200 dark:border-emerald-500/20">
                        <img src={tm.flagUrl} alt={tm.name} className="w-4 h-3 object-cover rounded" />
                        {tm.name}
                        <button
                          type="button"
                          onClick={() => setRegTeamIds(prev => prev.filter(id => id !== tid))}
                          className="ml-0.5 hover:bg-emerald-200 dark:hover:bg-emerald-500/20 rounded-full p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ) : null;
                  })}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {Object.entries(groupedTeams).map(([group, groupTeams]) => (
                  <div
                    key={group}
                    className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-950/30"
                  >
                    {/* Cabecera del Grupo */}
                    <div className="bg-gradient-to-r from-emerald-500/10 to-emerald-600/5 dark:from-emerald-500/10 dark:to-transparent px-3 py-2 border-b border-gray-200 dark:border-gray-800">
                      <span className="text-xs font-extrabold text-emerald-700 dark:text-emerald-400 tracking-wider">
                        {GROUP_LABELS[group] || `Grupo ${group}`}
                      </span>
                    </div>

                    {/* Equipos del Grupo */}
                    <div className="divide-y divide-gray-100 dark:divide-gray-800/50">
                      {groupTeams.map((team) => {
                        const count = getParticipantCount(team.id);
                        const isSelected = regTeamIds.includes(team.id);
                        return (
                          <button
                            key={team.id}
                            type="button"
                            onClick={() => {
                              setRegTeamIds(prev =>
                                isSelected
                                  ? prev.filter(id => id !== team.id)
                                  : [...prev, team.id]
                              );
                            }}
                            className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition text-xs ${
                              isSelected
                                ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 font-bold"
                                : "hover:bg-gray-50 dark:hover:bg-gray-900/50 text-gray-700 dark:text-gray-300"
                            }`}
                          >
                            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                              isSelected
                                ? 'bg-emerald-500 border-emerald-500'
                                : 'border-gray-300 dark:border-gray-600'
                            }`}>
                              {isSelected && (
                                <CheckCircle2 className="w-3 h-3 text-white" />
                              )}
                            </div>
                            <img
                              src={team.flagUrl}
                              alt={team.name}
                              className="w-5 h-3.5 object-cover rounded shadow-sm flex-shrink-0"
                              loading="lazy"
                            />
                            <span className="flex-1 truncate">{team.name}</span>
                            {count > 0 && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 font-semibold flex-shrink-0">
                                {count}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ===== BOTÓN DE REGISTRO ===== */}
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
                    <UserPlus className="w-5 h-5" /> Confirmar Mi Registro en la Quiniela
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
