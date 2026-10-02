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
import { supabase, getSupabaseHealth, supabaseUserService, SupabaseUser } from '../lib/supabase';

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
    emailOrPhone: string;
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
  name: 'Ramesh Patel',
  farmName: 'Green Valley Organic Farms',
  location: 'Sector 4, Certified Organic Agro-Belt',
  totalAcres: 8.5,
  organicCertified: true,
  certificationNumber: 'NPOP/NAB/0018-ORG-2024',
  soilCarbonIndex: '0.84% (High Fertility)',
  rating: 4.9,
  joinedDate: 'March 2024',
  totalDeliveries: 420,
  bankAccountLinked: true,
};

const INITIAL_DELIVERY_PROFILE: DeliveryPartnerProfile = {
  id: 'drv-004',
  name: 'Vikas Shinde',
  phone: '+91 98230 44812',
  vehicleType: 'Electric Cargo Scooter (Ather 450X)',
  vehicleNumber: 'EV-CARGO-4892',
  rating: 4.92,
  activeDeliveriesCount: 2,
  completedDeliveriesToday: 6,
  todayEarnings: 840,
  status: 'available',
};

const INITIAL_SETTLEMENTS: Settlement[] = [
  {
    id: 'SETTL-2026-09-01',
    farmerName: 'Ramesh Patel',
    amount: 14250,
    orderCount: 38,
    date: '2026-09-18',
    status: 'completed',
    utrNumber: 'HDFC000192847291',
  },
  {
    id: 'SETTL-2026-09-02',
    farmerName: 'Anandi Devi',
    amount: 8900,
    orderCount: 24,
    date: '2026-09-19',
    status: 'completed',
    utrNumber: 'SBIN000847291844',
  },
  {
    id: 'SETTL-2026-09-03',
    farmerName: 'Ramesh Patel',
    amount: 6380,
    orderCount: 16,
    date: '2026-09-21',
    status: 'processing',
    utrNumber: 'PENDING_DISBURSEMENT',
  },
];

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

