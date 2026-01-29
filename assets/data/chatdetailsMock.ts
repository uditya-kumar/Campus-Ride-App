import { Tables } from "@/database.types";


// Mock data for chat UI design
const MOCK_CURRENT_USER_ID = "user-001";

const MOCK_CHAT_ROOM: Tables<"chat_rooms"> = {
  id: "chat-room-001",
  ride_id: "ride-001",
  status: "active",
  created_at: "2026-01-28T10:00:00Z",
};

const MOCK_RIDE: Tables<"rides"> = {
  id: "ride-001",
  created_by_user_id: "user-001",
  origin: "Campus Library",
  destination: "Downtown Mall",
  departure_date: "2026-01-30",
  total_seats: 4,
  available_seats: 1,
  total_cost: 20.0,
  cost_per_person: 5.0,
  vehicle_type: "sedan",
  status: "active",
  created_at: "2026-01-27T08:00:00Z",
};

const MOCK_PARTICIPANTS: Tables<"users">[] = [
  {
    id: "user-001",
    full_name: "You",
    email: "you@campus.edu",
    phone: "+1234567890",
    avatar_url: "https://i.pravatar.cc/150?u=user001",
    created_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "user-002",
    full_name: "Sarah Johnson",
    email: "sarah@campus.edu",
    phone: "+1234567891",
    avatar_url: "https://i.pravatar.cc/150?u=user002",
    created_at: "2026-01-02T00:00:00Z",
  },
  {
    id: "user-003",
    full_name: "Mike Chen",
    email: "mike@campus.edu",
    phone: "+1234567892",
    avatar_url: "https://i.pravatar.cc/150?u=user003",
    created_at: "2026-01-03T00:00:00Z",
  },
  {
    id: "user-004",
    full_name: "Emily Davis",
    email: "emily@campus.edu",
    phone: null,
    avatar_url: "https://i.pravatar.cc/150?u=user004",
    created_at: "2026-01-04T00:00:00Z",
  },
];

const MOCK_MESSAGES: Tables<"messages">[] = [
  {
    id: "msg-001",
    chat_room_id: "chat-room-001",
    user_id: "user-002",
    content: "Hey everyone! Excited for the ride tomorrow 🚗",
    created_at: "2026-01-28T14:30:00Z",
    read_by: ["user-001", "user-003", "user-004"],
  },
  {
    id: "msg-002",
    chat_room_id: "chat-room-001",
    user_id: "user-003",
    content: "Same here! What time should we meet at the library?",
    created_at: "2026-01-28T14:32:00Z",
    read_by: ["user-001", "user-002", "user-004"],
  },
  {
    id: "msg-003",
    chat_room_id: "chat-room-001",
    user_id: "user-001",
    content: "Let's meet at 10:00 AM sharp. I'll be in the parking lot near the main entrance.",
    created_at: "2026-01-28T14:35:00Z",
    read_by: ["user-002", "user-003", "user-004"],
  },
  {
    id: "msg-004",
    chat_room_id: "chat-room-001",
    user_id: "user-004",
    content: "Perfect! I'll bring some snacks for the ride 🍪",
    created_at: "2026-01-28T14:40:00Z",
    read_by: ["user-001", "user-002", "user-003"],
  },
  {
    id: "msg-005",
    chat_room_id: "chat-room-001",
    user_id: "user-002",
    content: "You're the best Emily! 😊",
    created_at: "2026-01-28T14:42:00Z",
    read_by: ["user-001", "user-003", "user-004"],
  },
  {
    id: "msg-006",
    chat_room_id: "chat-room-001",
    user_id: "user-001",
    content: "Don't forget to bring your student ID for the parking validation",
    created_at: "2026-01-28T15:00:00Z",
    read_by: ["user-002", "user-003"],
  },
  {
    id: "msg-007",
    chat_room_id: "chat-room-001",
    user_id: "user-003",
    content: "Good reminder! Thanks 👍",
    created_at: "2026-01-28T15:05:00Z",
    read_by: ["user-001"],
  },
  {
    id: "msg-008",
    chat_room_id: "chat-room-001",
    user_id: "user-004",
    content: "See you all tomorrow!",
    created_at: "2026-01-29T09:00:00Z",
    read_by: null,
  },
];



export {  MOCK_CURRENT_USER_ID,
  MOCK_CHAT_ROOM,
  MOCK_RIDE,
  MOCK_PARTICIPANTS,
  MOCK_MESSAGES,
};