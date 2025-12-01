export interface Trip {
   id: string;
   cities: City[];
   dates: {
      arrival: string;
      departure: string;
   };
   accommodation: Accommodation[];
   activities: Activity[];
   transportation: {
      flights?: Flight[];
      trainRides?: Train[];
   };
   notes: Note[];
}

export interface City {
   id: string;
   name: string;
   country: string;
   latitude: number;
   longitude: number;
}

export interface Activity {
   id: string;
   name: string;
   description: string;
   location: string;
   time: string;
   city: City;
   inTravelPlan: boolean;
   url?: string;
   imageUrl?: string;
}

export interface Accommodation {
   id: string;
   name: string;
   address: string;
   checkIn: string;
   checkOut: string;
   city: City;
   url?: string;
}

export interface Flight {
   id: string;
   number?: string;
   times: {
      departure?: string;
      arrival?: string;
   };
   airline?: string;
   departureAirport: string;
   arrivalAirport: string;
}

export interface Train {
   id: string;
   number?: string;
   times: {
      departure?: string;
      arrival?: string;
   };
   operator?: string;
   departureStation: string;
   arrivalStation: string;
}

export interface Note {
   id: string;
   content: string;
   date: string;
}