const INITIAL_ORDERS: Order[] = [
  {
    id: 'F2S-ORD-849201',
    customerId: 'cust-101',
    customerName: 'Verified Member',
    customerPhone: '+91 98812 77410',
    deliveryAddress: 'Green Acre Heights, Central City Enclave',
    items: [
      {
        produceId: 'prod-1',
        name: 'Heirloom Vine Tomatoes',
        price: 45,
        quantity: 2,
        unit: 'kg',
        farmer: 'Green Valley Farm',
      },
      {
        produceId: 'prod-4',
        name: 'Tender Malabar Spinach',
        price: 25,
        quantity: 2,
        unit: 'bunch',
        farmer: 'Green Valley Farm',
      },
    ],
    subtotal: 140,
    deliveryFee: 30,
    totalAmount: 170,
    status: 'Out for Delivery',
    paymentMethod: 'Razorpay UPI',
    paymentId: 'pay_Pq89f2X1M90',
    razorpayOrderId: 'order_Pq89e09KL2',
    paymentStatus: 'paid',
    farmerName: 'Green Valley Farm (Ramesh Patel)',
    farmPickupLocation: 'Sector 4, Certified Organic Agro-Belt',
    assignedDeliveryPartner: {
      id: 'drv-004',
      name: 'Vikas Shinde',
      phone: '+91 98230 44812',
      vehicle: 'Electric Cargo EV (EV-CARGO-4892)',
    },
    batchId: 'F2S-TM-20260920-01',
    distanceKm: 18.4,
    estimatedDeliveryMinutes: 22,
    createdAt: 'Today, 07:15 AM',
    updatedAt: 'Today, 09:40 AM',
    timeline: [
      { status: 'Order Placed', timestamp: '07:15 AM', note: 'Customer completed order on portal.' },
      { status: 'Order Confirmed', timestamp: '07:16 AM', note: 'Razorpay payment verified (pay_Pq89f2X1M90).' },
      { status: 'Preparing', timestamp: '07:30 AM', note: 'Ramesh Patel harvested and packed produce.' },
      { status: 'Ready for Pickup', timestamp: '08:15 AM', note: 'Sealed crate ready at farm gate.' },
      { status: 'Delivery Partner Assigned', timestamp: '08:20 AM', note: 'Vikas Shinde assigned via routing service.' },
      { status: 'Picked Up', timestamp: '08:45 AM', note: 'Order collected from farm gate.' },
      { status: 'Out for Delivery', timestamp: '09:20 AM', note: 'Driver approaching customer destination (ETA 22 mins).' },
    ],
  },
  {
    id: 'F2S-ORD-849202',
    customerId: 'cust-102',
    customerName: 'Aditya Deshmukh',
    customerPhone: '+91 97654 32109',
    deliveryAddress: 'Row House 12, Parkside Residential Enclave',
    items: [
      {
        produceId: 'prod-6',
        name: 'Bell Peppers',
        price: 80,
        quantity: 1,
        unit: 'kg',
        farmer: 'Green Valley Farm',
      },
      {
        produceId: 'prod-3',
        name: 'Green Beans',
        price: 60,
        quantity: 1,
        unit: 'kg',
        farmer: 'Green Valley Farm',
      },
    ],
    subtotal: 140,
    deliveryFee: 30,
    totalAmount: 170,
    status: 'Ready for Pickup',
    paymentMethod: 'Razorpay Card',
    paymentId: 'pay_K992xJ290',
    razorpayOrderId: 'order_K992e881',
    paymentStatus: 'paid',
    farmerName: 'Green Valley Farm (Ramesh Patel)',
    farmPickupLocation: 'Sector 4, Certified Organic Agro-Belt',
    assignedDeliveryPartner: {
      id: 'drv-004',
      name: 'Vikas Shinde',
      phone: '+91 98230 44812',
      vehicle: 'Electric Cargo EV (EV-CARGO-4892)',
    },
    batchId: 'F2S-BP-20260920-05',
    distanceKm: 21.0,
    estimatedDeliveryMinutes: 45,
    createdAt: 'Today, 08:00 AM',
    updatedAt: 'Today, 08:45 AM',
    timeline: [
      { status: 'Order Placed', timestamp: '08:00 AM', note: 'Customer completed order on portal.' },
      { status: 'Order Confirmed', timestamp: '08:01 AM', note: 'Razorpay Card payment verified.' },
      { status: 'Preparing', timestamp: '08:15 AM', note: 'Farmer packaged and sealed batch.' },
      { status: 'Ready for Pickup', timestamp: '08:45 AM', note: 'Crate sealed with QR label ready at farm.' },
    ],
  },
];

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

  const [produceList, setProduceList] = useState<Produce[]>(INITIAL_PRODUCE);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>(INITIAL_SUBSCRIPTIONS);
  const [batches, setBatches] = useState<Record<string, TraceabilityBatch>>(TRACEABILITY_MOCK);
  const [selectedBatchId, setSelectedBatchId] = useState<string>('F2S-TM-20260920-01');
  const [activeTrackOrderId, setActiveTrackOrderId] = useState<string | null>('F2S-ORD-849201');
  const [farmerProfile, setFarmerProfile] = useState<FarmerProfile>(INITIAL_FARMER_PROFILE);
  const [deliveryPartnerProfile, setDeliveryPartnerProfile] = useState<DeliveryPartnerProfile>(INITIAL_DELIVERY_PROFILE);
  const [settlements, setSettlements] = useState<Settlement[]>(INITIAL_SETTLEMENTS);
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionBox[]>(SUBSCRIPTION_BOXES);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState<boolean>(true);

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
    const targetRole = role || user.role || 'customer';

    const newUser: CurrentUser = {
      id: String(user.id),
      name: user.name,
      role: targetRole,
      emailOrPhone: user.email || user.phone || identifier,
      extraInfo: user.extraInfo || user.address || `${targetRole.charAt(0).toUpperCase() + targetRole.slice(1)} Portal Active`,
    };

    if (targetRole === 'farmer') {
      setActiveView('farmer');
    } else if (targetRole === 'delivery') {
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
    emailOrPhone: string;
    password?: string;
    extraInfo?: string;
    farmName?: string;
    location?: string;
    totalAcres?: number;
    vehicleType?: string;
    vehicleNumber?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    const rawPassword = data.password || 'farm123';

    // Register into Supabase PostgreSQL users table
    const regRes = await supabaseUserService.register({
      name: data.name,
      email: data.emailOrPhone,
      password: rawPassword,
      role: data.role,
      phone: data.emailOrPhone.includes('@') ? '' : data.emailOrPhone,
      address: data.location,
      extraInfo: data.extraInfo || (data.role === 'farmer' ? data.farmName : data.location),
    });

    if (!regRes.success || !regRes.user) {
      return { success: false, error: regRes.error || 'Registration failed.' };
    }

    const created = regRes.user;
    const newUser: CurrentUser = {
      id: String(created.id),
      name: created.name,
      role: data.role,
      emailOrPhone: data.emailOrPhone,
      extraInfo: data.extraInfo || (data.role === 'farmer' ? data.farmName : data.location),
    };

    if (data.role === 'farmer') {
      setFarmerProfile((prev) => ({
        ...prev,
        name: data.name,
        farmName: data.farmName || prev.farmName,
        location: data.location || prev.location,
        totalAcres: data.totalAcres || prev.totalAcres,
      }));
      setActiveView('farmer');
    } else if (data.role === 'delivery') {
      setDeliveryPartnerProfile((prev) => ({
        ...prev,
        name: data.name,
        phone: data.emailOrPhone,
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

  // Produce management with Supabase write
  const addProduce = async (item: Omit<Produce, 'id'>) => {
    const newId = `prod-${Date.now().toString().slice(-4)}`;
    const newProduce: Produce = { ...item, id: newId };
    setProduceList((prev) => [newProduce, ...prev]);

    try {
      if (supabase) {
        await supabase.from('produce').insert(newProduce);
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
        await supabase.from('produce').update({ availableQty: Math.max(0, newQty) });
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
    const batchId = firstItem?.batchId || 'F2S-TM-20260920-01';
    const farmerName = firstItem?.farmer || 'Green Valley Organic Farms';
    const farmPickupLocation = firstItem?.farmLocation || 'Valley Agro Belt';

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
        farmer: i.produce.farmer,
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
      assignedDeliveryPartner: {
        id: 'drv-004',
        name: 'Vikas Shinde',
        phone: '+91 98230 44812',
        vehicle: 'Electric Cargo Scooter (MH 12 ET 4892)',
      },
      batchId,
      distanceKm: 16.5,
      estimatedDeliveryMinutes: 40,
      createdAt: `Today, ${timeStr}`,
      updatedAt: `Today, ${timeStr}`,
      timeline: [
        { status: 'Order Placed', timestamp: timeStr, note: 'Order placed by customer.' },
        { status: 'Order Confirmed', timestamp: timeStr, note: `Razorpay signature verified (${paymentMethod}).` },
      ],
    };

    setOrders((prev) => [newOrder, ...prev]);
    setActiveTrackOrderId(newOrder.id);

    // Sync to Supabase PostgreSQL 16
    try {
      if (supabase) {
        supabase
          .from('orders')
          .insert(newOrder)
          .then(({ error }) => {
            if (error) console.warn('Supabase order write caught:', error);
          });
      }
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
      'Delivery Partner Assigned': 'Driver allocated to pickup run.',
      'Picked Up': 'Driver collected crate from farm gate.',
      'Out for Delivery': 'En route to customer delivery location.',
      'Delivered': 'Delivered to customer doorstep successfully.',
    };

    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;

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
          updatedAt: `Today, ${timeStr}`,
          timeline: updatedTimeline,
        };

        // Async Supabase update
        try {
          if (supabase) {
            supabase
              .from('orders')
              .update({
                status: nextStatus,
                updatedAt: updated.updatedAt,
                timeline: updatedTimeline,
              })
              .eq('id', orderId)
              .then(({ error }) => {
                if (error) console.warn('Supabase order update caught:', error);
              });
          }
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
