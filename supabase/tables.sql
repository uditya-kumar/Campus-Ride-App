create table public.users (
  id uuid not null default auth.uid (),
  full_name text not null,
  email text not null,
  phone text null,
  avatar_url text null,
  created_at timestamp with time zone null default now(),
  constraint users_pkey primary key (id),
  constraint users_email_key unique (email),
  constraint users_phone_key unique (phone),
  constraint users_id_fkey foreign KEY (id) references auth.users (id) on update CASCADE
) TABLESPACE pg_default;


create table public.rides (
  id uuid not null default gen_random_uuid (),
  created_by_user_id uuid not null,
  origin text not null,
  destination text not null,
  departure_date timestamp with time zone not null,
  total_seats integer not null,
  available_seats integer not null,
  total_cost numeric(10, 2) not null,
  vehicle_type text not null,
  status text not null default 'active'::text,
  created_at timestamp with time zone null default now(),
  cost_per_person numeric GENERATED ALWAYS as (
    case
      when (total_seats > 0) then round(
        ((total_cost)::numeric / (total_seats)::numeric),
        2
      )
      else (0)::numeric
    end
  ) STORED null,
  constraint rides_pkey primary key (id),
  constraint rides_created_by_user_id_fkey foreign KEY (created_by_user_id) references users (id) on update CASCADE,
  constraint rides_departure_future check ((departure_date > created_at)),
  constraint rides_seats_valid check (
    (
      (total_seats > 0)
      and (available_seats >= 0)
      and (available_seats <= total_seats)
    )
  ),
  constraint rides_status_check check (
    (
      status = any (array['active'::text, 'archived'::text])
    )
  ),
  constraint rides_total_cost_positive check ((total_cost > (0)::numeric))
) TABLESPACE pg_default;

create index IF not exists rides_active_departure on public.rides using btree (status, departure_date) TABLESPACE pg_default
where
  (status = 'active'::text);





create table public.messages (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null,
  content text not null,
  created_at timestamp with time zone null default now(),
  read_by uuid[] null default array[]::uuid[],
  ride_id uuid not null,
  constraint messages_pkey primary key (id),
  constraint messages_ride_id_fkey foreign KEY (ride_id) references rides (id) on update CASCADE,
  constraint messages_user_id_fkey foreign KEY (user_id) references users (id) on update CASCADE
) TABLESPACE pg_default;

create index IF not exists messages_ride_created_idx on public.messages using btree (ride_id, created_at) TABLESPACE pg_default;





create table public.bookings (
  id uuid not null default gen_random_uuid (),
  ride_id uuid not null,
  user_id uuid not null,
  created_at timestamp with time zone null default now(),
  constraint bookings_pkey primary key (id),
  constraint bookings_unique_ride_user unique (ride_id, user_id),
  constraint bookings_ride_id_fkey foreign KEY (ride_id) references rides (id) on update CASCADE on delete CASCADE,
  constraint bookings_user_id_fkey foreign KEY (user_id) references users (id) on update CASCADE on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists bookings_user_idx on public.bookings using btree (user_id) TABLESPACE pg_default;