import React from 'react';
import { Navigate, Route } from 'react-router-dom';
import {
  IonApp,
  IonRouterOutlet,
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel,
  setupIonicReact
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { calendarOutline, peopleOutline, personOutline } from 'ionicons/icons';

import Login from './pages/Login';
import Visitas from './pages/Visitas';
import VisitaDetalle from './pages/VisitaDetalle';
import Pacientes from './pages/Pacientes';
import Perfil from './pages/Perfil';

import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import '@ionic/react/css/padding.css';

setupIonicReact();

const MainTabs: React.FC = () => (
  <IonTabs>
    <IonRouterOutlet>
      <Route path="/app/visitas" element={<Visitas />} />
      <Route path="/app/visitas/:id" element={<VisitaDetalle />} />
      <Route path="/app/pacientes" element={<Pacientes />} />
      <Route path="/app/perfil" element={<Perfil />} />
      <Route path="/app" element={<Navigate to="/app/visitas" />} />
    </IonRouterOutlet>

    <IonTabBar slot="bottom">
      <IonTabButton tab="visitas" href="/app/visitas">
        <IonIcon icon={calendarOutline} />
        <IonLabel>Visitas</IonLabel>
      </IonTabButton>

      <IonTabButton tab="pacientes" href="/app/pacientes">
        <IonIcon icon={peopleOutline} />
        <IonLabel>Pacientes</IonLabel>
      </IonTabButton>

      <IonTabButton tab="perfil" href="/app/perfil">
        <IonIcon icon={personOutline} />
        <IonLabel>Perfil</IonLabel>
      </IonTabButton>
    </IonTabBar>
  </IonTabs>
);

const App: React.FC = () => {
  const isLogged = localStorage.getItem('mediclinic_doctor_logged') === 'true';

  return (
    <IonApp>
      <IonReactRouter>
        <IonRouterOutlet>
          <Route path="/login" element={<Login />} />
          <Route path="/app/*" element={<MainTabs />} />
          <Route
            path="/"
            element={isLogged ? <Navigate to="/app/visitas" /> : <Navigate to="/login" />}
          />
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;