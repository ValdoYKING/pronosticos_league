"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { User, KeyRound, LogIn, ArrowLeft, CheckCircle, Loader2, AlertCircle, Search } from "lucide-react";
import useQuinielaStore from "../store/quiniela";
import useLoginModalStore from "../store/loginModal";
import { toast } from "sonner";

// Componente global que mantiene su propio estado y NO depende de Register
const LoginModalInner = ({ onClose }: { onClose: () => void }) => {
  const { participants, verifyAccessByName, loading } = useQuinielaStore();
  const [name, setName] = useState("");
  const [step, setStep] = useState<"name" | "verify">("name");
  const [nameError, setNameError] = useState("");
  const [mounted, setMounted] = useState(false);
  const [participantFound, setParticipantFound] = useState<any>(null);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && loading) {
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [loading]);

  // Búsqueda de participantes mientras escribe
  useEffect(() => {
    if (name.trim().length > 0) {
      const filtered = participants.filter(p =>
        p.name.toLowerCase().includes(name.trim().toLowerCase())
      );
      setSuggestions(filtered.slice(0, 5));
      setShowSuggestions(filtered.length > 0 && step === "name");
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [name, participants, step]);

  const handleSearchParticipant = async () => {
    setNameError("");

    if (!name.trim()) {
      setNameError("Ingresa el nombre con el que te registraste");
      return;
    }

    // Buscar el participante por nombre
    const found = participants.find(p => p.name.toLowerCase() === name.trim().toLowerCase());

    if (!found) {
      setNameError("No encontramos ese nombre en la quiniela. ¿Estás registrado?");
      return;
    }

    setParticipantFound(found);

    // Acceso directo: verificar y cargar el participante
    const success = await verifyAccessByName(found.email);
    if (success) {
      toast.success(`¡Bienvenido de vuelta, ${found.name}!`);
      onClose();
    }
  };

  const handleSelectSuggestion = (p: any) => {
    setName(p.name);
    setShowSuggestions(false);
    setParticipantFound(p);
  };

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={loading ? undefined : onClose}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-md glass rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <LogIn className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-gray-900 dark:text-white">
                  Acceso a tu Quiniela
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Ingresa tu nombre para acceder
                </p>
              </div>
            </div>
            <button
              onClick={loading ? undefined : onClose}
              className={`p-1.5 rounded-lg transition ${
                loading
                  ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
              disabled={loading}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-5">
          {step === "name" ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest">
                  Tu Nombre o Alias
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setNameError("");
                    }}
                    onFocus={() => {
                      if (suggestions.length > 0) setShowSuggestions(true);
                    }}
                    onBlur={() => {
                      setTimeout(() => setShowSuggestions(false), 200);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSearchParticipant();
                    }}
                    placeholder="Ej. El Licenciado Martínez"
                    className={`w-full bg-white dark:bg-gray-950/60 border ${
                      nameError ? "border-red-400 dark:border-red-500" : "border-gray-300 dark:border-gray-800"
                    } focus:border-emerald-500 dark:focus:border-emerald-500 focus:outline-none rounded-xl pl-10 pr-4 py-3 text-sm transition text-gray-900 dark:text-gray-100`}
                  />

                  {/* Sugerencias de autocompletado */}
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden">
                      {suggestions.map(p => (
                        <button
                          key={p.email}
                          type="button"
                          onMouseDown={() => handleSelectSuggestion(p)}
                          className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-left hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition border-b border-gray-100 dark:border-gray-800 last:border-0"
                        >
                          {p.photoType === 'upload' && p.photo && p.photo !== '💼' && p.photo.startsWith('http') ? (
                            <img src={p.photo} alt="" className="w-6 h-6 rounded-full object-cover" />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center text-sm">
                              {p.photo && p.photo.length <= 2 ? p.photo : '💼'}
                            </div>
                          )}
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900 dark:text-gray-100">{p.name}</p>
                            <p className="text-[9px] text-gray-400">
                              {(p.teamIds || []).map((tid: string) => {
                                const team = participants[0] ? null : null; // placeholder
                                return null;
                              }).filter(Boolean).join(', ') || 'Participante'}
                            </p>
                          </div>
                          <LogIn className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {nameError && (
                  <p className="text-[10px] text-red-500 dark:text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {nameError}
                  </p>
                )}
                <p className="text-[10px] text-gray-400 dark:text-gray-500">
                  Debe ser el mismo nombre o alias que usaste al registrarte.
                </p>
                <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/30">
                  <p className="text-[10px] text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    <span>Busca tu nombre y accede directamente a tu quiniela.</span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSearchParticipant}
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 font-bold shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Buscando...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Buscar y Acceder
                  </>
                )}
              </button>
            </div>
          ) : (
            /* Este step ya no se usa, pero se mantiene por compatibilidad */
            null
          )}
        </div>

        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-950/50 border-t border-gray-200 dark:border-gray-800">
          <p className="text-[10px] text-gray-400 dark:text-gray-500 text-center">
            Si no encuentras tu nombre, contacta al administrador para registrarte.
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
};

const LoginModal = () => {
  const { isOpen, close } = useLoginModalStore();

  if (!isOpen) return null;

  return <LoginModalInner onClose={close} />;
};

export default LoginModal;

