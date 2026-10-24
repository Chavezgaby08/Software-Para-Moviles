import React from 'react';
import { Route, Navigate } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';

/* CSS necesario de Ionic */
import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import '@ionic/react/css/padding.css';

import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { MainMissions } from './pages/MainMissions';
import { Results } from './pages/Results';
import { PrivateRoute } from './components/PrivateRute';

setupIonicReact();

const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      <IonRouterOutlet>
        {/* Rutas Públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Rutas Protegidas enviadas en la prop 'element' */}
        <Route
          path="/missions"
          element={
            <PrivateRoute>
              <MainMissions />
            </PrivateRoute>
          }
        />
        <Route
          path="/results"
          element={
            <PrivateRoute>
              <Results />
            </PrivateRoute>
          }
        />

        {/* Redirección raíz a /missions */}
        <Route path="/" element={<Navigate to="/missions" replace />} />
      </IonRouterOutlet>
    </IonReactRouter>
  </IonApp>
);

export default App;