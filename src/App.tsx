import React, { useContext } from 'react';
import { Navigate, Route, Routes, Outlet } from 'react-router-dom';
import { IonApp, setupIonicReact, IonSpinner, IonPage, IonContent } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';

import { AuthContext } from './context/AuthContext';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { TaskList } from './pages/TaskList';
import { TaskForm } from './pages/TaskForm';
import { TaskDetail } from './pages/TaskDetail';

import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

setupIonicReact();

const LoadingScreen: React.FC = () => (
  <IonPage>
    <IonContent className="ion-padding">
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: '60vh' }}>
        <IonSpinner name="crescent" color="primary" style={{ width: '48px', height: '48px' }} />
        <p style={{ marginTop: '16px', color: 'var(--ion-color-step-600, #666)' }}>Cargando...</p>
      </div>
    </IonContent>
  </IonPage>
);

const ProtectedRoute: React.FC = () => {
  const auth = useContext(AuthContext);

  if (auth.loading) {
    return <LoadingScreen />;
  }

  return auth.user ? <Outlet /> : <Navigate to="/login" replace />;
};

export const App: React.FC = () => {
  const auth = useContext(AuthContext);

  if (auth.loading) {
    return (
      <IonApp>
        <LoadingScreen />
      </IonApp>
    );
  }

  return (
    <IonApp>
      <IonReactRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/tasks" element={<TaskList />} />
            <Route path="/tasks/new" element={<TaskForm />} />
            <Route path="/tasks/edit/:id" element={<TaskForm />} />
            <Route path="/tasks/:id" element={<TaskDetail />} />
          </Route>

          <Route path="*" element={<Navigate to={auth.user ? "/tasks" : "/login"} replace />} />
        </Routes>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;