/* eslint-disable @next/next/no-img-element */
import {
  Trophy,
  Calendar,
  UserPlus,
  Users,
  ShieldAlert,
} from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { useMemo } from "react";

// 📧 Correos autorizados para ver la Consola Admin
const ADMIN_EMAILS = [
  "osvaldovm2002@gmail.com",
  "osvaldovillalba-02@hotmail.com",
];

const Layout = ({
  activeTab,
  setActiveTab,
  myRegistration,
  getTeamById,
  children,
}: any) => {
  // Verificar si el usuario autenticado es admin
  const isAdmin = myRegistration?.email && ADMIN_EMAILS.includes(myRegistration.email.toLowerCase());

  // Pre-compute user pill content to avoid hydration mismatches
  const userPillContent = useMemo(() => {
    if (!myRegistration) {
      return (
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 font-medium bg-gray-100 dark:bg-gray-900 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          Sin Registro
        </div>
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
      <div className="flex items-center gap-2">
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
            <button
              onClick={() => setActiveTab("register")}
              className={`px-3 py-2 rounded-t-lg text-sm font-semibold flex items-center gap-2 transition ${
                activeTab === "register"
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-500"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/40 dark:hover:bg-gray-800/40"
              }`}
            >
              <UserPlus className="w-4 h-4" /> Registrarme
            </button>
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
            {isAdmin && (
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
            {userPillContent}
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
          {isAdmin && (
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
            La Quiniela 2026. Diseñada exclusivamente con fines
            recreativos de integración corporativa.
          </p>
          <p className="text-[10px] text-gray-400 dark:text-gray-600">
            Ningún post de Recursos Humanos fue alterado en la producción de
            este software.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
