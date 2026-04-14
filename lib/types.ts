// Shared types across the entire Kavach Titanium app

export interface PredictedATM {
  id: string;
  lat: number;
  lng: number;
  location: string;
  probability: number;
  estimated_time: string;
  distance?: number;
}

export interface Transaction {
  txn_id: string;
  sender_id?: string;
  user_id?: string;
  lat: number;
  lng: number;
  is_fraud: boolean;
  amount: number;
  city: string;
  status: string;
  fraud_type?: string;
  fraud_probability?: number;
  ip_address?: string;
  device_id?: string;
  device_fingerprint?: string;
  merchant?: string;
  timestamp?: string;
}

export interface AlertData {
  id: string;
  transaction: Transaction;
  predicted_atms: PredictedATM[];
  timestamp: string;
  severity?: string;
}

export interface ATMLocation {
  id: string;
  city: string;
  location: string;
  lat: number;
  lng: number;
  status?: string;
}

export interface AlertRow {
  sender_id: string;
  city: string;
  ip_address: string;
  device_id: string;
  fraud_type: string;
  amount: number;
  timestamp: string;
}
