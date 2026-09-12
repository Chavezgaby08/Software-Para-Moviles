export interface Visita {
  id: string;
  paciente: string;
  hora: string;
  estado: 'pendiente' | 'en_camino' | 'finalizada';
  direccion?: string;
  motivo?: string;
}

export interface Paciente {
  id: string;
  nombre: string;
  cc: string;
  telefono: string;
}