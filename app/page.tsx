"use client";
import { useEffect } from "react";
import { Toaster } from "sonner";
import Layout from "./components/Layout";
import useQuinielaStore from "./store/quiniela";
import Dashboard from "./components/Dashboard";
import Register from "./components/Register";
import Representantes from "./components/Representantes";
import Admin from "./components/Admin";

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

  const getTeamById = (id: string) => teams.find((team) => team.id === id);

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
        return <Admin />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <>
      <Toaster richColors />
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


