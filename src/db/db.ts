import Dexie, { Table } from "dexie";

export interface Fruta {
  id?: number;
  nombre: string;
  createdAt?: string;
}

class MyAppDatabase extends Dexie {
  frutas!: Table<Fruta>;

  constructor() {
    super("Challenge06DB");
    this.version(1).stores({
      frutas: "++id, nombre, createdAt"
    });
  }
}

export const db = new MyAppDatabase();