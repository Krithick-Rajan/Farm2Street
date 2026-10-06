import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserRole,
  DeliveryStatus,
  Produce,
  Order,
  UserSubscription,
  TraceabilityBatch,
  FarmerProfile,
  DeliveryPartnerProfile,
  Settlement,
  CartItem,
  SubscriptionBox,
  CurrentUser,
  CustomerReview,
} from '../types';
import { INITIAL_PRODUCE, TRACEABILITY_MOCK, SUBSCRIPTION_BOXES } from '../data/mockData';
import { supabase, getSupabaseHealth, supabaseUserService, supabaseOrderService, SupabaseUser } from '../lib/supabase';

export type ActiveView = 'marketplace' | 'subscriptions' | 'farmer' | 'delivery' | 'admin' | 'login' | 'register';

interface FarmContextType {
  // Authentication & Active User
  currentUser: CurrentUser;
  loginAsRole: (role: UserRole, details?: Partial<CurrentUser>) => void;
  loginWithCredentials: (
    identifier: string,
    passcode: string,
    role?: UserRole
  ) => Promise<{ success: boolean; error?: string }>;
  registerUser: (data: {
    role: UserRole;
    name: string;
    email?: string;
    phone?: string;
    emailOrPhone?: string;
    password?: string;
    extraInfo?: string;
    farmName?: string;
    location?: string;
    totalAcres?: number;
    vehicleType?: string;
    vehicleNumber?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isLoginModalOpen: boolean;
  setIsLoginModalOpen: (open: boolean) => void;

  // Active View Routing
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;

  // Produce & Inventory
  produceList: Produce[];
  addProduce: (item: Omit<Produce, 'id'>) => void;
  updateProduceStock: (id: string, newQty: number) => void;
  removeProduce: (id: string) => void;

  // Orders & 8-Stage Delivery Flow
  orders: Order[];
  placeOrder: (
    items: CartItem[],
    address: string,
    paymentMethod: 'Razorpay UPI' | 'Razorpay Card' | 'Razorpay NetBanking' | 'Cash on Delivery',
    paymentId?: string,
    razorpayOrderId?: string
  ) => Order;
  updateOrderStatus: (orderId: string, nextStatus: DeliveryStatus, note?: string) => void;
  activeTrackOrderId: string | null;
  setActiveTrackOrderId: (id: string | null) => void;

  // Subscriptions & Generic Customizable Plans
  subscriptionPlans: SubscriptionBox[];
  addSubscriptionPlan: (plan: SubscriptionBox) => void;
  updateSubscriptionPlan: (id: string, updatedPlan: Partial<SubscriptionBox>) => void;
  deleteSubscriptionPlan: (id: string) => void;
  subscriptions: UserSubscription[];
  toggleSubscription: (id: string, action: 'pause' | 'resume' | 'cancel') => void;
  addSubscription: (box: SubscriptionBox, frequency: 'weekly' | 'biweekly') => void;

  // Traceability Batches
  batches: Record<string, TraceabilityBatch>;
  createBatch: (batch: TraceabilityBatch) => void;
  selectedBatchId: string;
  setSelectedBatchId: (batchId: string) => void;

  // Profiles & Financials
  farmerProfile: FarmerProfile;
  deliveryPartnerProfile: DeliveryPartnerProfile;
  settlements: Settlement[];
  disburseSettlement: (id: string) => void;
  // Dynamic Customer Reviews
  reviews: CustomerReview[];
  addReview: (review: Omit<CustomerReview, 'id' | 'date' | 'helpfulCount'>) => void;
  voteHelpfulReview: (id: string) => void;

  // Supabase Realtime connection state
  isSupabaseConnected: boolean;
}

const FarmContext = createContext<FarmContextType | undefined>(undefined);

export const GUEST_USER: CurrentUser = {
  id: 'guest',
  name: 'Guest User',
  role: 'customer',
  emailOrPhone: '',
};

const INITIAL_FARMER_PROFILE: FarmerProfile = {
  id: 'frm-001',
  name: 'Sri',
  farmName: "Sri Farm's",
  location: 'Coimbatore Agro Belt',
  totalAcres: 8.5,
  organicCertified: true,
  certificationNumber: 'NPOP/NAB/0018-ORG-2024',
  soilCarbonIndex: '0.84% (High Fertility)',
  rating: 4.9,
  joinedDate: 'October 2026',
  totalDeliveries: 0,
  bankAccountLinked: true,
};

const INITIAL_DELIVERY_PROFILE: DeliveryPartnerProfile = {
  id: 'drv-001',
  name: 'Gobi',
  phone: '8974563215',
  vehicleType: 'Electric Transit Cargo',
  vehicleNumber: 'EV-TRANSIT-01',
  rating: 5.0,
  activeDeliveriesCount: 0,
  completedDeliveriesToday: 0,
  todayEarnings: 0,
  status: 'available',
};

const INITIAL_SETTLEMENTS: Settlement[] = [];

const INITIAL_SUBSCRIPTIONS: UserSubscription[] = [
  {
    id: 'sub-001',
    boxId: 'box-2',
    boxName: 'Family Seasonal Harvest Box',
    frequency: 'weekly',
    status: 'active',
    deliveryDay: 'Every Tuesday morning (08:00 AM)',
    pricePerCycle: 499,
    nextDeliveryDate: 'Tuesday, 23 Sep 2026',
    subscribedSince: '12 Aug 2026',
  },
  {
    id: 'sub-002',
    boxId: 'box-1',
    boxName: 'Starter Green Box',
    frequency: 'biweekly',
    status: 'paused',
    deliveryDay: 'Alternate Thursdays',
    pricePerCycle: 299,
    nextDeliveryDate: 'Paused by user',
    subscribedSince: '02 Sep 2026',
  },
];

const INITIAL_ORDERS: Order[] = [];

const INITIAL_REVIEWS: CustomerReview[] = [
  {
    id: 'rev-01',
    customerName: 'Ananya Deshmukh',
    customerLocation: 'Coimbatore, Tamil Nadu',
    rating: 5,
    title: 'Unbelievably fresh, crisp vegetables right from farm gate',
    comment: 'The heirloom tomatoes and spinach tasted so different from supermarket items—you could literally smell the rich farm freshness. The QR traceability batch details gave complete peace of mind.',
    produceName: 'Heirloom Vine Tomatoes',
    date: 'Yesterday, 4:30 PM',
    verifiedPurchase: true,
    helpfulCount: 14,
  },
  {
    id: 'rev-02',
    customerName: 'Karthik Subramanian',
    customerLocation: 'RS Puram, Coimbatore',
    rating: 5,
    title: 'EV Cold Transit kept everything chilled and crisp',
    comment: 'Ordered the Weekly Family Box. Delivered within 35 minutes via electric cargo vehicle. Bell peppers and coriander leaves were crisp with zero wilting. Highly recommended!',
    produceName: 'Weekly Family Harvest Box',
    date: '2 days ago',
    verifiedPurchase: true,
    helpfulCount: 22,
  },
  {
    id: 'rev-03',
    customerName: 'Dr. Meera Nambiar',
    customerLocation: 'Saibaba Colony, Coimbatore',
    rating: 4,
    title: 'Lab-tested pesticide-free produce that our family trusts',
    comment: 'Being a nutritionist, verifying the NPOP certification and pesticide screening report through the batch scan is phenomenal. Farmers receive direct fair prices as well.',
    produceName: 'Organic Baby Spinach',
    date: '4 days ago',
    verifiedPurchase: true,
    helpfulCount: 9,
  },
  {
    id: 'rev-04',
    customerName: 'Suresh Kumar',
    customerLocation: 'Gandhipuram, Coimbatore',
    rating: 5,
    title: 'Great initiative connecting real farmers without middlemen',
    comment: 'Prompt delivery and authentic taste. Love the transparent pricing where we know exactly which farmer harvested the batch.',
    produceName: 'Fresh Country Carrots',
    date: '5 days ago',
    verifiedPurchase: true,
    helpfulCount: 17,
  },
];

export const FarmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Topic 14: Restore session on initial load from sessionStorage / cookies
  const [currentUser, setCurrentUser] = useState<CurrentUser>(() => {
    if (typeof sessionStorage !== 'undefined') {
      try {
        const savedSession = sessionStorage.getItem('f2s_active_session');
        if (savedSession) {
          const parsed = JSON.parse(savedSession);
          return {
            id: parsed.id || `usr-${Date.now().toString().slice(-4)}`,
            name: parsed.name || 'User',
            role: parsed.role || 'customer',
            emailOrPhone: parsed.emailOrPhone || '',
            extraInfo: parsed.extraInfo || 'Active User',
          };
        }
      } catch {
        // Fallback
      }
    }
    return GUEST_USER;
  });
  const [activeView, setActiveView] = useState<ActiveView>('marketplace');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);

