import React from "react";
import { Navigate, Route } from "react-router-dom";
import { IonApp, IonRouterOutlet, setupIonicReact, IonSpinner } from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";

import { AuthProvider, useAuthContext } from "./context/AuthContext";
import { Login } from "./pages/Login";
import { TabsLayout } from "./pages/TabsLayout";

/* Estilos básicos de Ionic */
import "@ionic/react/css/core.css";

/* Estilos de estructura y utilidad de Ionic */
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";
import { Register } from "./pages/Register";

setupIonicReact();

type PrivateRouteProps = {
  children: React.ReactNode;
};

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  
  const { user, loading } = useAuthContext();

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <IonSpinner name="crescent" color="primary" />
      </div>
    );
  }

  return user ? <>{children}</> : <Navigate to="/login" replace />;
};

const AppRoutes: React.FC = () => {
  return (
    <IonReactRouter>
      <IonRouterOutlet>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
          <Route
            path="/app/*"
            element={
              <PrivateRoute>
                <TabsLayout />
              </PrivateRoute>
            }
          />
          <Route path="/" element={<Navigate to="/app" replace />} />     
      </IonRouterOutlet>
    </IonReactRouter>
  );
};

const App: React.FC = () => (
  <IonApp>
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  </IonApp>
);

export default App;