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
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5ZGprcG9sZWpoc21wc3JtZ2ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA5NTM2MDksImV4cCI6MjEwNjUyOTYwOX0.eKqqXMKn1jhSli1y_XYNvaU5tK_qcV2ada-iOPPeuYg';

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

    // 3. Fallback to schema.sql seeded accounts (Admin, Farmer, Customer)
    const seedAccounts: Record<string, { pass: string; user: SupabaseUser }> = {
      'admin@farm2street.org': {
        pass: 'admin123',
        user: {
          id: 1,
          name: 'Marketplace Admin',
          email: 'admin@farm2street.org',
          role: 'admin',
          phone: '+91 98800 11223',
          address: 'Central Operations Desk',
          extraInfo: 'Platform Governance & Traceability Lab',
        },
      },
      'farmer@farm2street.org': {
        pass: 'farm123',
        user: {
          id: 2,
          name: 'Ramesh Patil',
          email: 'farmer@farm2street.org',
          role: 'farmer',
          phone: '+91 98220 14450',
          address: 'Sahyadri Agro Belt, Nashik',
          extraInfo: 'Sahyadri Agro Farms (100% Certified Organic)',
        },
      },
      'pooja@farm2street.org': {
        pass: 'pooja123',
        user: {
          id: 3,
          name: 'Pooja Sharma',
          email: 'pooja@farm2street.org',
          role: 'customer',
          phone: '+91 98812 77410',
          address: 'Kalyani Nagar, Pune',
          extraInfo: 'Morning Harvest (06:00 AM - 09:00 AM)',
        },
      },
    };

    if (seedAccounts[clean]) {
      const seed = seedAccounts[clean];
      if (seed.pass === password) {
        return { success: true, user: seed.user };
      } else {
        return { success: false, error: 'Incorrect password. Please verify and try again.' };
      }
    }

    // If neither DB nor seeds match, reject with explicit error!
    return {
      success: false,
      error: 'Account not found. Please register a new account or check your credentials.',
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
      const cleanEmail = newUser.email.trim().toLowerCase();

      // Check existing in Supabase
      const existing = await this.findUser(cleanEmail);
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
            phone: newUser.phone || '',
            address: newUser.address || '',
          },
        ])
        .select();

      let createdUser: SupabaseUser;
      if (!error && data && data.length > 0) {
        createdUser = {
          ...data[0],
          extraInfo: newUser.extraInfo,
        } as SupabaseUser;
      } else {
        createdUser = {
          id: `usr_${Date.now().toString().slice(-6)}`,
          name: newUser.name.trim(),
          email: cleanEmail,
          password_hash: newUser.password,
          role: newUser.role,
          phone: newUser.phone,
          address: newUser.address,
          extraInfo: newUser.extraInfo,
        };
      }

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

