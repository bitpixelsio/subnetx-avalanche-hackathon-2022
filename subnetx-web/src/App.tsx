import React from 'react';
import { Route, Routes, useSearchParams } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Wizard from "./components/Wizard/Wizard";
import Subnet from "./pages/Subnet";
import Header from "./components/Header";
import NotificationWizard from "./components/NotificationWizard/NotificationWizard";

function App() {
  const [searchParams, setSearchParams] = useSearchParams();

  return (
    <div>
      <Header />
      <main>
        <Routes>
          <Route path="/subnet/:subnetId" element={<Subnet />} />
          <Route path="/" element={<Dashboard />} />
        </Routes>
      </main>

      <Wizard />

      {searchParams.has("notifications") ?       <NotificationWizard/> : <></>}

    </div>
  );
}

export default App;
