import { Tables } from "@/database.types";

type ChatRoom = Tables<"chat_rooms">;
type Ride = Tables<"rides">;

type ChatRoomWithRide = ChatRoom & {
  ride: Ride;
};

// Mock data - Replace with actual Supabase query
const mockChatRooms: ChatRoomWithRide[] = [
  {
    id: "1",
    ride_id: "ride-1",
    status: "active",
    created_at: new Date().toISOString(),
    ride: {
      id: "ride-1",
      created_by_user_id: "user-1",
      origin: "Campus Gate",
      destination: "Railway Station",
      departure_date: new Date(Date.now() + 86400000).toISOString(),
      total_seats: 4,
      available_seats: 2,
      total_cost: 200,
      cost_per_person: 50,
      vehicle_type: "Car",
      status: "active",
      created_at: new Date().toISOString(),
    },
  },
  {
    id: "2",
    ride_id: "ride-2",
    status: "active",
    created_at: new Date().toISOString(),
    ride: {
      id: "ride-2",
      created_by_user_id: "user-2",
      origin: "Library",
      destination: "Airport",
      departure_date: new Date(Date.now() + 172800000).toISOString(),
      total_seats: 3,
      available_seats: 1,
      total_cost: 500,
      cost_per_person: 167,
      vehicle_type: "SUV",
      status: "active",
      created_at: new Date().toISOString(),
    },
  },
  {
    id: "3",
    ride_id: "ride-3",
    status: "active",
    created_at: new Date().toISOString(),
    ride: {
      id: "ride-3",
      created_by_user_id: "user-3",
      origin: "Hostel Block A",
      destination: "City Mall",
      departure_date: new Date(Date.now() + 3600000).toISOString(),
      total_seats: 2,
      available_seats: 1,
      total_cost: 150,
      cost_per_person: 75,
      vehicle_type: "Bike",
      status: "active",
      created_at: new Date().toISOString(),
    },
  },
  {
    id: "4",
    ride_id: "ride-4",
    status: "active",
    created_at: new Date().toISOString(),
    ride: {
      id: "ride-4",
      created_by_user_id: "user-4",
      origin: "Main Building",
      destination: "Bus Stand",
      departure_date: new Date(Date.now() + 7200000).toISOString(),
      total_seats: 4,
      available_seats: 3,
      total_cost: 120,
      cost_per_person: 30,
      vehicle_type: "Car",
      status: "active",
      created_at: new Date().toISOString(),
    },
  },
  {
    id: "5",
    ride_id: "ride-5",
    status: "active",
    created_at: new Date().toISOString(),
    ride: {
      id: "ride-5",
      created_by_user_id: "user-5",
      origin: "Sports Complex",
      destination: "Metro Station",
      departure_date: new Date(Date.now() + 259200000).toISOString(),
      total_seats: 6,
      available_seats: 4,
      total_cost: 300,
      cost_per_person: 50,
      vehicle_type: "Van",
      status: "active",
      created_at: new Date().toISOString(),
    },
  },
];


export default mockChatRooms;