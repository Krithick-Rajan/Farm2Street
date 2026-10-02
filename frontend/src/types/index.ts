export type UserRole = 'customer' | 'farmer' | 'delivery' | 'admin';

export type DeliveryStatus =
  | 'Order Placed'
  | 'Order Confirmed'
  | 'Preparing'
  | 'Ready for Pickup'
  | 'Delivery Partner Assigned'
  | 'Picked Up'
  | 'Out for Delivery'
  | 'Delivered';

export interface CurrentUser {
  id: string;
  name: string;
  role: UserRole;
  emailOrPhone: string;
  avatar?: string;
  extraInfo?: string;
}

export interface Produce {
  id: string;
  name: string;
  category: 'Vegetables' | 'Greens' | 'Root' | 'Exotic';
  price: number;
  unit: string;
  farmer: string;
  farmLocation: string;
  harvestDate: string;
  availableQty: number;
  image: string;
  description: string;
  batchId: string;
  organic: boolean;
  rating: number;
}

export interface CartItem {
  produce: Produce;
  quantity: number;
}

export interface SubscriptionBox {
  id: string;
  name: string;
  tagline: string;
  pricePerWeek: number;
  weightApprox: string;
  suitableFor: string;
  itemsIncluded: string[];
  popular?: boolean;
  tierCategory?: 'personal' | 'business';
  features?: string[];
  badgeText?: string;
  isCustom?: boolean;
}

export interface UserSubscription {
  id: string;
  boxId: string;
  boxName: string;
  frequency: 'weekly' | 'biweekly';
  status: 'active' | 'paused' | 'cancelled';
  deliveryDay: string;
  pricePerCycle: number;
  nextDeliveryDate: string;
  subscribedSince: string;
}

export interface OrderProduceItem {
  produceId: string;
  name: string;
  price: number;
  quantity: number;
  unit: string;
  farmer: string;
  image?: string;
}

export interface OrderTimelineEvent {
  status: DeliveryStatus;
  timestamp: string;
  note: string;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  items: OrderProduceItem[];
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  status: DeliveryStatus;
  paymentMethod: 'Razorpay UPI' | 'Razorpay Card' | 'Razorpay NetBanking' | 'Cash on Delivery';
  paymentId?: string;
  razorpayOrderId?: string;
  paymentStatus: 'paid' | 'pending' | 'failed';
  farmerName: string;
  farmPickupLocation: string;
  assignedDeliveryPartner?: {
    id: string;
    name: string;
    phone: string;
    vehicle: string;
  };
  batchId: string;
  distanceKm: number;
  estimatedDeliveryMinutes: number;
  createdAt: string;
  updatedAt: string;
  timeline: OrderTimelineEvent[];
}

export interface FarmerProfile {
  id: string;
  name: string;
  farmName: string;
  location: string;
  totalAcres: number;
  organicCertified: boolean;
  certificationNumber: string;
  soilCarbonIndex: string;
  rating: number;
  joinedDate: string;
  totalDeliveries: number;
  bankAccountLinked: boolean;
}

export interface DeliveryPartnerProfile {
  id: string;
  name: string;
  phone: string;
  vehicleType: string;
  vehicleNumber: string;
  rating: number;
  activeDeliveriesCount: number;
  completedDeliveriesToday: number;
  todayEarnings: number;
  status: 'available' | 'on_delivery' | 'offline';
}

export interface Settlement {
  id: string;
  farmerName: string;
  amount: number;
  orderCount: number;
  date: string;
  status: 'completed' | 'processing';
  utrNumber: string;
}

export interface TraceabilityTimelineEvent {
  stage: string;
  timestamp: string;
  location: string;
  details: string;
}

export interface TraceabilityBatch {
  batchId: string;
  produceName: string;
  farmName: string;
  farmerName: string;
  location: string;
  fieldId: string;
  harvestDate: string;
  packingDate: string;
  qualityGrade: string;
  pesticideFree: boolean;
  soilHealthIndex: string;
  temperatureAtTransit: string;
  timeline: TraceabilityTimelineEvent[];
}

export interface CustomerReview {
  id: string;
  customerName: string;
  customerLocation?: string;
  rating: number; // 1 to 5
  title: string;
  comment: string;
  produceName?: string;
  date: string;
  verifiedPurchase: boolean;
  helpfulCount: number;
}
