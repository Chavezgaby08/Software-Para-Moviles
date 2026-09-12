import React, { useState } from 'react';
import { 
  IonPage, 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent,
  IonList,
  IonLabel,
  IonFab,
  IonFabButton,
  IonIcon,
  IonAvatar,
  IonNote,
  useIonViewWillEnter, 
  IonItem
} from '@ionic/react';
import { add, peopleOutline, chevronForward } from 'ionicons/icons';
import { Contact } from '../types/contact';

const MOCK_CONTACTS: Contact[] = [
  { id: '1', name: 'John Doe', phone: '123-456-7890', email: 'john.doe@example.com' },
  { id: '2', name: 'Jane Smith', phone: '987-654-3210', email: 'jane.smith@example.com' },
  { id: '3', name: 'Alice Johnson', phone: '555-555-5555', email: 'alice.johnson@example.com' },
];

const Home: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);

  useIonViewWillEnter(() => {
    const saved = localStorage.getItem('ionic_contacts');
    if (saved){
      const parsed = JSON.parse(saved);
      if (parsed.length > 0){
        setContacts(parsed);
        return;
      }
    }
    setContacts(MOCK_CONTACTS);
    localStorage.setItem('ionic_contacts', JSON.stringify(MOCK_CONTACTS));
  });

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>
            <IonIcon icon={peopleOutline} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            Contactos
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <IonList lines = "full">
          {contacts.map((contact) => (
            <IonItem
              key = {contact.id}
              button
              routerLink = {`/detail/${contact.id}`}
              routerDirection = 'forward'
            >
              <IonAvatar slot = "start">
                <img
                  src = {`https://ionicframework.com/docs/demos/api/avatar/avatar.svg`}
                  alt = "avatar"
                />
              </IonAvatar>
              <IonLabel>
                <h2>{contact.name}</h2>
                <IonNote color = "medium"> {contact.phone} </IonNote>
              </IonLabel>
              <IonIcon icon = {chevronForward} />
            </IonItem>
          ))}
        </IonList>

        <IonFab vertical = "bottom" horizontal = "end" slot = "fixed">
          <IonFabButton routerLink="/add-contact">
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>
      </IonContent>
    </IonPage>
  );
};

export default Home;