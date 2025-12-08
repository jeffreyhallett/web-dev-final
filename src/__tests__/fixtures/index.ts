// Sample database records for testing

export const sampleDbTrip = {
   id: '550e8400-e29b-41d4-a716-446655440001',
   name: 'European Adventure',
   start_date: '2024-06-01',
   end_date: '2024-06-15',
   created_at: new Date('2024-01-01'),
   updated_at: new Date('2024-01-01'),
};

export const sampleDbTrip2 = {
   id: '550e8400-e29b-41d4-a716-446655440002',
   name: 'Asian Journey',
   start_date: '2024-09-01',
   end_date: '2024-09-20',
   created_at: new Date('2024-02-01'),
   updated_at: new Date('2024-02-01'),
};

export const sampleDbCity = {
   id: '660e8400-e29b-41d4-a716-446655440001',
   trip_id: '550e8400-e29b-41d4-a716-446655440001',
   name: 'Paris',
   country: 'France',
   latitude: 48.8566,
   longitude: 2.3522,
   order_index: 0,
   created_at: new Date('2024-01-01'),
   updated_at: new Date('2024-01-01'),
};

export const sampleDbCity2 = {
   id: '660e8400-e29b-41d4-a716-446655440002',
   trip_id: '550e8400-e29b-41d4-a716-446655440001',
   name: 'Rome',
   country: 'Italy',
   latitude: 41.9028,
   longitude: 12.4964,
   order_index: 1,
   created_at: new Date('2024-01-01'),
   updated_at: new Date('2024-01-01'),
};

export const sampleDbActivity = {
   id: '770e8400-e29b-41d4-a716-446655440001',
   trip_id: '550e8400-e29b-41d4-a716-446655440001',
   city_id: '660e8400-e29b-41d4-a716-446655440001',
   name: 'Eiffel Tower Visit',
   description: 'Visit the iconic Eiffel Tower',
   address: 'Champ de Mars, 5 Avenue Anatole France',
   latitude: 48.8584,
   longitude: 2.2945,
   scheduled_date: '2024-06-02',
   scheduled_time: '10:00',
   duration_minutes: 180,
   cost: 25.50,
   currency: 'EUR',
   booking_reference: 'ET-12345',
   is_booked: true,
   created_at: new Date('2024-01-01'),
   updated_at: new Date('2024-01-01'),
};

export const sampleDbAccommodation = {
   id: '880e8400-e29b-41d4-a716-446655440001',
   trip_id: '550e8400-e29b-41d4-a716-446655440001',
   city_id: '660e8400-e29b-41d4-a716-446655440001',
   name: 'Hotel Le Marais',
   address: '123 Rue du Temple, Paris',
   latitude: 48.8631,
   longitude: 2.3619,
   check_in: '2024-06-01',
   check_out: '2024-06-05',
   cost: 450.00,
   currency: 'EUR',
   booking_reference: 'HLM-67890',
   is_booked: true,
   created_at: new Date('2024-01-01'),
   updated_at: new Date('2024-01-01'),
};

export const sampleDbFlight = {
   id: '990e8400-e29b-41d4-a716-446655440001',
   trip_id: '550e8400-e29b-41d4-a716-446655440001',
   flight_number: 'AF123',
   airline: 'Air France',
   departure_airport: 'JFK',
   arrival_airport: 'CDG',
   departure_time: '2024-06-01T20:00:00Z',
   arrival_time: '2024-06-02T09:00:00Z',
   cost: 850.00,
   currency: 'USD',
   booking_reference: 'AF-ABCD12',
   is_booked: true,
   created_at: new Date('2024-01-01'),
   updated_at: new Date('2024-01-01'),
};

export const sampleDbTrain = {
   id: 'aa0e8400-e29b-41d4-a716-446655440001',
   trip_id: '550e8400-e29b-41d4-a716-446655440001',
   train_number: 'TGV9876',
   operator: 'SNCF',
   departure_station: 'Paris Gare de Lyon',
   arrival_station: 'Roma Termini',
   departure_time: '2024-06-05T08:00:00Z',
   arrival_time: '2024-06-05T18:30:00Z',
   cost: 120.00,
   currency: 'EUR',
   booking_reference: 'SNCF-XYZ789',
   is_booked: true,
   created_at: new Date('2024-01-01'),
   updated_at: new Date('2024-01-01'),
};

export const sampleDbNote = {
   id: 'bb0e8400-e29b-41d4-a716-446655440001',
   trip_id: '550e8400-e29b-41d4-a716-446655440001',
   content: 'Remember to bring passport and travel adapters',
   note_date: '2024-06-01',
   created_at: new Date('2024-01-01'),
   updated_at: new Date('2024-01-01'),
};

// Helper to create request mock
export function createMockRequest(body?: unknown): Request {
   return {
      json: async () => body,
   } as Request;
}