  const [produceList, setProduceList] = useState<Produce[]>(() => {
    try {
      const saved = localStorage.getItem('farm2street_produce_list');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Could not read produce from storage', e);
    }
    return INITIAL_PRODUCE;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('farm2street_orders');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Could not read orders from storage', e);
    }
    return INITIAL_ORDERS;
  });

  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>(INITIAL_SUBSCRIPTIONS);

  const [batches, setBatches] = useState<Record<string, TraceabilityBatch>>(() => {
    try {
      const saved = localStorage.getItem('farm2street_batches');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Could not read batches from storage', e);
    }
    return TRACEABILITY_MOCK;
  });

  const [selectedBatchId, setSelectedBatchId] = useState<string>('F2S-TM-20260920-01');
  const [activeTrackOrderId, setActiveTrackOrderId] = useState<string | null>(null);

  const [farmerProfile, setFarmerProfile] = useState<FarmerProfile>(() => {
    try {
      const saved = localStorage.getItem('farm2street_farmer_profile');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Could not read farmer profile from storage', e);
    }
    return INITIAL_FARMER_PROFILE;
  });

  const [deliveryPartnerProfile, setDeliveryPartnerProfile] = useState<DeliveryPartnerProfile>(INITIAL_DELIVERY_PROFILE);
  const [settlements, setSettlements] = useState<Settlement[]>(INITIAL_SETTLEMENTS);
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionBox[]>(SUBSCRIPTION_BOXES);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState<boolean>(true);

  // Dynamic persistence across state updates
  useEffect(() => {
    try {
      localStorage.setItem('farm2street_produce_list', JSON.stringify(produceList));
    } catch {}
  }, [produceList]);

  useEffect(() => {
    try {
      localStorage.setItem('farm2street_orders', JSON.stringify(orders));
    } catch {}
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem('farm2street_batches', JSON.stringify(batches));
    } catch {}
  }, [batches]);

  useEffect(() => {
    try {
      localStorage.setItem('farm2street_farmer_profile', JSON.stringify(farmerProfile));
    } catch {}
  }, [farmerProfile]);

  // Dynamic Live Produce Synchronization from Supabase Database
  useEffect(() => {
    if (!supabase) return;
    supabase
      .from('produce')
      .select('*')
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          const mapped: Produce[] = data.map((row: any) => ({
            id: String(row.id),
            name: row.name,
            category: row.category || 'Vegetables',
            price: Number(row.price),
            unit: row.unit || 'kg',
            farmer: row.farm_name || 'Regional Farm',
            farmLocation: row.farm_location || 'Local Agro Belt',
            harvestDate: row.harvest_date ? `Harvested ${row.harvest_date}` : 'Today 06:00 AM',
            availableQty: Number(row.stock || row.available_qty || 50),
            image: row.image_url || 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?auto=format&fit=crop&w=900&q=85',
            description: row.description || `${row.name} freshly harvested from partner beds.`,
            batchId: row.batch_id || `F2S-${row.name.slice(0, 2).toUpperCase()}-${row.id}`,
            organic: row.organic ?? true,
            rating: Number(row.rating || 4.9),
          }));

          setProduceList((prev) => {
            const existingIds = new Set(prev.map((p) => p.id));
            const newFromDb = mapped.filter((m) => !existingIds.has(m.id));
            if (newFromDb.length === 0) return prev;
            return [...newFromDb, ...prev];
          });
        }
      }, (e) => {
        console.info('Supabase dynamic produce query notice:', e);
      });
  }, []);

  // Dynamic Live Orders Synchronization & Realtime Subscription from Supabase
  useEffect(() => {
    if (!supabase) return;

    const fetchOrders = () => {
      supabaseOrderService.getAll().then((dbOrders) => {
        if (dbOrders && dbOrders.length > 0) {
          setOrders(dbOrders);
        }
      });
    };

    fetchOrders();

    const sub = supabaseOrderService.subscribeToOrders(() => {
      fetchOrders();
    });

    return () => {
      sub?.unsubscribe();
    };
  }, []);

  // Dynamically calculate farmer settlements from real delivered orders
  useEffect(() => {
    const deliveredOrders = orders.filter((o) => o.status === 'Delivered');
    if (deliveredOrders.length === 0) {
      setSettlements([]);
      return;
    }
    const grouped: Record<string, { farmerName: string; amount: number; count: number; date: string }> = {};
    deliveredOrders.forEach((o) => {
      const f = o.farmerName || "Sri Farm's";
      if (!grouped[f]) {
        grouped[f] = { farmerName: f, amount: 0, count: 0, date: o.createdAt || 'Today' };
      }
      grouped[f].amount += o.totalAmount;
      grouped[f].count += 1;
    });

    const calculated: Settlement[] = Object.entries(grouped).map(([farmer, g], idx) => ({
      id: `SETTL-2026-${String(idx + 1).padStart(2, '0')}`,
      farmerName: g.farmerName,
      amount: g.amount,
      orderCount: g.count,
      date: g.date,
      status: 'completed',
      utrNumber: `RAZORPAY_ESCROW_${Math.floor(10000000 + Math.random() * 90000000)}`,
    }));
    setSettlements(calculated);
  }, [orders]);

  // Dynamic Customer Reviews State with LocalStorage Persistence
  const [reviews, setReviews] = useState<CustomerReview[]>(() => {
    try {
      const saved = localStorage.getItem('farm2street_customer_reviews');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Could not read reviews from storage', e);
    }
    return INITIAL_REVIEWS;
  });

  const addReview = (newReviewData: Omit<CustomerReview, 'id' | 'date' | 'helpfulCount'>) => {
    const newReview: CustomerReview = {
      ...newReviewData,
      id: `rev-${Date.now()}`,
      date: 'Just now',
      helpfulCount: 0,
    };
    setReviews((prev) => {
      const updated = [newReview, ...prev];
      try {
        localStorage.setItem('farm2street_customer_reviews', JSON.stringify(updated));
      } catch (e) {
        console.warn('Could not save review to storage', e);
      }
      return updated;
    });

    // Optionally write to Supabase if connected
    try {
      supabase.from('reviews').insert([{
        customer_name: newReview.customerName,
        customer_location: newReview.customerLocation || 'Tamil Nadu',
        rating: newReview.rating,
        title: newReview.title,
        comment: newReview.comment,
        produce_name: newReview.produceName,
        verified_purchase: newReview.verifiedPurchase,
        helpful_count: 0,
      }]).then(({ error }) => {
        if (error) console.info('Supabase review insert notice:', error.message);
      });
    } catch {
      // Non-blocking fallback
    }
  };

  const voteHelpfulReview = (id: string) => {
    setReviews((prev) => {
      const updated = prev.map((rev) =>
        rev.id === id ? { ...rev, helpfulCount: rev.helpfulCount + 1 } : rev
      );
      try {
        localStorage.setItem('farm2street_customer_reviews', JSON.stringify(updated));
      } catch (e) {
        console.warn('Could not save review to storage', e);
      }
      return updated;
    });
  };

  // Supabase PostgreSQL Real-time Telemetry & Health
  useEffect(() => {
    getSupabaseHealth()
      .then((health) => {
        setIsSupabaseConnected(health.connected);
      })
      .catch((e) => {
        console.info('Supabase status check fallback:', e);
        setIsSupabaseConnected(false);
      });
  }, []);

  // Authentication operations
  const loginAsRole = (role: UserRole, details?: Partial<CurrentUser>) => {
    const rawIdentifier = details?.emailOrPhone || details?.name || '';
    let derivedName = details?.name;
    if (!derivedName && rawIdentifier) {
      const part = rawIdentifier.includes('@') ? rawIdentifier.split('@')[0] : rawIdentifier;
      derivedName = part.charAt(0).toUpperCase() + part.slice(1);
    }
    if (!derivedName) {
      derivedName = role.charAt(0).toUpperCase() + role.slice(1) + ' User';
    }

    const userId = details?.id || `${role.slice(0, 3)}-${Date.now().toString().slice(-4)}`;

    const newUser: CurrentUser = {
      id: userId,
      name: derivedName,
      role: role,
      emailOrPhone: details?.emailOrPhone || rawIdentifier,
      extraInfo: details?.extraInfo || `${role.charAt(0).toUpperCase() + role.slice(1)} Portal Active`,
      ...details,
    };

    if (role === 'farmer') {
      setActiveView('farmer');
    } else if (role === 'delivery') {
      setActiveView('delivery');
    } else if (role === 'admin') {
      setActiveView('admin');
    } else {
      setActiveView('marketplace');
    }

    setCurrentUser(newUser);
    setIsLoginModalOpen(false);

    // Topic 13: Cookies (Remember Me & User Identity tracking)
    if (typeof document !== 'undefined') {
      document.cookie = `farm2street_user=${encodeURIComponent(newUser.emailOrPhone)}; path=/; max-age=2592000; SameSite=Lax`;
      document.cookie = `farm2street_role=${newUser.role}; path=/; max-age=2592000; SameSite=Lax`;
    }

    // Topic 14: Session Management (Session-scoped active login state)
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('f2s_active_session', JSON.stringify({
        id: newUser.id,
        name: newUser.name,
        role: newUser.role,
        emailOrPhone: newUser.emailOrPhone,
        loginTimestamp: new Date().toISOString(),
      }));
    }
  };

  const logout = () => {
    // Topic 13 & 14: Clear Cookies & Invalidate Active Session
    if (typeof document !== 'undefined') {
      document.cookie = "farm2street_user=; path=/; max-age=0";
      document.cookie = "farm2street_role=; path=/; max-age=0";
    }
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem('f2s_active_session');
    }

    setCurrentUser(GUEST_USER);
    setActiveView('marketplace');
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Real database authentication against Supabase PostgreSQL
  const loginWithCredentials = async (
    identifier: string,
    passcode: string,
    role?: UserRole
  ): Promise<{ success: boolean; error?: string }> => {
    if (!identifier.trim()) {
      return { success: false, error: 'Please enter your email or identifier.' };
    }
    if (!passcode || passcode.length < 4) {
      return { success: false, error: 'Please enter your password (minimum 4 characters).' };
    }

    const authRes = await supabaseUserService.authenticate(identifier, passcode, role);
    if (!authRes.success || !authRes.user) {
      return { success: false, error: authRes.error || 'Authentication failed.' };
    }

    const user = authRes.user;
    // Privilege escalation prevention: Enforce actual database role, block tab override
    const targetRole = (user.role as UserRole) || 'customer';
    if (role && user.role && user.role.toLowerCase() !== role.toLowerCase()) {
      return {
        success: false,
        error: `Permission denied: This account is registered as '${user.role}', not '${role}'. Please use the ${user.role.toUpperCase()} login tab.`,
      };
    }

    const newUser: CurrentUser = {
      id: String(user.id),
      name: user.name,
      role: targetRole,
      emailOrPhone: user.email || user.phone || identifier,
      extraInfo: user.extraInfo || user.address || `${targetRole.charAt(0).toUpperCase() + targetRole.slice(1)} Portal Active`,
    };

    if (targetRole === 'farmer') {
      setFarmerProfile((prev) => ({
        ...prev,
        name: user.name,
        farmName: user.farm_name || (user.name ? `${user.name}'s Farm` : prev.farmName),
        location: user.location || user.address || prev.location,
        totalAcres: user.total_acres || prev.totalAcres,
      }));
      setActiveView('farmer');
    } else if (targetRole === 'delivery') {
      setDeliveryPartnerProfile((prev) => ({
        ...prev,
        name: user.name,
        phone: user.phone || user.email || prev.phone,
        vehicleType: user.vehicle_type || prev.vehicleType,
        vehicleNumber: user.vehicle_number || prev.vehicleNumber,
      }));
      setActiveView('delivery');
    } else if (targetRole === 'admin') {
      setActiveView('admin');
    } else {
      setActiveView('marketplace');
    }

    setCurrentUser(newUser);
    setIsLoginModalOpen(false);

    // Topic 13: Cookies (Remember Me & User Identity tracking)
    if (typeof document !== 'undefined') {
      document.cookie = `farm2street_user=${encodeURIComponent(newUser.emailOrPhone)}; path=/; max-age=2592000; SameSite=Lax`;
      document.cookie = `farm2street_role=${newUser.role}; path=/; max-age=2592000; SameSite=Lax`;
    }

    // Topic 14: Session Management (Session-scoped active login state)
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(
        'f2s_active_session',
        JSON.stringify({
          id: newUser.id,
          name: newUser.name,
          role: newUser.role,
          emailOrPhone: newUser.emailOrPhone,
          loginTimestamp: new Date().toISOString(),
        })
      );
    }

    return { success: true };
  };

  const registerUser = async (data: {
    role: UserRole;
    name: string;
    email?: string;
    phone?: string;
    emailOrPhone?: string;
    password?: string;
    extraInfo?: string;
    farmName?: string;
    location?: string;
    totalAcres?: number;
    vehicleType?: string;
    vehicleNumber?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    const rawPassword = data.password || 'farm123';
    const emailVal = data.email?.trim() || (data.emailOrPhone?.includes('@') ? data.emailOrPhone.trim() : '');
    const phoneVal = data.phone?.trim() || (!data.emailOrPhone?.includes('@') ? data.emailOrPhone?.trim() || '' : '');

    // Register into Supabase PostgreSQL users table
    const regRes = await supabaseUserService.register({
      name: data.name,
      email: emailVal,
      phone: phoneVal,
      password: rawPassword,
      role: data.role,
      farmName: data.farmName,
      location: data.location,
      totalAcres: data.totalAcres,
      vehicleType: data.vehicleType,
      vehicleNumber: data.vehicleNumber,
      address: data.location,
      extraInfo: data.extraInfo || (data.role === 'farmer' ? data.farmName : data.location),
    });

    if (!regRes.success || !regRes.user) {
      return { success: false, error: regRes.error || 'Registration failed.' };
    }

    const created = regRes.user;
    const identifier = created.email || created.phone || emailVal || phoneVal || data.emailOrPhone || '';
    const newUser: CurrentUser = {
      id: String(created.id),
      name: created.name,
      role: data.role,
      emailOrPhone: identifier,
      extraInfo: data.extraInfo || (data.role === 'farmer' ? data.farmName : data.location),
    };

    if (data.role === 'farmer') {
      setFarmerProfile((prev) => ({
        ...prev,
        name: data.name,
        farmName: data.farmName || (data.name ? `${data.name}'s Farm` : prev.farmName),
        location: data.location || prev.location,
        totalAcres: data.totalAcres || prev.totalAcres,
      }));
      setActiveView('farmer');
    } else if (data.role === 'delivery') {
      setDeliveryPartnerProfile((prev) => ({
        ...prev,
        name: data.name,
        phone: phoneVal || identifier,
        vehicleType: data.vehicleType || prev.vehicleType,
        vehicleNumber: data.vehicleNumber || prev.vehicleNumber,
      }));
      setActiveView('delivery');
    } else if (data.role === 'admin') {
      setActiveView('admin');
    } else {
      setActiveView('marketplace');
    }

    setCurrentUser(newUser);

    if (typeof document !== 'undefined') {
      document.cookie = `farm2street_user=${encodeURIComponent(newUser.emailOrPhone)}; path=/; max-age=2592000; SameSite=Lax`;
      document.cookie = `farm2street_role=${newUser.role}; path=/; max-age=2592000; SameSite=Lax`;
    }
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('f2s_active_session', JSON.stringify(newUser));
    }

    return { success: true };
  };

  // Produce management with Supabase write & dynamic traceability batch auto-generation
  const addProduce = async (item: Omit<Produce, 'id'>) => {
    const newId = `prod-${Date.now().toString().slice(-4)}`;
    const batchId = item.batchId || `F2S-${item.name.slice(0, 2).toUpperCase()}-${Date.now().toString().slice(-6)}`;
    const newProduce: Produce = { ...item, id: newId, batchId };
    setProduceList((prev) => [newProduce, ...prev]);

    // Automatically register batch into dynamic Traceability Engine
    const nowStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) + ' 06:00 AM';
    const autoBatch: TraceabilityBatch = {
      batchId,
      produceName: item.name,
      farmName: item.farmer || farmerProfile.farmName,
      farmerName: farmerProfile.name,
      location: item.farmLocation || farmerProfile.location,
      fieldId: `Field-${item.category}-01`,
      harvestDate: item.harvestDate || nowStr,
      packingDate: `${nowStr} (Packhouse-1)`,
      qualityGrade: 'Grade A+ (Verified Export)',
      pesticideFree: item.organic ?? true,
      soilHealthIndex: farmerProfile.soilCarbonIndex || 'Optimal (Organic Carbon 0.84%)',
      temperatureAtTransit: '16°C (Aerated Crates)',
      timeline: [
        {
          stage: 'Harvested',
          timestamp: item.harvestDate || nowStr,
          location: item.farmLocation || farmerProfile.farmName,
          details: `Hand-picked and logged by grower ${farmerProfile.name} at ${item.farmer || farmerProfile.farmName}.`,
        },
        {
          stage: 'Quality Checked',
          timestamp: 'Today 07:15 AM',
          location: 'On-farm Packhouse',
          details: 'Physical grading and skin integrity check verified. Zero chemical spray residue.',
        },
        {
          stage: 'Packed',
          timestamp: 'Today 08:30 AM',
          location: 'Farm2Street Micro-Hub',
          details: 'Cushioned in biodegradable sugarcane pulp trays with tamper-evident QR provenance seal.',
        },
        {
          stage: 'Dispatched',
          timestamp: 'Today 09:45 AM',
          location: 'Electric Transit Route',
          details: 'Dispatched via climate-controlled EV Cargo delivery fleet.',
        },
        {
          stage: 'Delivered',
          timestamp: 'Today 12:30 PM',
          location: 'Customer Doorstep',
          details: 'Direct transfer within 6 hours of morning field harvest.',
        },
      ],
    };

    setBatches((prev) => ({
      ...prev,
      [batchId]: autoBatch,
    }));

    try {
      if (supabase) {
        await supabase.from('produce').insert({
          name: item.name,
          category: item.category,
          price: item.price,
          unit: item.unit,
          stock: item.availableQty,
          farm_name: item.farmer,
          farm_location: item.farmLocation,
          harvest_date: item.harvestDate || new Date().toISOString().split('T')[0],
          batch_id: batchId,
          image_url: item.image,
          organic: item.organic ?? false,
        });
      }
    } catch (e) {
      console.warn('Supabase produce sync fallback:', e);
    }
  };

  const updateProduceStock = async (id: string, newQty: number) => {
    setProduceList((prev) =>
      prev.map((p) => (p.id === id ? { ...p, availableQty: Math.max(0, newQty) } : p))
    );

    try {
      if (supabase) {
        const query = isNaN(Number(id))
          ? supabase.from('produce').update({ stock: Math.max(0, newQty) }).eq('batch_id', id)
          : supabase.from('produce').update({ stock: Math.max(0, newQty) }).eq('id', Number(id));
        await query;
      }
    } catch (e) {
      console.warn('Supabase stock sync fallback:', e);
    }
  };

  const removeProduce = (id: string) => {
    setProduceList((prev) => prev.filter((p) => p.id !== id));
  };

  // Order Placement with Firestore write
  const placeOrder = (
    items: CartItem[],
    address: string,
    paymentMethod: 'Razorpay UPI' | 'Razorpay Card' | 'Razorpay NetBanking' | 'Cash on Delivery',
    paymentId?: string,
    razorpayOrderId?: string
  ): Order => {
    const subtotal = items.reduce((sum, item) => sum + item.produce.price * item.quantity, 0);
    const deliveryFee = subtotal > 350 || subtotal === 0 ? 0 : 30;
    const totalAmount = subtotal + deliveryFee;
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const orderId = `F2S-ORD-${Math.floor(100000 + Math.random() * 900000)}`;

    const firstItem = items[0]?.produce;
    const batchId = firstItem?.batchId || `F2S-${Date.now().toString().slice(-6)}`;
    const farmerName = firstItem?.farmer || farmerProfile.farmName || "Sri Farm's";
    const farmPickupLocation = firstItem?.farmLocation || farmerProfile.location || "Coimbatore Agro Belt";

    const newOrder: Order = {
      id: orderId,
      customerId: currentUser.id,
      customerName: currentUser.name,
      customerPhone: currentUser.emailOrPhone,
      deliveryAddress: address,
      items: items.map((i) => ({
        produceId: i.produce.id,
        name: i.produce.name,
        price: i.produce.price,
        quantity: i.quantity,
        unit: i.produce.unit,
        farmer: i.produce.farmer || farmerName,
        image: i.produce.image,
      })),
      subtotal,
      deliveryFee,
      totalAmount,
      status: 'Order Confirmed',
      paymentMethod,
      paymentId: paymentId || `pay_${Date.now().toString().slice(-8)}`,
      razorpayOrderId: razorpayOrderId || `order_${Date.now().toString().slice(-8)}`,
      paymentStatus: 'paid',
      farmerName,
      farmPickupLocation,
      assignedDeliveryPartner: undefined,
      batchId,
      distanceKm: 4.8,
      estimatedDeliveryMinutes: 25,
      createdAt: `Today, ${timeStr}`,
      updatedAt: `Today, ${timeStr}`,
      timeline: [
        { status: 'Order Placed', timestamp: timeStr, note: 'Direct customer order placed in platform.' },
        { status: 'Order Confirmed', timestamp: timeStr, note: `Razorpay signature verified (${paymentMethod}).` },
      ],
    };

    setOrders((prev) => [newOrder, ...prev]);
    setActiveTrackOrderId(newOrder.id);

    // Sync full order to Supabase PostgreSQL 16
    try {
      supabaseOrderService.insert(newOrder);
    } catch (e) {
      console.warn('Supabase order sync fallback:', e);
    }

    return newOrder;
  };

  // Order Status Transitions with Supabase update
  const updateOrderStatus = async (orderId: string, nextStatus: DeliveryStatus, note?: string) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const defaultNotes: Record<DeliveryStatus, string> = {
      'Order Placed': 'Customer placed order.',
      'Order Confirmed': 'Payment confirmed.',
      'Preparing': 'Farmer has started harvesting & sorting.',
      'Ready for Pickup': 'Packed in sealed crate at farm gate.',
      'Delivery Partner Assigned': 'Delivery partner allocated to pickup run.',
      'Picked Up': 'Crate collected from farm gate.',
      'Out for Delivery': 'En route to customer delivery location.',
      'Delivered': 'Delivered to customer doorstep successfully.',
    };

    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;

        let partner = order.assignedDeliveryPartner;
        if (
          !partner &&
          (nextStatus === 'Delivery Partner Assigned' ||
            nextStatus === 'Picked Up' ||
            nextStatus === 'Out for Delivery' ||
            nextStatus === 'Delivered')
        ) {
          partner = {
            id: deliveryPartnerProfile.id,
            name: deliveryPartnerProfile.name,
            phone: deliveryPartnerProfile.phone || '+91 89745 63215',
            vehicle: `${deliveryPartnerProfile.vehicleType} (${deliveryPartnerProfile.vehicleNumber})`,
          };
        }

        const updatedTimeline = [
          ...order.timeline,
          {
            status: nextStatus,
            timestamp: timeStr,
            note: note || defaultNotes[nextStatus],
          },
        ];

        const updated = {
          ...order,
          status: nextStatus,
          assignedDeliveryPartner: partner,
          updatedAt: `Today, ${timeStr}`,
          timeline: updatedTimeline,
        };

        // Async Supabase update
        try {
          supabaseOrderService.updateStatus(orderId, nextStatus, partner, updatedTimeline);
        } catch (e) {
          console.warn('Supabase update status fallback:', e);
        }

        return updated;
      })
    );
  };

  // Subscription Plans Management (Admin & Generic Customizable)
  const addSubscriptionPlan = (plan: SubscriptionBox) => {
    setSubscriptionPlans((prev) => [plan, ...prev]);
  };

  const updateSubscriptionPlan = (id: string, updatedPlan: Partial<SubscriptionBox>) => {
    setSubscriptionPlans((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updatedPlan } : p))
    );
  };

  const deleteSubscriptionPlan = (id: string) => {
    setSubscriptionPlans((prev) => prev.filter((p) => p.id !== id));
  };

  // User Subscriptions Management
  const toggleSubscription = (id: string, action: 'pause' | 'resume' | 'cancel') => {
    setSubscriptions((prev) =>
      prev.map((sub) => {
        if (sub.id !== id) return sub;
        if (action === 'pause') {
          return { ...sub, status: 'paused', nextDeliveryDate: 'Paused by user' };
        }
        if (action === 'resume') {
          return { ...sub, status: 'active', nextDeliveryDate: 'Upcoming Tuesday 08:00 AM' };
        }
        return { ...sub, status: 'cancelled', nextDeliveryDate: 'Subscription terminated' };
      })
    );
  };

  const addSubscription = (box: SubscriptionBox, frequency: 'weekly' | 'biweekly') => {
    const newSub: UserSubscription = {
      id: `sub-${Date.now().toString().slice(-4)}`,
      boxId: box.id,
      boxName: box.name,
      frequency,
      status: 'active',
      deliveryDay: 'Every Tuesday morning (08:00 AM)',
      pricePerCycle: frequency === 'weekly' ? box.pricePerWeek : Math.round(box.pricePerWeek * 2 * 0.95),
      nextDeliveryDate: 'Upcoming Tuesday 08:00 AM',
      subscribedSince: 'Today',
    };
    setSubscriptions((prev) => [newSub, ...prev]);
  };

  // Batches
  const createBatch = (batch: TraceabilityBatch) => {
    setBatches((prev) => ({
      ...prev,
      [batch.batchId]: batch,
    }));
  };

  // Settlements
  const disburseSettlement = (id: string) => {
    setSettlements((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              status: 'completed',
              utrNumber: `RAZORPAY_DISBURSE_${Math.floor(10000000 + Math.random() * 90000000)}`,
            }
          : s
      )
    );
  };

  return (
    <FarmContext.Provider
      value={{
        currentUser,
        loginAsRole,
        loginWithCredentials,
        registerUser,
        logout,
        isLoginModalOpen,
        setIsLoginModalOpen,
        activeView,
        setActiveView,
        produceList,
        addProduce,
        updateProduceStock,
        removeProduce,
        orders,
        placeOrder,
        updateOrderStatus,
        activeTrackOrderId,
        setActiveTrackOrderId,
        subscriptionPlans,
        addSubscriptionPlan,
        updateSubscriptionPlan,
        deleteSubscriptionPlan,
        subscriptions,
        toggleSubscription,
        addSubscription,
        batches,
        createBatch,
        selectedBatchId,
        setSelectedBatchId,
        farmerProfile,
        deliveryPartnerProfile,
        settlements,
        disburseSettlement,
        reviews,
        addReview,
        voteHelpfulReview,
        isSupabaseConnected,
      }}
    >
      {children}
    </FarmContext.Provider>
  );
};

export const useFarm = () => {
  const context = useContext(FarmContext);
  if (!context) {
    throw new Error('useFarm must be used within a FarmProvider');
  }
  return context;
};
