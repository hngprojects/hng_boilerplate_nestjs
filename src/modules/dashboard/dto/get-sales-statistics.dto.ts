export class SalesStatisticsDto {
  message: string;
  status_code: number;
  data: Datum[];
}

class Datum {
  id: string;
  user_id: string;
  order_number: string;
  total_amount: string;
  tax: string;
  shipping_cost: string;
  discount: string;
  status: string;
  payment_status: string;
  payment_method: string;
  shipping_address: string;
  billing_address: string;
  quantity: number;
  notes: string;
  product_id: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date;
  user: UserDetails;
}

class UserDetails {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  email_verified_at: Date;
  is_active: boolean;
  is_verified: boolean;
  signup_type: string;
  social_id: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date;
}
