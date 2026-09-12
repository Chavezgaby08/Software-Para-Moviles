import React, { useState } from 'react';
import { IonItem, IonInput, IonButton, IonIcon } from '@ionic/react';
import {personAddOutline } from 'ionicons/icons';

interface ContactFormProps {
    onAddContact: (name: string, phone: string) => void;
}

const ContactForm: React.FC<ContactFormProps> = ({ onAddContact }) => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !phone.trim()) return;

        onAddContact(name, phone);
        setName('');
        setPhone('');
    };

    return (
        <form onSubmit={handleSubmit} className="ion-padding-bottom">
            <IonItem>
                <IonInput
                    label="Nombre"
                    labelPlacement="floating"
                    placeholder="Ej: María Pérez"
                    value={name}
                    onIonInput={(e) => setName(e.detail.value!)}
                    />
            </IonItem>

            <IonItem>
                <IonInput
                    label="Teléfono"
                    labelPlacement="floating"
                    placeholder="Ej: 3008182441"
                    value={phone}
                    onIonInput={(e) => setPhone(e.detail.value!)}
                />
            </IonItem>

            <IonButton expand="block" type="submit" className="ion-margin-top">
                <IonIcon slot="start" icon={personAddOutline} />
                Agregar Contacto
            </IonButton>
        </form>
    );
};

export default ContactForm;