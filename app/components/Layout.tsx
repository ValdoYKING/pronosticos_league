/* eslint-disable @next/next/no-img-element */
import {
  Trophy,
  Calendar,
  UserPlus,
  Users,
  ShieldAlert,
  Dices,
  LogOut,
  Swords,
} from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { useMemo, useState, useEffect } from "react";
import useLoginModalStore from "../store/loginModal";
import useQuinielaStore from "../store/quiniela";
import { toast } from "sonner";

// 📧 Correos autorizados para ver la Consola Admin
const ADMIN_EMAILS = [
  "osvaldovm2002@gmail.com",
  "osvaldovillalba-02@hotmail.com",
  "sebasduranarriola@gmail.com",
  "dulce.mg.19@gmail.com"
];

import type { Team } from "../lib/mockData";

interface LayoutProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  myRegistration: { email?: string; name?: string; photoType?: string; photo?: string; status?: string; teamIds?: string[] } | null;
  getTeamById: (id: string) => Team | undefined;
  children: React.ReactNode;
}

const Layout = ({
  activeTab,
  setActiveTab,
  myRegistration,
  getTeamById,
  children,
}: LayoutProps) => {
  const [mounted, setMounted] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const { open: openLoginModal } = useLoginModalStore();

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    setMounted(true);
  }, []);

  // Verificar si el usuario autenticado es admin (solo se usa después de montado)
  const isAdmin = myRegistration?.email && ADMIN_EMAILS.includes(myRegistration.email.toLowerCase());

  // Pre-compute user pill content to avoid hydration mismatches
  const userPillContent = useMemo(() => {
    if (!myRegistration) {
      return (
        <button
          onClick={openLoginModal}
          className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 font-medium bg-gray-100 dark:bg-gray-900 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:border-emerald-300 dark:hover:border-emerald-500/30 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all cursor-pointer"
          title="Acceder a tu quiniela"
        >
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          Sin Registro
        </button>
      );
    }

    const showUploadPhoto =
      myRegistration.photoType === "upload" &&
      myRegistration.photo &&
      myRegistration.photo.startsWith("http");

    const photoElement = showUploadPhoto ? (
      <img
        src={myRegistration.photo}
        alt="User photo"
        className="w-8 h-8 rounded-full object-cover border border-emerald-500/30"
      />
    ) : (
      <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-sm">
        {myRegistration.photo && myRegistration.photo.length <= 2
          ? myRegistration.photo
          : "\uD83D\uDCBC"}
      </div>
    );

    const statusText =
      myRegistration.status === "activo"
        ? `Vivo \u2022 ${(myRegistration.teamIds || [])
            .map((tid: string) => getTeamById(tid)?.name)
            .filter(Boolean)
            .join(", ")}`
        : "Eliminado";

    return (
      <div className="relative">
        <button
          onClick={() => setShowLogout(prev => !prev)}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
          title="Haz clic para cerrar sesión"
        >
          {photoElement}
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold truncate max-w-[100px] text-gray-900 dark:text-gray-100">
              {myRegistration.name}
            </p>
            <span
              className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                myRegistration.status === "activo"
                  ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20"
                  : "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/20"
              }`}
            >
              {statusText}
            </span>
          </div>
        </button>

        {/* Dropdown de cierre de sesión */}
        {showLogout && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowLogout(false)}
            />
            <div className="absolute right-0 top-full mt-2 z-50 min-w-[180px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-2xl overflow-hidden">
              <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-800">
                <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {myRegistration.name}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowLogout(false);
                  // Cerrar sesión: limpiar myRegistration
                  try {
                    localStorage.removeItem('quiniela_my_registration');
                  } catch { /* ignore */ }
                  useQuinielaStore.setState({ myRegistration: null });
                  toast.success('Sesión cerrada');
                }}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition font-semibold"
              >
                <LogOut className="w-3.5 h-3.5" />
                Cerrar Sesión
              </button>
            </div>
          </>
        )}
      </div>
    );
  }, [myRegistration, getTeamById]);

  return (
    <div className="text-gray-900 dark:text-gray-100 min-h-screen flex flex-col">
      {/* HEADER / NAVIGATION */}
      <header className="sticky top-0 z-40 w-full glass border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-amber-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Trophy className="w-5 h-5 text-white stroke-[2.5]" />
            </div>
            <div>
              <h1 className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-emerald-600 via-teal-500 to-amber-500 dark:from-emerald-400 dark:via-teal-300 dark:to-amber-400 bg-clip-text text-transparent">
                La Quiniela 2026
              </h1>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium tracking-widest uppercase">
                Mundial Edition
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-1">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`px-3 py-2 rounded-t-lg text-sm font-semibold flex items-center gap-2 transition ${
                activeTab === "dashboard"
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-500"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/40 dark:hover:bg-gray-800/40"
              }`}
            >
              <Calendar className="w-4 h-4" /> Fechas del Mundial
            </button>

            {/* Pestaña "Registrar" solo visible para admin autenticado */}
            {mounted && isAdmin && (
              <button
                onClick={() => setActiveTab("register")}
                className={`px-3 py-2 rounded-t-lg text-sm font-semibold flex items-center gap-2 transition ${
                  activeTab === "register"
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-500"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/40 dark:hover:bg-gray-800/40"
                }`}
              >
                <UserPlus className="w-4 h-4" /> Registrar
              </button>
            )}

            {/* Pestaña "Sorteo" solo visible para admin autenticado */}
            {mounted && isAdmin && (
              <button
                onClick={() => setActiveTab("sorteo")}
                className={`px-3 py-2 rounded-t-lg text-sm font-semibold flex items-center gap-2 transition ${
                  activeTab === "sorteo"
                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-b-2 border-amber-500"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/40 dark:hover:bg-gray-800/40"
                }`}
              >
                <Dices className="w-4 h-4" /> Sorteo
              </button>
            )}

            <button
              onClick={() => setActiveTab("representantes")}
              className={`px-3 py-2 rounded-t-lg text-sm font-semibold flex items-center gap-2 transition ${
                activeTab === "representantes"
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-500"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/40 dark:hover:bg-gray-800/40"
              }`}
            >
              <Users className="w-4 h-4" /> Representantes
            </button>

            <button
              onClick={() => setActiveTab("bracket")}
              className={`px-3 py-2 rounded-t-lg text-sm font-semibold flex items-center gap-2 transition ${
                activeTab === "bracket"
                  ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-b-2 border-purple-500"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/40 dark:hover:bg-gray-800/40"
              }`}
            >
              <Swords className="w-4 h-4" /> Cuadro
            </button>

            {mounted && isAdmin && (
              <button
                onClick={() => setActiveTab("admin")}
                className={`px-3 py-2 rounded-t-lg text-sm font-semibold flex items-center gap-2 transition ${
                  activeTab === "admin"
                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-b-2 border-amber-500"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/40 dark:hover:bg-gray-800/40"
                }`}
              >
                <ShieldAlert className="w-4 h-4 text-amber-500 dark:text-amber-400" /> Consola Admin
              </button>
            )}
          </nav>

          {/* User Pill Status & Theme Toggle */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="h-8 w-px bg-gray-200 dark:bg-gray-800 hidden sm:block" />
            {mounted && userPillContent}
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex justify-around border-t border-gray-200 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-950/80 text-xs py-2">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex flex-col items-center gap-1 ${
              activeTab === "dashboard"
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Fechas</span>
          </button>

          {/* Pestaña "Registrar" solo para admin en móvil */}
          {mounted && isAdmin && (
            <button
              onClick={() => setActiveTab("register")}
              className={`flex flex-col items-center gap-1 ${
                activeTab === "register"
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Registrar</span>
            </button>
          )}

          {/* Pestaña "Sorteo" solo para admin en móvil */}
          {mounted && isAdmin && (
            <button
              onClick={() => setActiveTab("sorteo")}
              className={`flex flex-col items-center gap-1 ${
                activeTab === "sorteo"
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              <Dices className="w-4 h-4" />
              <span>Sorteo</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab("representantes")}
            className={`flex flex-col items-center gap-1 ${
              activeTab === "representantes"
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Representantes</span>
          </button>
          <button
            onClick={() => setActiveTab("bracket")}
            className={`flex flex-col items-center gap-1 ${
              activeTab === "bracket"
                ? "text-purple-600 dark:text-purple-400"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            <Swords className="w-4 h-4" />
            <span>Cuadro</span>
          </button>
          {mounted && isAdmin && (
            <button
              onClick={() => setActiveTab("admin")}
              className={`flex flex-col items-center gap-1 ${
                activeTab === "admin"
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Admin</span>
            </button>
          )}
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* FOOTER */}
      <footer className="mt-auto border-t border-gray-200 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-950/60 py-6 text-center text-xs text-gray-500 dark:text-gray-500">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p>
            La Quiniela 2026{" "}
            <button
              onClick={openLoginModal}
              className="text-transparent hover:text-gray-400 dark:hover:text-gray-500 transition-colors duration-300 cursor-pointer select-none"
              title="Acceder a tu quiniela"
              aria-label="Acceder a tu quiniela"
            >
              .
            </button>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
