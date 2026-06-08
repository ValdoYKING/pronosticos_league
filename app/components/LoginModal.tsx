"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { Mail, KeyRound, LogIn, ArrowLeft, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import useQuinielaStore from "../store/quiniela";
import useLoginModalStore from "../store/loginModal";
import { toast } from "sonner";

// Componente global que mantiene su propio estado y NO depende de Register
const LoginModalInner = ({ onClose }: { onClose: () => void }) => {
  const { sendAccessCode, verifyAccessCode, loading } = useQuinielaStore();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [step, setStep] = useState<"email" | "code">("email");
  const [emailError, setEmailError] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (step === "code") {
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [step]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && loading) {
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [loading]);

  const handleSendCode = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEmailError("");

    if (!email.trim()) {
      setEmailError("Ingresa tu correo electrónico");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Correo electrónico no válido");
      return;
    }

    try {
      const exists = await sendAccessCode(email.trim().toLowerCase());
      if (exists) {
        setStep("code");
      }
    } catch (error) {
      console.error("[LoginModal] Error inesperado al enviar código:", error);
      toast.error("Ocurrió un error inesperado. Intenta de nuevo.");
    }
  };

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) {
      const digits = value.replace(/\D/g, "").split("").slice(0, 6);
      const newCode = [...code];
      digits.forEach((digit, i) => {
        if (i < 6) newCode[i] = digit;
      });
      setCode(newCode);
      const lastIndex = Math.min(digits.length, 5);
      inputRefs.current[lastIndex]?.focus();
      return;
    }

    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "Enter") {
      handleVerifyCode();
    }
  };

  const handleVerifyCode = async () => {
    const fullCode = code.join("");
    if (fullCode.length !== 6) {
      toast.warning("Ingresa el código completo de 6 dígitos");
      return;
    }

    const success = await verifyAccessCode(email.trim().toLowerCase(), fullCode);
    if (success) {
      toast.success("¡Acceso verificado! Bienvenido de vuelta.");
      onClose();
    }
  };

  const handleReset = () => {
    setStep("email");
    setCode(["", "", "", "", "", ""]);
    setEmailError("");
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
                  {step === "email"
                    ? "Ingresa tu correo para recibir un código"
                    : "Revisa tu bandeja de entrada"}
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
          {step === "email" ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest">
                  Correo Electrónico Registrado
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setEmailError("");
                    }}
                    placeholder="ej. correo@oficina.com"
                    className={`w-full bg-white dark:bg-gray-950/60 border ${
                      emailError ? "border-red-400 dark:border-red-500" : "border-gray-300 dark:border-gray-800"
                    } focus:border-emerald-500 dark:focus:border-emerald-500 focus:outline-none rounded-xl pl-10 pr-4 py-3 text-sm transition text-gray-900 dark:text-gray-100`}
                  />
                </div>
                {emailError && (
                  <p className="text-[10px] text-red-500 dark:text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {emailError}
                  </p>
                )}
                <p className="text-[10px] text-gray-400 dark:text-gray-500">
                  Debe ser el mismo correo que usaste al registrarte.
                </p>
                <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/30">
                  <p className="text-[10px] text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                    <span className="text-xs">📧</span>
                    <span>Recibirás un correo electrónico con tu código de acceso de 6 dígitos.</span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => handleSendCode(e)}
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 font-bold shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Enviando código...
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    Enviar Código de Acceso
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center">
                  <Mail className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Hemos enviado un código de <strong>6 dígitos</strong> a:
                </p>
                <p className="font-bold text-base text-emerald-600 dark:text-emerald-400">
                  {email}
                </p>
                <p className="text-[10px] text-gray-400 dark:text-gray-500">
                  Si no ves el correo, revisa tu bandeja de spam.
                </p>
              </div>

              <div className="flex justify-center gap-2">
                {code.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className={`w-11 h-12 sm:w-12 sm:h-14 text-center text-xl font-extrabold bg-white dark:bg-gray-950/60 border-2 rounded-xl transition-all ${
                      digit
                        ? "border-emerald-500 dark:border-emerald-500 shadow-md shadow-emerald-500/10"
                        : "border-gray-300 dark:border-gray-700"
                    } focus:border-emerald-500 dark:focus:border-emerald-500 focus:outline-none text-gray-900 dark:text-gray-100`}
                  />
                ))}
              </div>

              <div className="space-y-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleVerifyCode();
                  }}
                  disabled={loading || code.join("").length !== 6}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 font-bold shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Verificando código...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Verificar Código y Acceder
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReset();
                  }}
                  className="w-full py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 font-semibold transition flex items-center justify-center gap-2 text-sm border border-gray-200 dark:border-gray-700"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Cambiar correo
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={async (e) => {
                      e.stopPropagation();
                      setCode(["", "", "", "", "", ""]);
                      try {
                        await sendAccessCode(email);
                      } catch (error) {
                        console.error("[LoginModal] Error al reenviar código:", error);
                      }
                    }}
                    className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Reenviando..." : "¿No recibiste el código? Reenviar"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-950/50 border-t border-gray-200 dark:border-gray-800">
          <p className="text-[10px] text-gray-400 dark:text-gray-500 text-center">
            Este acceso es para participantes ya registrados. Si aún no te has registrado, vuelve a la pestaña &quot;Registrarme&quot;.
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
