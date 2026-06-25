import type {
  Property,
  Booking,
  CleaningTask,
  MaintenanceTask,
  Contact,
} from '@/types';

// Referenzdatum für die Mock-Daten: 2026-06-25
const TODAY = '2026-06-25';

export const contacts: Contact[] = [
  { id: 'c1', name: 'Frau Keller', role: 'putzkraft', phone: '0151 2233445' },
  { id: 'c2', name: 'Herr Bauer', role: 'hausmeister', phone: '0160 9988776' },
  { id: 'c3', name: 'Elektro Schmitt', role: 'elektriker', phone: '030 55512345' },
  { id: 'c4', name: 'Frau Yilmaz', role: 'putzkraft', phone: '0176 3344556' },
  { id: 'c5', name: 'Klempner Voss', role: 'klempner', phone: '030 99887766' },
];

export const properties: Property[] = [
  {
    id: 'p1',
    name: 'Altbau Prenzlauer Berg',
    address: 'Kastanienallee 42, 10435 Berlin',
    type: '2-Zimmer Altbau',
    sizeSqm: 65,
    rooms: 2,
    beds: 2,
    amenities: ['WLAN', 'Waschmaschine', 'Balkon', 'Geschirrspüler'],
    access: {
      wifiName: 'Kastanien42',
      wifiPassword: 'AltbauBerlin26!',
      doorCode: '4471#',
      notes: 'Schlüssel im Schlüsselkasten neben dem Klingelschild, Code 8842.',
    },
    contactIds: ['c1', 'c2', 'c3'],
  },
  {
    id: 'p2',
    name: 'Loft Friedrichshain',
    address: 'Boxhagener Str. 12, 10245 Berlin',
    type: 'Loft, offene Küche',
    sizeSqm: 48,
    rooms: 1,
    beds: 2,
    amenities: ['WLAN', 'Klimaanlage', 'Smart-TV'],
    access: {
      wifiName: 'Loft_Boxi12',
      wifiPassword: 'Friedrichshain99',
      notes: 'Self-Check-in über Schlüsseltresor, Code wird 1 Tag vorher per SMS verschickt.',
    },
    contactIds: ['c4', 'c2'],
  },
  {
    id: 'p3',
    name: 'Gartenwohnung Köpenick',
    address: 'Müggelheimer Str. 5, 12555 Berlin',
    type: '3-Zimmer mit Garten',
    sizeSqm: 82,
    rooms: 3,
    beds: 4,
    amenities: ['WLAN', 'Garten', 'Grill', 'Waschmaschine', 'Stellplatz'],
    access: {
      wifiName: 'Koepenick_Garten',
      wifiPassword: 'Gartenwg2026',
      doorCode: '1290',
      notes: 'Gartentor separat verriegelt, Schlüssel hängt im Sicherungskasten im Flur.',
    },
    contactIds: ['c1', 'c5'],
  },
];

export const bookings: Booking[] = [
  // p1 — laufender Gast (eingecheckt vor 2 Tagen, Checkout in 3 Tagen)
  {
    id: 'b1',
    propertyId: 'p1',
    guestName: 'Familie Nowak',
    guests: 3,
    checkIn: '2026-06-23',
    checkOut: '2026-06-28',
    status: 'laufend',
    pricePerNight: 110,
    notes: 'Späte Anreise angekündigt, Kontakt per WhatsApp.',
  },
  // p1 — demnächst
  {
    id: 'b2',
    propertyId: 'p1',
    guestName: 'Lukas Hoffmann',
    guests: 1,
    checkIn: '2026-07-02',
    checkOut: '2026-07-06',
    status: 'bestätigt',
    pricePerNight: 95,
  },
  // p1 — bereits abgereist
  {
    id: 'b3',
    propertyId: 'p1',
    guestName: 'Sophie Wagner',
    guests: 2,
    checkIn: '2026-06-16',
    checkOut: '2026-06-22',
    status: 'abgereist',
    pricePerNight: 110,
  },

  // p2 — demnächst (in 2 Tagen)
  {
    id: 'b4',
    propertyId: 'p2',
    guestName: 'Marco & Elena Rossi',
    guests: 2,
    checkIn: '2026-06-27',
    checkOut: '2026-07-01',
    status: 'bestätigt',
    pricePerNight: 89,
  },
  // p2 — angefragt
  {
    id: 'b5',
    propertyId: 'p2',
    guestName: 'Jan Petersen',
    guests: 2,
    checkIn: '2026-07-10',
    checkOut: '2026-07-14',
    status: 'angefragt',
    pricePerNight: 89,
    notes: 'Wartet auf Bestätigung der Zahlungsmethode.',
  },
  // p2 — abgereist letzte Woche
  {
    id: 'b6',
    propertyId: 'p2',
    guestName: 'Anna Schreiber',
    guests: 1,
    checkIn: '2026-06-15',
    checkOut: '2026-06-20',
    status: 'abgereist',
    pricePerNight: 85,
  },

  // p3 — laufend (eingecheckt heute)
  {
    id: 'b7',
    propertyId: 'p3',
    guestName: 'Familie Becker',
    guests: 4,
    checkIn: '2026-06-25',
    checkOut: '2026-06-30',
    status: 'laufend',
    pricePerNight: 145,
  },
  // p3 — storniert
  {
    id: 'b8',
    propertyId: 'p3',
    guestName: 'Tom Richter',
    guests: 2,
    checkIn: '2026-07-05',
    checkOut: '2026-07-08',
    status: 'storniert',
    pricePerNight: 145,
    notes: 'Gast hat kurzfristig storniert, Erstattung erfolgt.',
  },
  // p3 — demnächst
  {
    id: 'b9',
    propertyId: 'p3',
    guestName: 'Greta Lindqvist',
    guests: 3,
    checkIn: '2026-07-12',
    checkOut: '2026-07-18',
    status: 'bestätigt',
    pricePerNight: 150,
  },
];

