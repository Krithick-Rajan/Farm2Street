import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Produce, Order, TraceabilityBatch, SubscriptionBox, UserRole } from '../types';

// Supabase Configuration & Realtime Client
// Powered by Supabase PostgreSQL 16 & Realtime Channel Engine
export interface SupabaseConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
}

const DEFAULT_URL =
  import.meta.env.VITE_SUPABASE_URL || 'https://aydjkpolejhsmpsrmgfo.supabase.co';
const DEFAULT_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5ZGprcG9sZWpoc21wc3JtZ2ZvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDk1MzYwOSwiZXhwIjoyMTA2NTI5NjA5fQ.aNbIyjfmwsdLh9cwpbVioKmmK_euyt4WW_CVfko0ZXc';

export const SUPABASE_CONFIG: SupabaseConfig = {
  supabaseUrl: DEFAULT_URL,
  supabaseAnonKey: DEFAULT_KEY,
};

// Real Supabase Client Instance
export const supabase: SupabaseClient = createClient(
  SUPABASE_CONFIG.supabaseUrl,
  SUPABASE_CONFIG.supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
);

// Supabase Connection & Health Status
export interface SupabaseHealth {
  connected: boolean;
  database: 'PostgreSQL 16';
  region: 'ap-south-1 (Mumbai)';
  latencyMs: number;
  realtimeEngine: 'WebSocket Active' | 'Reconnecting';
  supabaseUrl: string;
}

export const getSupabaseHealth = async (): Promise<SupabaseHealth> => {
  const startTime = performance.now();
  let isConnected = true;

  try {
    // Fast ping with strict 800ms timeout race to prevent network hang
    const timeoutPromise = new Promise<{ error: { message: string } }>((resolve) =>
      setTimeout(() => resolve({ error: { message: 'Timeout' } }), 800)
    );
    const queryPromise = supabase.from('produce').select('id').limit(1);

    const result: any = await Promise.race([queryPromise, timeoutPromise]);
    if (result?.error && (result.error.message.includes('Failed to fetch') || result.error.message === 'Timeout')) {
      isConnected = false;
    }
  } catch {
    isConnected = false;
  }

  const latency = Math.round(performance.now() - startTime);

  return {
    connected: isConnected,
    database: 'PostgreSQL 16',
    region: 'ap-south-1 (Mumbai)',
    latencyMs: latency > 0 ? latency : 18,
    realtimeEngine: isConnected ? 'WebSocket Active' : 'Reconnecting',
    supabaseUrl: SUPABASE_CONFIG.supabaseUrl,
  };
};

// =======================================================================
// Supabase Data Service Functions (Produce, Orders, Farms, Traceability)
// =======================================================================

// 1. Produce Catalog
export const supabaseProduceService = {
  async getAll(): Promise<Produce[] | null> {
    try {
      const { data, error } = await supabase
        .from('produce')
        .select('*')
        .order('id', { ascending: true });
      if (error || !data) return null;
      return data as Produce[];
    } catch (e) {
      console.warn('Supabase produce fetch notice:', e);
      return null;
    }
  },

  async insert(item: Partial<Produce>): Promise<boolean> {
    try {
      const { error } = await supabase.from('produce').insert(item);
      return !error;
    } catch {
      return false;
    }
  },

  async updateStock(id: string, newStock: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('produce')
        .update({ availableQty: newStock })
        .eq('id', id);
      return !error;
    } catch {
      return false;
    }
  },
};

// 2. Orders & Realtime Updates
export const supabaseOrderService = {
  async getAll(): Promise<Order[] | null> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('createdAt', { ascending: false });
      if (error || !data) return null;
      return data as Order[];
    } catch (e) {
      console.warn('Supabase orders fetch notice:', e);
      return null;
    }
  },

  async insert(order: Order): Promise<boolean> {
    try {
      const { error } = await supabase.from('orders').insert(order);
      return !error;
    } catch {
      return false;
    }
  },

  async updateStatus(orderId: string, status: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status, updatedAt: 'Just now' })
        .eq('id', orderId);
      return !error;
    } catch {
      return false;
    }
  },

  // Subscribe to realtime orders changes (Dispatches, Status Updates)
  subscribeToOrders(callback: (payload: any) => void) {
    return supabase
      .channel('public:orders')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => callback(payload)
      )
      .subscribe();
  },
};

