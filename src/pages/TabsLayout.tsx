import React from "react";
import { 
  IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, IonRouterOutlet 
} from "@ionic/react";
import { Route, Navigate } from "react-router-dom";
import { peopleOutline, checkboxOutline, nutritionOutline } from "ionicons/icons";

import { ContactsPage } from "./ContactsPage";
import { TasksPage } from "./TasksPage";
import { FruitsPage } from "./FruitsPage";

export const TabsLayout: React.FC = () => {
  return (
    <IonTabs>
      <IonRouterOutlet>
        <Route path="/app/contacts" element={<ContactsPage/>} />
        <Route path="/app/tasks" element={<TasksPage/>} />
        <Route path="/app/fruits" element={<FruitsPage/>} />
        <Route path="/app">
          <Navigate to="/app/contacts" />
        </Route>
      </IonRouterOutlet>

      <IonTabBar slot="bottom">
        <IonTabButton tab="contacts" href="/app/contacts">
          <IonIcon icon={peopleOutline} />
          <IonLabel>Contactos</IonLabel>
        </IonTabButton>

        <IonTabButton tab="tasks" href="/app/tasks">
          <IonIcon icon={checkboxOutline} />
          <IonLabel>Tareas</IonLabel>
        </IonTabButton>

        <IonTabButton tab="fruits" href="/app/fruits">
          <IonIcon icon={nutritionOutline} />
          <IonLabel>Frutas</IonLabel>
        </IonTabButton>
      </IonTabBar>
    </IonTabs>
  );
};