export const cleaningTasks: CleaningTask[] = [
  // p1 — Auto-Vorschlag nach Abreise von b3 (Checkout 2026-06-24)
  {
    id: 'cl1',
    propertyId: 'p1',
    date: '2026-06-22',
    cleanerId: 'c1',
    status: 'erledigt',
    completedAt: '2026-06-22T13:30:00',
    autoSuggested: true,
    linkedBookingId: 'b3',
  },
  // p1 — geplant vor Anreise von b2
  {
    id: 'cl2',
    propertyId: 'p1',
    date: '2026-07-01',
    cleanerId: 'c1',
    status: 'geplant',
    autoSuggested: false,
    linkedBookingId: 'b2',
  },

  // p2 — Auto-Vorschlag nach Abreise von b6, nicht erschienen
  {
    id: 'cl3',
    propertyId: 'p2',
    date: '2026-06-20',
    cleanerId: 'c4',
    status: 'nicht_erschienen',
    autoSuggested: true,
    linkedBookingId: 'b6',
  },
  // p2 — geplant vor Anreise von b4
  {
    id: 'cl4',
    propertyId: 'p2',
    date: '2026-06-26',
    cleanerId: 'c4',
    status: 'geplant',
    autoSuggested: true,
    linkedBookingId: 'b4',
  },

  // p3 — erledigt, Vorbereitung für heutigen Checkin b7
  {
    id: 'cl5',
    propertyId: 'p3',
    date: '2026-06-25',
    cleanerId: 'c1',
    status: 'erledigt',
    completedAt: '2026-06-25T10:00:00',
    autoSuggested: false,
    linkedBookingId: 'b7',
  },
];

export const maintenanceTasks: MaintenanceTask[] = [
  // p1
  {
    id: 'm1',
    propertyId: 'p1',
    title: 'Steckdose Küche defekt – Elektriker nötig',
    category: 'elektrik',
    priority: 'dringend',
    status: 'offen',
    assigneeId: 'c3',
    createdAt: '2026-06-22',
    notes: 'Gast hat es beim Check-in gemeldet.',
  },
  {
    id: 'm2',
    propertyId: 'p1',
    title: 'Vorhangschiene im Schlafzimmer lose',
    category: 'möbel',
    priority: 'niedrig',
    status: 'in_bearbeitung',
    assigneeId: 'c2',
    createdAt: '2026-06-15',
  },
  {
    id: 'm3',
    propertyId: 'p1',
    title: 'Geschirrspüler reinigen / entkalken',
    category: 'haushaltsgerät',
    priority: 'mittel',
    status: 'erledigt',
    assigneeId: 'c2',
    createdAt: '2026-06-10',
    cost: 0,
  },

  // p2
  {
    id: 'm4',
    propertyId: 'p2',
    title: 'Klimaanlage macht Geräusche',
    category: 'haushaltsgerät',
    priority: 'hoch',
    status: 'offen',
    createdAt: '2026-06-21',
  },
  {
    id: 'm5',
    propertyId: 'p2',
    title: 'Smart-TV Fernbedienung verloren',
    category: 'sonstiges',
    priority: 'niedrig',
    status: 'erledigt',
    createdAt: '2026-06-05',
    cost: 25,
  },

  // p3
  {
    id: 'm6',
    propertyId: 'p3',
    title: 'Wasserhahn Gartenbad tropft',
    category: 'sanitär',
    priority: 'mittel',
    status: 'offen',
    assigneeId: 'c5',
    createdAt: '2026-06-20',
  },
  {
    id: 'm7',
    propertyId: 'p3',
    title: 'Rasen mähen vor nächster Anreise',
    category: 'sonstiges',
    priority: 'mittel',
    status: 'in_bearbeitung',
    createdAt: '2026-06-23',
  },
  {
    id: 'm8',
    propertyId: 'p3',
    title: 'Grill reinigen nach letztem Aufenthalt',
    category: 'sonstiges',
    priority: 'niedrig',
    status: 'erledigt',
    createdAt: '2026-06-12',
  },
];

export const TODAY_ISO = TODAY;
