export type ID = string;

export interface Property {
  id: ID;
  name: string; // "Altbau Prenzlauer Berg"
  address: string;
  type: string; // "2-Zimmer Altbau"
  sizeSqm: number;
  rooms: number;
  beds: number;
  amenities: string[]; // ["WLAN", "Waschmaschine", "Balkon"]
  access: {
    wifiName: string;
    wifiPassword: string;
    doorCode?: string;
    notes?: string; // Schlüsselübergabe, Hausordnung
  };
  contactIds: ID[]; // verknüpfte Kontakte
}

export type BookingStatus = 'angefragt' | 'bestätigt' | 'laufend' | 'abgereist' | 'storniert';

export interface Booking {
  id: ID;
  propertyId: ID;
  guestName: string;
  guests: number;
  checkIn: string; // ISO-Datum "2026-06-25"
  checkOut: string;
  status: BookingStatus;
  pricePerNight?: number;
  notes?: string;
}

export type CleaningStatus = 'geplant' | 'erledigt' | 'nicht_erschienen';

export interface CleaningTask {
  id: ID;
  propertyId: ID;
  date: string; // geplantes Datum
  cleanerId: ID; // Kontakt (Putzkraft)
  status: CleaningStatus;
  completedAt?: string; // Zeitstempel "war da"
  autoSuggested?: boolean; // automatisch nach Abreise vorgeschlagen
  linkedBookingId?: ID;
}

export type MaintCategory = 'elektrik' | 'sanitär' | 'möbel' | 'haushaltsgerät' | 'sonstiges';
export type MaintStatus = 'offen' | 'in_bearbeitung' | 'erledigt';
export type Priority = 'niedrig' | 'mittel' | 'hoch' | 'dringend';

export interface MaintenanceTask {
  id: ID;
  propertyId: ID;
  title: string; // "Steckdose Küche defekt – Elektriker nötig"
  category: MaintCategory;
  priority: Priority;
  status: MaintStatus;
  assigneeId?: ID; // Handwerker-Kontakt
  cost?: number;
  createdAt: string;
  notes?: string;
}

export type ContactRole = 'putzkraft' | 'hausmeister' | 'elektriker' | 'klempner' | 'sonstiges';

export interface Contact {
  id: ID;
  name: string;
  role: ContactRole;
  phone?: string;
  email?: string;
}
