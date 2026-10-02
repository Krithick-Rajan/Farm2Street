import React, { useState } from 'react';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Navigation,
  QrCode,
  CreditCard,
  Landmark,
  Loader2,
  ExternalLink,
  MapPin,
  Clock,
  Truck,
  Sparkles,
  Package,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CartItem, DeliveryStatus, Order } from '../../types';
import { useFarm } from '../../context/FarmContext';
import { RouteMapVisualizer } from './RouteMapVisualizer';

// ============================================================================
// 1. RAZORPAY PAYMENT MODAL COMPONENT
// ============================================================================
export interface RazorpayModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  customerName: string;
  customerPhone: string;
  onPaymentSuccess: (paymentId: string, orderId: string, method: 'Razorpay UPI' | 'Razorpay Card' | 'Razorpay NetBanking') => void;
}

export const RazorpayModal: React.FC<RazorpayModalProps> = ({
  isOpen,
  onClose,
  amount,
  customerName,
  customerPhone,
  onPaymentSuccess,
}) => {
  const [activeMethod, setActiveMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [upiId, setUpiId] = useState('customer@okhdfcbank');
  const [cardNumber, setCardNumber] = useState('4532 8921 7382 9102');
  const [cardExpiry, setCardExpiry] = useState('08/29');
  const [cardCvv, setCardCvv] = useState('831');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [isProcessing, setIsProcessing] = useState(false);
  const [razorpayOrderId] = useState(() => `order_${Math.random().toString(36).substring(2, 11)}`);

  if (!isOpen) return null;

  const launchOfficialRazorpay = () => {
    if (typeof window !== 'undefined' && (window as any).Razorpay) {
      try {
        const options = {
          key: 'rzp_test_1DP5mmOlF5G5ag',
          amount: amount * 100,
          currency: 'INR',
          name: 'Farm2Street Agri-Tech',
          description: `Direct Harvest Allocation Order - ${customerName}`,
          image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=128&q=80',
          prefill: {
            name: customerName,
            contact: customerPhone,
            email: 'customer@farm2street.org',
          },
          theme: {
            color: '#183c2a',
          },
          handler: function (response: any) {
            const paymentId = response.razorpay_payment_id || `pay_${Date.now()}`;
            const orderId = response.razorpay_order_id || razorpayOrderId;
            onPaymentSuccess(paymentId, orderId, 'Razorpay UPI');
          },
        };
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
        return;
      } catch (e) {
        console.warn('Razorpay SDK notice, using in-app checkout:', e);
      }
    }
    handlePay();
  };

  const handlePay = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      const paymentId = `pay_${Math.random().toString(36).substring(2, 12).toUpperCase()}`;
      const methodMap = {
        upi: 'Razorpay UPI' as const,
        card: 'Razorpay Card' as const,
        netbanking: 'Razorpay NetBanking' as const,
      };
      onPaymentSuccess(paymentId, razorpayOrderId, methodMap[activeMethod]);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="relative z-50 w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl border border-stone-200">
        <div className="bg-[#183c2a] px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 font-black text-white text-xs shadow-sm">
              R
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm tracking-wide">Razorpay Secure Checkout</span>
              </div>
              <div className="text-[11px] text-emerald-200">Farm2Street Direct Agri-Escrow</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-white/70 hover:bg-white/10 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="bg-[#f5f4ee] px-6 py-3 border-b border-stone-200 flex items-center justify-between text-xs">
          <div>
            <div className="text-[10px] uppercase font-bold text-stone-500">Invoice: {razorpayOrderId}</div>
            <div className="text-stone-700 font-medium">{customerName} ({customerPhone})</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase font-bold text-stone-500">Payable Amount</div>
            <div className="text-lg font-black text-[#183c2a]">₹{amount}</div>
          </div>
        </div>

        <div className="p-4 bg-emerald-50/70 border-b border-emerald-100 flex items-center justify-between gap-3">
          <div className="text-[11px] text-emerald-950 font-medium">
            Launch official Razorpay popup (UPI, Cards, GPay, PhonePe):
          </div>
          <button
            type="button"
            onClick={launchOfficialRazorpay}
            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#183c2a] text-white text-xs font-bold hover:bg-[#2c5b3d] shadow-sm transition-all"
          >
            <span>Open Razorpay</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="p-6">
          <div className="text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-3">
            Or Pay Directly Below
          </div>
          <div className="grid grid-cols-3 gap-2 mb-5">
            <button
              type="button"
              onClick={() => setActiveMethod('upi')}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-bold transition-all ${
                activeMethod === 'upi'
                  ? 'border-[#183c2a] bg-emerald-50 text-[#183c2a] shadow-sm'
                  : 'border-stone-200 text-stone-600 hover:bg-stone-50'
              }`}
            >
              <QrCode className="h-5 w-5 text-emerald-700" />
              <span>UPI / QR</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveMethod('card')}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-bold transition-all ${
                activeMethod === 'card'
                  ? 'border-[#183c2a] bg-emerald-50 text-[#183c2a] shadow-sm'
                  : 'border-stone-200 text-stone-600 hover:bg-stone-50'
              }`}
            >
              <CreditCard className="h-5 w-5 text-emerald-700" />
              <span>Cards</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveMethod('netbanking')}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-bold transition-all ${
                activeMethod === 'netbanking'
                  ? 'border-[#183c2a] bg-emerald-50 text-[#183c2a] shadow-sm'
                  : 'border-stone-200 text-stone-600 hover:bg-stone-50'
              }`}
            >
              <Landmark className="h-5 w-5 text-emerald-700" />
              <span>NetBanking</span>
            </button>
          </div>

          {activeMethod === 'upi' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-stone-200 p-3.5 bg-stone-50 text-xs">
                <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                  UPI ID / Virtual Payment Address
                </label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-mono text-stone-800 focus:border-[#183c2a] focus:outline-none"
                  placeholder="username@okhdfcbank"
                />
              </div>
              <div className="flex items-center justify-between rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-[11px] text-emerald-800">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Verified Escrow: Farm2Street Agri-Direct</span>
                </div>
                <span className="font-bold">Instant Release</span>
              </div>
            </div>
          )}

          {activeMethod === 'card' && (
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-1">Card Number</label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-mono text-stone-800 focus:border-[#183c2a] focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 mb-1">Expiry (MM/YY)</label>
                  <input
                    type="text"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-mono text-stone-800 focus:border-[#183c2a] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 mb-1">CVV</label>
                  <input
                    type="password"
                    maxLength={4}
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value)}
                    className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-mono text-stone-800 focus:border-[#183c2a] focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {activeMethod === 'netbanking' && (
            <div className="space-y-2">
              <label className="block text-[11px] font-semibold text-stone-600">Choose Popular Bank</label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank'].map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setSelectedBank(b)}
                    className={`rounded-lg border p-2.5 text-left font-medium transition-colors ${
                      selectedBank === b
                        ? 'border-[#183c2a] bg-emerald-50 text-[#183c2a] font-bold'
                        : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            type="button"
            disabled={isProcessing}
            onClick={handlePay}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#183c2a] py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#2c5b3d] disabled:opacity-75 transition-all shadow-md active:scale-[0.99]"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-emerald-300" />
                <span>Authorizing with Razorpay...</span>
              </>
            ) : (
              <>
                <span>Complete Payment (₹{amount})</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>

          <div className="mt-4 flex items-center justify-center gap-1.5 text-[10px] text-stone-400">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>256-bit Encrypted SSL • Razorpay Merchant Escrow</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 2. SHOPPING CART DRAWER COMPONENT
// ============================================================================
export interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQty: (produceId: string, delta: number) => void;
  onRemoveItem: (produceId: string) => void;
  onClearCart: () => void;
  onOpenTracker?: (orderId: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQty,
  onRemoveItem,
  onClearCart,
  onOpenTracker,
}) => {
  const { placeOrder, setActiveTrackOrderId } = useFarm();
  const [address, setAddress] = useState('Flat 402, Green Acre Heights, Central City Enclave');
  const [isRazorpayOpen, setIsRazorpayOpen] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState<string | null>(null);

  if (!isOpen) return null;

  const subtotal = items.reduce((acc, item) => acc + item.produce.price * item.quantity, 0);
  const deliveryFee = subtotal > 350 || subtotal === 0 ? 0 : 30;
  const total = subtotal + deliveryFee;

  const handleStartCheckout = () => {
    setIsRazorpayOpen(true);
  };

  const handlePaymentSuccess = (
    paymentId: string,
    razorpayOrderId: string,
    method: 'Razorpay UPI' | 'Razorpay Card' | 'Razorpay NetBanking'
  ) => {
    setIsRazorpayOpen(false);
    const newOrder = placeOrder(items, address, method, paymentId, razorpayOrderId);
    setOrderConfirmed(newOrder.id);

    confetti({
      particleCount: 90,
      spread: 75,
      origin: { y: 0.6 },
      colors: ['#183c2a', '#c5a880', '#2c5b3d', '#f1eadc'],
    });
  };

  const handleFinishOrder = () => {
    onClearCart();
    setOrderConfirmed(null);
    onClose();
  };

  const handleViewTracker = () => {
    if (orderConfirmed) {
      setActiveTrackOrderId(orderConfirmed);
      if (onOpenTracker) {
        onOpenTracker(orderConfirmed);
      }
    }
    onClearCart();
    setOrderConfirmed(null);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex justify-end">
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={onClose} />
        <div className="relative z-50 flex h-full w-full max-w-md flex-col bg-[#fbfaf5] shadow-2xl border-l border-[rgba(24,32,25,0.1)]">
          <div className="flex items-center justify-between border-b border-[rgba(24,32,25,0.08)] px-6 py-5">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="h-5 w-5 text-[#183c2a]" />
              <h3 className="font-sans text-xl font-bold tracking-[-0.03em] text-[#182019]">
                Your Fresh Basket
              </h3>
            </div>
            <button onClick={onClose} className="rounded-full p-2 text-stone-500 hover:bg-black/5 transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>

          {orderConfirmed ? (
            <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 mb-4">
                <CheckCircle2 className="h-9 w-9" />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#a48256]">
                Order Confirmed via Razorpay
              </span>
              <h4 className="font-sans text-2xl font-bold tracking-[-0.03em] text-[#182019] mt-1">
                Order #{orderConfirmed}
              </h4>
              <p className="text-xs text-[#6f776e] mt-3 leading-relaxed max-w-xs">
                Your order is now confirmed in the 8-stage lifecycle! The farmer has received the notification to harvest and pack.
              </p>

              <div className="w-full bg-white p-4 rounded-2xl border border-black/5 text-xs text-left mt-6 space-y-1.5">
                <div className="flex justify-between font-medium">
                  <span className="text-stone-500">Amount Paid:</span>
                  <span className="font-bold text-stone-900">₹{total}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span className="text-stone-500">Payment Engine:</span>
                  <span className="font-bold text-emerald-700">Razorpay Verified</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span className="text-stone-500">Delivery Address:</span>
                  <span className="font-semibold text-stone-800 truncate max-w-[170px]">{address}</span>
                </div>
              </div>

              <div className="w-full space-y-2.5 mt-6">
                <button
                  type="button"
                  onClick={handleViewTracker}
                  className="w-full flex items-center justify-center gap-2 rounded-full bg-[#183c2a] py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-md hover:bg-[#2c5b3d]"
                >
                  <Navigation className="h-4 w-4" />
                  <span>Open Live 8-Stage Tracker</span>
                </button>
                <button
                  type="button"
                  onClick={handleFinishOrder}
                  className="w-full rounded-full border border-stone-300 py-3 text-xs font-bold uppercase tracking-wider text-stone-700 hover:bg-stone-100"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-stone-100 text-stone-400 mb-4">
                <ShoppingBag className="h-8 w-8" />
              </div>
              <h4 className="font-sans text-lg font-bold text-[#182019]">
                Your basket is empty
              </h4>
              <p className="text-xs text-stone-500 mt-2 max-w-xs">
                Explore morning harvests picked straight from nearby micro-farms.
              </p>
              <button
                onClick={onClose}
                className="mt-6 rounded-full bg-[#183c2a] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white"
              >
                Browse Produce
              </button>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {items.map((item) => (
                  <div
                    key={item.produce.id}
                    className="flex items-center gap-3.5 rounded-2xl bg-white p-3.5 border border-[rgba(24,32,25,0.06)] shadow-sm"
                  >
                    <img
                      src={item.produce.image}
                      alt={item.produce.name}
                      className="h-16 w-16 rounded-xl object-cover border border-black/5 shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="font-sans text-sm font-bold text-[#182019] truncate">
                        {item.produce.name}
                      </div>
                      <div className="text-[11px] text-[#6f776e]">
                        ₹{item.produce.price} / {item.produce.unit}
                      </div>
                      <div className="text-xs font-bold text-[#183c2a] mt-1">
                        ₹{item.produce.price * item.quantity}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 rounded-full bg-[#f5f4ee] px-2 py-1">
                      <button
                        onClick={() => onUpdateQty(item.produce.id, -1)}
                        className="rounded-full p-1 text-stone-600 hover:bg-white hover:text-black transition-colors"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="text-xs font-bold text-[#182019] w-4 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQty(item.produce.id, 1)}
                        className="rounded-full p-1 text-stone-600 hover:bg-white hover:text-black transition-colors"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => onRemoveItem(item.produce.id)}
                      className="p-1.5 text-stone-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="border-t border-[rgba(24,32,25,0.08)] bg-white p-6 space-y-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                    Delivery Address
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full text-xs bg-[#f5f4ee] rounded-xl px-3.5 py-2 border border-black/5 focus:outline-none focus:ring-1 focus:ring-[#183c2a]"
                  />
                </div>

                <div className="space-y-1.5 text-xs text-[#6f776e] pt-1">
                  <div className="flex justify-between">
                    <span>Harvest Subtotal</span>
                    <span className="font-semibold text-[#182019]">₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Direct Farm Logistics</span>
                    <span>{deliveryFee === 0 ? <strong className="text-emerald-700">FREE</strong> : `₹${deliveryFee}`}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-[#182019] pt-2 border-t border-black/5">
                    <span>Total Amount</span>
                    <span className="font-sans text-lg font-bold text-[#183c2a]">₹{total}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleStartCheckout}
                  className="w-full flex items-center justify-center gap-2 rounded-full bg-[#183c2a] py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-md hover:bg-[#2c5b3d] active:scale-95 transition-all"
                >
                  <ShieldCheck className="h-4 w-4 text-[#c5a880]" />
                  <span>Checkout via Razorpay (₹{total})</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <RazorpayModal
        isOpen={isRazorpayOpen}
        onClose={() => setIsRazorpayOpen(false)}
        amount={total}
        customerName="Pooja Sharma"
        customerPhone="+91 98812 77410"
        onPaymentSuccess={handlePaymentSuccess}
      />
    </>
  );
};

// ============================================================================
// 3. 8-STAGE LIVE ORDER TRACKER MODAL
// ============================================================================
export interface OrderTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onAdvanceStatus?: (orderId: string, nextStatus: DeliveryStatus) => void;
  onInspectBatch?: (batchId: string) => void;
}

const STAGES: { status: DeliveryStatus; label: string; desc: string }[] = [
  { status: 'Order Placed', label: '1. Order Placed', desc: 'Order logged on Farm2Street' },
  { status: 'Order Confirmed', label: '2. Confirmed', desc: 'Razorpay payment verified' },
  { status: 'Preparing', label: '3. Preparing', desc: 'Farmer harvesting & sorting' },
  { status: 'Ready for Pickup', label: '4. Ready at Farm', desc: 'Packed in crates with QR seal' },
  { status: 'Delivery Partner Assigned', label: '5. Driver Assigned', desc: 'Delivery partner allocated' },
  { status: 'Picked Up', label: '6. Picked Up', desc: 'Crate collected at farm gate' },
  { status: 'Out for Delivery', label: '7. Out for Delivery', desc: 'En route to customer doorstep' },
  { status: 'Delivered', label: '8. Delivered', desc: 'Doorstep handover verified' },
];

export const OrderTrackerModal: React.FC<OrderTrackerModalProps> = ({
  isOpen,
  onClose,
  order,
  onAdvanceStatus,
  onInspectBatch,
}) => {
  if (!isOpen || !order) return null;

  const currentStageIndex = STAGES.findIndex((s) => s.status === order.status);

  const getNextStatus = (current: DeliveryStatus): DeliveryStatus | null => {
    const idx = STAGES.findIndex((s) => s.status === current);
    if (idx >= 0 && idx < STAGES.length - 1) {
      return STAGES[idx + 1].status;
    }
    return null;
  };

  const nextStatus = getNextStatus(order.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="relative z-50 flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-[#fbfaf5] shadow-2xl border border-[rgba(24,32,25,0.1)]">
        <div className="border-b border-stone-200 bg-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800 font-bold">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#a48256]">
                  Live 8-Stage Order Lifecycle
                </span>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                  {order.status}
                </span>
              </div>
              <h3 className="font-sans text-xl font-bold text-[#182019]">
                Tracking Order #{order.id}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                  Delivery Progress
                </span>
                <h4 className="font-sans text-sm font-bold text-[#182019]">
                  Step {currentStageIndex + 1} of 8: {STAGES[currentStageIndex]?.label || order.status}
                </h4>
              </div>
              {onAdvanceStatus && nextStatus && (
                <button
                  type="button"
                  onClick={() => onAdvanceStatus(order.id, nextStatus)}
                  className="flex items-center gap-1.5 rounded-full bg-[#183c2a] px-3.5 py-1.5 text-[11px] font-bold text-white hover:bg-[#2c5b3d] shadow-sm transition-all"
                >
                  <Sparkles className="h-3 w-3 text-amber-300" />
                  <span>Demo Step: Advance to "{nextStatus}"</span>
                </button>
              )}
            </div>

            <div className="relative pt-2 pb-1">
              <div className="absolute top-5 left-3 right-3 h-1 bg-stone-200 rounded-full -translate-y-1/2" />
              <div
                className="absolute top-5 left-3 h-1 bg-emerald-600 rounded-full -translate-y-1/2 transition-all duration-500"
                style={{
                  width: `${(currentStageIndex / (STAGES.length - 1)) * 100}%`,
                }}
              />

              <div className="relative flex justify-between items-center">
                {STAGES.map((stage, idx) => {
                  const isCompleted = idx < currentStageIndex;
                  const isCurrent = idx === currentStageIndex;

                  return (
                    <div key={stage.status} className="flex flex-col items-center group relative">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 z-10 ${
                          isCompleted
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : isCurrent
                            ? 'bg-emerald-700 text-white ring-4 ring-emerald-100 shadow-md scale-110'
                            : 'bg-white text-stone-400 border-2 border-stone-200'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        ) : (
                          <span>{idx + 1}</span>
                        )}
                      </div>
                      <span
                        className={`hidden sm:block text-[10px] mt-1.5 max-w-[70px] text-center font-medium leading-tight truncate ${
                          isCurrent
                            ? 'text-emerald-800 font-bold'
                            : isCompleted
                            ? 'text-stone-700'
                            : 'text-stone-400'
                        }`}
                      >
                        {stage.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-xl bg-emerald-50/70 border border-emerald-200/80 p-3.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-ping" />
                <div>
                  <div className="font-bold text-emerald-950">
                    Current Status: {order.status}
                  </div>
                  <div className="text-[11px] text-emerald-800 mt-0.5">
                    {STAGES[currentStageIndex]?.desc} · Last updated {order.updatedAt}
                  </div>
                </div>
              </div>
              {order.assignedDeliveryPartner && (
                <div className="hidden sm:flex items-center gap-2 text-right">
                  <div className="text-[11px] text-stone-600">
                    Courier: <strong className="text-stone-800">{order.assignedDeliveryPartner.name}</strong>
                  </div>
                </div>
              )}
            </div>
          </div>

          <RouteMapVisualizer
            pickupLocation={order.farmPickupLocation}
            deliveryLocation={order.deliveryAddress}
            distanceKm={order.distanceKm}
            estimatedMinutes={order.estimatedDeliveryMinutes}
            status={order.status}
            driverName={order.assignedDeliveryPartner?.name}
            vehicleNumber={order.assignedDeliveryPartner?.vehicle}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-stone-200 bg-white p-4 text-xs shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-2">
                Order Produce Items
              </span>
              <div className="divide-y divide-stone-100 space-y-2">
                {order.items.map((item, i) => (
                  <div key={i} className="pt-2 first:pt-0 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-stone-900">{item.name}</span>
                      <div className="text-[11px] text-stone-500">
                        {item.quantity} {item.unit} × ₹{item.price}
                      </div>
                    </div>
                    <span className="font-bold text-stone-800">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-stone-200 mt-3 pt-2 flex justify-between font-bold text-stone-900">
                <span>Total Amount Paid ({order.paymentMethod}):</span>
                <span className="text-[#183c2a] text-sm">₹{order.totalAmount}</span>
              </div>
            </div>

            <div className="rounded-2xl border border-stone-200 bg-white p-4 text-xs shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-2">
                  Farm Origin & Traceability
                </span>
                <div className="space-y-1.5">
                  <div className="text-stone-800 font-semibold">{order.farmerName}</div>
                  <div className="text-[11px] text-stone-500 flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-stone-400" />
                    <span>{order.farmPickupLocation}</span>
                  </div>
                  <div className="text-[11px] font-mono text-emerald-800 font-semibold bg-emerald-50 p-2 rounded-lg border border-emerald-100 mt-2">
                    Harvest Batch: {order.batchId}
                  </div>
                </div>
              </div>

              {onInspectBatch && (
                <button
                  type="button"
                  onClick={() => {
                    onInspectBatch(order.batchId);
                    onClose();
                  }}
                  className="mt-4 flex items-center justify-center gap-1.5 rounded-xl border border-[#183c2a] py-2 text-xs font-bold text-[#183c2a] hover:bg-[#183c2a] hover:text-white transition-colors"
                >
                  <QrCode className="h-4 w-4" />
                  <span>Inspect Batch QR Traceability</span>
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-stone-200 bg-white px-6 py-3.5 flex items-center justify-between text-xs text-stone-500">
          <div>
            Need help? Support Hotline: <strong className="text-stone-800">1800-FARM-2-STREET</strong>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-stone-900 px-5 py-2 text-xs font-bold text-white hover:bg-stone-800"
          >
            Close Tracker
          </button>
        </div>
      </div>
    </div>
  );
};
