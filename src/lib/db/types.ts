export interface DbUser {
   id: string;
   email: string;
   name: string | null;
   avatar_url: string | null;
   created_at: string;
   updated_at: string;
}

export interface DbTrip {
   id: string;
   user_id: string;
   name: string | null;
   arrival_date: string | null;
   departure_date: string | null;
   created_at: string;
   updated_at: string;
}

export interface DbTripCity {
   id: string;
   trip_id: string;
   name: string;
   country: string;
   latitude: number;
   longitude: number;
   order_index: number;
   created_at: string;
   updated_at: string;
}

export interface DbActivity {
   id: string;
   trip_id: string;
   city_id: string | null;
   name: string;
   description: string | null;
   location: string | null;
   scheduled_time: string | null;
   duration_minutes: number | null;
   image_url: string | null;
   activity_url: string | null;
   in_travel_plan: boolean;
   order_index: number;
   created_at: string;
   updated_at: string;
}

export interface DbAccommodation {
   id: string;
   trip_id: string;
   city_id: string | null;
   name: string;
   address: string | null;
   check_in: string | null;
   check_out: string | null;
   confirmation_number: string | null;
   booking_url: string | null;
   notes: string | null;
   created_at: string;
   updated_at: string;
}

export interface DbFlight {
   id: string;
   trip_id: string;
   flight_number: string | null;
   airline: string | null;
   departure_airport: string;
   arrival_airport: string;
   departure_time: string | null;
   arrival_time: string | null;
   confirmation_number: string | null;
   booking_url: string | null;
   notes: string | null;
   created_at: string;
   updated_at: string;
}

export interface DbTrain {
   id: string;
   trip_id: string;
   train_number: string | null;
   operator: string | null;
   departure_station: string;
   arrival_station: string;
   departure_time: string | null;
   arrival_time: string | null;
   confirmation_number: string | null;
   booking_url: string | null;
   seat_info: string | null;
   notes: string | null;
   created_at: string;
   updated_at: string;
}

export interface DbNote {
   id: string;
   trip_id: string;
   content: string;
   note_date: string | null;
   created_at: string;
   updated_at: string;
}
