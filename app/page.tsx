"use client";
import { useEffect } from "react";
import { Toaster } from "sonner";
import Layout from "./components/Layout";
import useQuinielaStore from "./store/quiniela";
import Dashboard from "./components/Dashboard";
import Register from "./components/Register";
import Representantes from "./components/Representantes";
import Admin from "./components/Admin";
import LoginModal from "./components/LoginModal";

// 📧 Correos autorizados para ver la Consola Admin
const ADMIN_EMAILS = [
  "osvaldovm2002@gmail.com",
  "osvaldovillalba-02@hotmail.com",
];

export default function Home() {
  const {
    activeTab,
    myRegistration,
    teams,
    matches,
    setActiveTab,
    fetchInitialData,
    loading,
  } = useQuinielaStore();

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // Redirigir a dashboard si un usuario no autorizado intenta acceder a admin
  useEffect(() => {
    if (activeTab === "admin") {
      const userEmail = myRegistration?.email?.toLowerCase();
      const isAuthorized = userEmail && ADMIN_EMAILS.includes(userEmail);
      if (!isAuthorized) {
        setActiveTab("dashboard");
      }
    }
  }, [activeTab, myRegistration, setActiveTab]);

  const getTeamById = (id: string) => teams.find((team) => team.id === id);

  const isAdmin = myRegistration?.email && ADMIN_EMAILS.includes(myRegistration.email.toLowerCase());

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <p className="text-white">Cargando datos...</p>
        </div>
      );
    }
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "register":
        return <Register />;
      case "representantes":
        return <Representantes />;
      case "admin":
        return isAdmin ? <Admin /> : <Dashboard />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <>
      <Toaster richColors />
      <LoginModal />
      <Layout
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        myRegistration={myRegistration}
        getTeamById={getTeamById}
      >
        {renderContent()}
      </Layout>
    </>
  );
}