// 3. Farms Service
export const supabaseFarmService = {
  async getAll(): Promise<any[] | null> {
    try {
      const { data, error } = await supabase.from('farms').select('*');
      if (error || !data) return null;
      return data;
    } catch {
      return null;
    }
  },
};

// 4. Supabase User Authentication & Role Management
export interface SupabaseUser {
  id: number | string;
  name: string;
  email: string;
  password_hash?: string;
  role: UserRole;
  phone?: string;
  address?: string;
  extraInfo?: string;
}

export const supabaseUserService = {
  // Query Supabase for user by email or phone
  async findUser(emailOrPhone: string): Promise<SupabaseUser | null> {
    try {
      const clean = emailOrPhone.trim().toLowerCase();
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .or(`email.ilike.${clean},phone.eq.${clean}`)
        .limit(1);

      if (error || !data || data.length === 0) {
        return null;
      }
      return data[0] as SupabaseUser;
    } catch {
      return null;
    }
  },

  // Authenticate user against Supabase PostgreSQL
  async authenticate(
    emailOrPhone: string,
    password: string,
    role?: UserRole
  ): Promise<{ success: boolean; user?: SupabaseUser; error?: string }> {
    const clean = emailOrPhone.trim().toLowerCase();

    // 1. Check live Supabase PostgreSQL database
    const dbUser = await this.findUser(clean);
    if (dbUser) {
      if (dbUser.password_hash === password) {
        return { success: true, user: dbUser };
      } else {
        return { success: false, error: 'Incorrect password. Please verify and try again.' };
      }
    }

    // 2. Check local storage cache of registered accounts
    try {
      const localUsers: SupabaseUser[] = JSON.parse(
        localStorage.getItem('farm2street_registered_users') || '[]'
      );
      const localMatch = localUsers.find(
        (u) =>
          u.email.toLowerCase() === clean ||
          (u.phone && u.phone.toLowerCase() === clean)
      );
      if (localMatch) {
        if (localMatch.password_hash === password) {
          return { success: true, user: localMatch };
        } else {
          return { success: false, error: 'Incorrect password. Please verify and try again.' };
        }
      }
    } catch {
      // fallback
    }

    // If neither DB nor local registration matches, reject with explicit error!
    return {
      success: false,
      error: 'Account not found. Please register a new account on the platform.',
    };
  },

  // Register new user into Supabase PostgreSQL
  async register(newUser: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    phone?: string;
    address?: string;
    extraInfo?: string;
  }): Promise<{ success: boolean; user?: SupabaseUser; error?: string }> {
    try {
      const raw = newUser.email.trim();
      const isEmail = raw.includes('@');
      const cleanEmail = isEmail ? raw.toLowerCase() : `${raw}@user.farm2street.org`;
      const phoneVal = newUser.phone?.trim() || (!isEmail ? raw : '');

      // Check existing in Supabase
      const existing = await this.findUser(raw);
      if (existing) {
        return {
          success: false,
          error: 'An account with this email/mobile already exists. Please log in.',
        };
      }

      // Insert into Supabase PostgreSQL users table
      const { data, error } = await supabase
        .from('users')
        .insert([
          {
            name: newUser.name.trim(),
            email: cleanEmail,
            password_hash: newUser.password,
            role: newUser.role,
            phone: phoneVal,
            address: newUser.address || '',
          },
        ])
        .select();

      if (error) {
        console.error('Supabase users insert error:', error);
        if (error.code === '42501' || error.message?.includes('row-level security')) {
          return {
            success: false,
            error: 'Supabase Row-Level Security (RLS) is blocking inserts. Please disable RLS in Supabase SQL Editor.',
          };
        }
        return {
          success: false,
          error: `Supabase error: ${error.message}`,
        };
      }

      if (!data || data.length === 0) {
        return {
          success: false,
          error: 'Database returned no data after registration. Please retry.',
        };
      }

      const createdUser = {
        ...data[0],
        extraInfo: newUser.extraInfo,
      } as SupabaseUser;

      // Cache into local storage
      try {
        const localUsers: SupabaseUser[] = JSON.parse(
          localStorage.getItem('farm2street_registered_users') || '[]'
        );
        localUsers.push(createdUser);
        localStorage.setItem(
          'farm2street_registered_users',
          JSON.stringify(localUsers)
        );
      } catch {
        // ignore
      }

      return { success: true, user: createdUser };
    } catch (e: any) {
      return {
        success: false,
        error: e?.message || 'Registration failed. Please try again.',
      };
    }
  },
};

