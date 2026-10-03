import React, { useState } from 'react';
import { FarmHero, TrailingCursor } from './components/ui/UiWidgets';
import { CoverFlowCarousel, defaultDishes } from './components/ui/3-d-coverflow-carousel';
import { Navbar, LeftSlideNav, Footer } from './components/layout/Navbar';
import { FreshHarvests } from './components/features/FreshHarvests';
import { LocalFarms } from './components/features/LocalFarms';
import { CustomerReviews } from './components/features/CustomerReviews';
import { TraceabilitySection } from './components/features/TraceabilitySection';
import { FarmProvider, useFarm } from './context/FarmContext';
import { CartItem, Produce, SubscriptionBox } from './types';
import { SubscriptionPlansPage } from './components/features/SubscriptionPlansPage';
import { LoginPage } from './components/features/LoginPage';
import { RegisterPage } from './components/features/RegisterPage';
import { FarmerPortal } from './components/features/FarmerPortal';
import { DeliveryPortal } from './components/features/DeliveryPortal';
import { AdminCenter } from './components/features/AdminCenter';
import { CartDrawer, OrderTrackerModal } from './components/features/OrderModals';
import { AuthLoginModal } from './components/features/AuthLoginModal';

function AppContent() {
  const {
    currentUser,
    activeView,
    setActiveView,
    isLoginModalOpen,
    setIsLoginModalOpen,
    produceList,
    orders,
    updateOrderStatus,
    activeTrackOrderId,
    setActiveTrackOrderId,
    selectedBatchId,
    setSelectedBatchId,
    logout,
  } = useFarm();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isTrackerOpen, setIsTrackerOpen] = useState<boolean>(false);
  const [isLeftNavOpen, setIsLeftNavOpen] = useState<boolean>(false);

  // Active tracked order
  const trackedOrder = orders.find((o) => o.id === activeTrackOrderId) || orders[0] || null;

  // Active unfulfilled orders count
  const activeOrdersCount = orders.filter((o) => o.status !== 'Delivered').length;

  // Cart operations
  const handleAddToCart = (produce: Produce) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.produce.id === produce.id);
      if (existing) {
        return prev.map((item) =>
          item.produce.id === produce.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { produce, quantity: 1 }];
    });
  };

  const handleUpdateQty = (produceId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.produce.id === produceId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveItem = (produceId: string) => {
    setCartItems((prev) => prev.filter((item) => item.produce.id !== produceId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  // Convert subscription box addition to cart item
  const handleSubscribeBox = (box: SubscriptionBox, frequency: string) => {
    const boxProduce: Produce = {
      id: `box-${box.id}-${frequency}`,
      name: `${box.name} (${frequency === 'weekly' ? 'Weekly' : 'Bi-Weekly'})`,
      category: 'Vegetables',
      price: frequency === 'weekly' ? box.pricePerWeek : Math.round(box.pricePerWeek * 2 * 0.95),
      unit: frequency === 'weekly' ? 'week' : '2 weeks',
      farmer: 'Farm2Street Curated Farms',
      farmLocation: 'Consolidated Regional Micro-Hubs',
      harvestDate: 'Next Tuesday Morning',
      availableQty: 50,
      image: 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&w=800&q=80',
      description: box.tagline,
      batchId: 'F2S-BOX-SUB-01',
      organic: true,
      rating: 5.0,
    };
    handleAddToCart(boxProduce);
    setIsCartOpen(true);
  };

  const handleInspectBatch = (batchId: string) => {
    setSelectedBatchId(batchId);
    if (activeView !== 'marketplace') {
      setActiveView('marketplace');
    }
    setTimeout(() => {
      const elem = document.getElementById('traceability');
      if (elem) {
        elem.scrollIntoView({ behavior: 'smooth' });
      }
    }, 150);
  };

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen bg-[#f5f4ee] text-[#182019] relative font-sans selection:bg-[#dfe8d7] selection:text-[#183c2a]">
      {/* 1. Canvas Trailing Cursor */}
      <TrailingCursor />

      {/* 2. Left Slide-out Drawer Navigation */}
      <LeftSlideNav
        isOpen={isLeftNavOpen}
        onClose={() => setIsLeftNavOpen(false)}
        onOpenTracker={() => {
          setIsLeftNavOpen(false);
          setIsTrackerOpen(true);
        }}
        onOpenCart={() => {
          setIsLeftNavOpen(false);
          setIsCartOpen(true);
        }}
      />

      {/* 3. Primary Navbar */}
      {activeView !== 'login' && activeView !== 'register' && (
        <Navbar
          cartCount={totalCartCount}
          onOpenCart={() => setIsCartOpen(true)}
          currentUser={currentUser}
          onOpenLoginModal={() => setActiveView('login')}
          onOpenTracker={() => setIsTrackerOpen(true)}
          onOpenSubscriptions={() => setActiveView('subscriptions')}
          onNavigateHome={() => setActiveView('marketplace')}
          onOpenLeftNav={() => setIsLeftNavOpen(true)}
          activeOrdersCount={activeOrdersCount}
          onLogout={logout}
        />
      )}

      {/* 4. Screen Views Based on Active Portal */}
      <div className={activeView !== 'login' && activeView !== 'register' ? 'pt-[68px] sm:pt-[72px]' : ''}>
        {/* VIEW A: MAIN FRESH PRODUCE MARKETPLACE */}
        {activeView === 'marketplace' && (
          <main>
            {/* Hero Video Scrub */}
            <FarmHero
              title="FROM FARM"
              tagline="TO STREET — Fresh harvests direct from nearby growers."
              scrollHint="SCROLL TO HARVEST"
              scrubDistance={2400}
            />

            {/* Fresh Harvests Produce Section */}
            <FreshHarvests
              produceList={produceList}
              onAddToCart={handleAddToCart}
              onInspectBatch={handleInspectBatch}
            />

            {/* 3D Produce Coverflow Carousel */}
            <section id="discovery-3d" className="relative py-10 bg-[#07100b]">
              <div className="text-center pt-8 pb-2">
                <span className="text-xs font-bold uppercase tracking-[0.3em] text-[#c5a880]">
                  Interactive 3D Produce Stage
                </span>
                <h2 className="font-sans text-3xl md:text-5xl font-bold tracking-[-0.04em] text-white mt-2">
                  Featured Harvest Discovery
                </h2>
                <p className="text-xs md:text-sm text-stone-400 mt-2 max-w-lg mx-auto px-4">
                  Explore morning-picked produce in 3D perspective. Sweep left or right on your mousepad, drag, click, or use arrow keys.
                </p>
              </div>
              <CoverFlowCarousel
                items={defaultDishes}
                sectionLabel="DIRECT ORCHARD & FIELD PICKS"
                autoplay={true}
                autoplayDelay={4000}
                onCtaClick={(dish) => {
                  const matched =
                    produceList.find((p) =>
                      p.name.toLowerCase().includes(dish.titleLine1.toLowerCase().split(' ')[0])
                    ) || produceList[0];
                  handleAddToCart(matched);
                }}
              />
            </section>

            {/* Produce Traceability Engine */}
            <TraceabilitySection activeBatchId={selectedBatchId} />

            {/* Partner Micro-Farms Showcase */}
            <LocalFarms />

            {/* Dynamic Customer Reviews */}
            <CustomerReviews />

            {/* Editorial Footer */}
            <Footer />
          </main>
        )}

        {/* VIEW B: DEDICATED SEPARATE SUBSCRIPTION PLANS PAGE */}
        {activeView === 'subscriptions' && (
          <>
            <SubscriptionPlansPage
              onBackToMarketplace={() => setActiveView('marketplace')}
              onSubscribe={handleSubscribeBox}
            />
            <Footer />
          </>
        )}

        {/* VIEW C: FULL-SCREEN SPLIT-LAYOUT LOGIN EXPERIENCE */}
        {activeView === 'login' && (
          <LoginPage
            onBackToMarketplace={() => setActiveView('marketplace')}
            onNavigateRegister={() => setActiveView('register')}
          />
        )}

        {/* VIEW C.2: FULL-SCREEN SPLIT-LAYOUT REGISTRATION EXPERIENCE */}
        {activeView === 'register' && (
          <RegisterPage
            onBackToMarketplace={() => setActiveView('marketplace')}
            onNavigateLogin={() => setActiveView('login')}
          />
        )}

        {/* VIEW D: FARMER PRODUCER PORTAL (Actor 1) */}
        {activeView === 'farmer' && <FarmerPortal />}

        {/* VIEW E: DELIVERY PARTNER OPERATOR PORTAL (Actor 3) */}
        {activeView === 'delivery' && <DeliveryPortal />}

        {/* VIEW F: ADMIN CONTROL CENTER (Actor 4) */}
        {activeView === 'admin' && <AdminCenter />}
      </div>

      {/* MODALS */}

      {/* Cart Drawer with Razorpay Payment Integration */}
      {isCartOpen && (
        <CartDrawer
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          items={cartItems}
          onUpdateQty={handleUpdateQty}
          onRemoveItem={handleRemoveItem}
          onClearCart={handleClearCart}
          onOpenTracker={(orderId) => {
            setActiveTrackOrderId(orderId);
            setIsTrackerOpen(true);
          }}
        />
      )}

      {/* Multi-Actor Authentication Modal */}
      {isLoginModalOpen && (
        <AuthLoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          defaultRole={currentUser.role}
        />
      )}

      {/* 8-Stage Order Lifecycle Tracker Modal */}
      {isTrackerOpen && (
        <OrderTrackerModal
          isOpen={isTrackerOpen}
          onClose={() => setIsTrackerOpen(false)}
          order={trackedOrder}
          onAdvanceStatus={(orderId, nextStatus) => updateOrderStatus(orderId, nextStatus)}
          onInspectBatch={handleInspectBatch}
        />
      )}
    </div>
  );
}

export function App() {
  return (
    <FarmProvider>
      <AppContent />
    </FarmProvider>
  );
}

export default App;
