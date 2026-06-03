export interface PriceOverride {
  id: number;
  room_type_id: number;
  start_date: string;
  end_date: string;
  price_per_night: number;
  label: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type PriceOverridePayload = {
  start_date: string;
  end_date: string;
  price_per_night: number | string;
  label?: string | null;
  is_active?: boolean;
};
