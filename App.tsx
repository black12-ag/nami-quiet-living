/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProductGrid from './components/ProductGrid';
import About from './components/About';
import Journal from './components/Journal';
import Assistant from './components/Assistant';
import Footer from './components/Footer';
import ProductDetail from './components/ProductDetail';
import JournalDetail from './components/JournalDetail';
import CartDrawer from './components/CartDrawer';
import Checkout from './components/Checkout';
import StyleQuiz from './components/StyleQuiz';
import MaterialShowcase from './components/MaterialShowcase';
import AmbientPlayer from './components/AmbientPlayer';
import Testimonials from './components/Testimonials';
import { Product, JournalArticle, ViewState, Order } from './types';
import OrderHistory from './components/OrderHistory';
import CompareBar from './components/CompareBar';
import CompareModal from './components/CompareModal';

function App() {
  const [view, setView] = useState<ViewState>({ type: 'home' });
  const [cartItems, setCartItems] = useState<Product[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [compareList, setCompareList] = useState<Product[]>(() => {
    const saved = localStorage.getItem('nami_compare_list');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Ignore
      }
    }
    return [];
  });
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [compareAlert, setCompareAlert] = useState<string | null>(null);

  const handleToggleCompare = (product: Product) => {
    let updated: Product[];
    if (compareList.some(p => p.id === product.id)) {
      updated = compareList.filter(p => p.id !== product.id);
    } else {
      if (compareList.length >= 3) {
        setCompareAlert("You can compare up to 3 objects. Remove or clear one to proceed.");
        setTimeout(() => setCompareAlert(null), 4000);
        return;
      }
      updated = [...compareList, product];
    }
    setCompareList(updated);
    localStorage.setItem('nami_compare_list', JSON.stringify(updated));
  };

  const handleAddToCompare = (product: Product) => {
    if (compareList.some(p => p.id === product.id)) return;
    if (compareList.length >= 3) {
      setCompareAlert("You can compare up to 3 objects. Remove or clear one to proceed.");
      setTimeout(() => setCompareAlert(null), 4000);
      return;
    }
    const updated = [...compareList, product];
    setCompareList(updated);
    localStorage.setItem('nami_compare_list', JSON.stringify(updated));
  };

  const handleRemoveFromCompare = (product: Product) => {
    const updated = compareList.filter(p => p.id !== product.id);
    setCompareList(updated);
    localStorage.setItem('nami_compare_list', JSON.stringify(updated));
  };

  const handleClearCompare = () => {
    setCompareList([]);
    localStorage.setItem('nami_compare_list', JSON.stringify([]));
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    if (query.trim() !== '') {
      if (view.type !== 'home') {
        setView({ type: 'home' });
      }
      setTimeout(() => {
        const el = document.getElementById('products');
        if (el) {
          const headerOffset = 85;
          const offsetPosition = el.getBoundingClientRect().top + window.scrollY - headerOffset;
          window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
        }
      }, 100);
    }
  };

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('nami_orders');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Ignore
      }
    }
    // Base pre-seeded orders to make the UI populated on first load!
    const defaultOrders: Order[] = [
      {
        id: "NAMI-73891-204",
        items: [
          {
            id: 'p1',
            name: 'Nami Harmony',
            tagline: 'Listen naturally.',
            description: 'Audio that feels like the open air. Constructed with warm acoustic fabric and recycled sandstone composite.',
            price: 429,
            category: 'Audio',
            imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=1000',
            features: ['Organic Noise Cancellation', '50h Battery', 'Natural Soundstage']
          }
        ],
        subtotal: 429,
        discount: 40,
        shippingCost: 0,
        total: 389,
        shippingMethod: 'standard',
        arrivalDate: 'Delivered',
        createdAt: new Date(Date.now() - 3.55 * 86400000).toISOString(), // 3 days ago
        email: 'quiet.lux@nature.org',
        recipientName: 'Genevieve Finch',
        address: '742 Whisper Lane, Boulder, CO, 80301',
        status: 'Delivered'
      },
      {
        id: "NAMI-85023-149",
        items: [
          {
            id: 'p2',
            name: 'Nami Epoch',
            tagline: 'Moments, not minutes.',
            description: 'A timepiece designed for wellness. Ceramic casing with a strap made from sustainable vegan leather.',
            price: 349,
            category: 'Wearable',
            imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=1000',
            features: ['Stress Monitoring', 'E-Ink Hybrid Display', '7-Day Battery']
          }
        ],
        subtotal: 349,
        discount: 0,
        shippingCost: 15,
        total: 364,
        shippingMethod: 'express',
        arrivalDate: new Date(Date.now() + 1.25 * 86400000).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
        createdAt: new Date(Date.now() - 0.75 * 86400000).toISOString(), // 18 hours ago
        email: 'zen.seeker@serene.com',
        recipientName: 'Cassian Reed',
        address: '12 Echo Ridge Blvd, Apt B, Portland, OR, 97201',
        status: 'In Transit'
      }
    ];
    localStorage.setItem('nami_orders', JSON.stringify(defaultOrders));
    return defaultOrders;
  });

  const handleOrderCreated = (newOrder: Order) => {
    const updatedOrders = [newOrder, ...orders];
    setOrders(updatedOrders);
    localStorage.setItem('nami_orders', JSON.stringify(updatedOrders));
  };

  const handleSimulateStatusUpdate = (orderId: string, newStatus: Order['status']) => {
    const updatedOrders = orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    );
    setOrders(updatedOrders);
    localStorage.setItem('nami_orders', JSON.stringify(updatedOrders));
  };

  // Handle navigation (clicks on Navbar or Footer links)
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    
    if (targetId === 'orders') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setView({ type: 'orders' });
      return;
    }
    
    // If we are not home, go home first
    if (view.type !== 'home') {
      setView({ type: 'home' });
      // Allow state update to render Home before scrolling
      setTimeout(() => scrollToSection(targetId), 0);
    } else {
      scrollToSection(targetId);
    }
  };

  const scrollToSection = (targetId: string) => {
    if (!targetId) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
    }
    
    const element = document.getElementById(targetId);
    if (element) {
      // Manual scroll calculation to account for fixed header
      const headerOffset = 85;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });

      try {
        window.history.pushState(null, '', `#${targetId}`);
      } catch (err) {
        // Ignore SecurityError in restricted environments
      }
    }
  };

  const addToCart = (product: Product) => {
    setCartItems([...cartItems, product]);
    setIsCartOpen(true);
  };

  const removeFromCart = (index: number) => {
    const newItems = [...cartItems];
    newItems.splice(index, 1);
    setCartItems(newItems);
  };

  return (
    <div className="min-h-screen bg-[#F5F2EB] font-sans text-[#2C2A26] selection:bg-[#D6D1C7] selection:text-[#2C2A26]">
      {view.type !== 'checkout' && (
        <Navbar 
            onNavClick={handleNavClick} 
            cartCount={cartItems.length}
            onOpenCart={() => setIsCartOpen(true)}
            onViewOrders={() => setView({ type: 'orders' })}
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
        />
      )}
      
      <main>
        {view.type === 'home' && (
          <>
            <Hero onStartQuiz={() => setIsQuizOpen(true)} />
            <ProductGrid 
              onProductClick={(p) => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                setView({ type: 'product', product: p });
              }} 
              searchQuery={searchQuery}
              onSearchChange={handleSearchChange}
              compareList={compareList}
              onCompareClick={handleToggleCompare}
            />
            <MaterialShowcase />
            <AmbientPlayer />
            <About />
            <Testimonials />
            <Journal onArticleClick={(a) => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                setView({ type: 'journal', article: a });
            }} />
          </>
        )}

        {view.type === 'product' && (
          <ProductDetail 
            product={view.product} 
            onBack={() => {
              setView({ type: 'home' });
              setTimeout(() => scrollToSection('products'), 50);
            }}
            onAddToCart={addToCart}
            onViewProduct={(p) => setView({ type: 'product', product: p })}
          />
        )}

        {view.type === 'journal' && (
          <JournalDetail 
            article={view.article} 
            onBack={() => setView({ type: 'home' })}
          />
        )}

        {view.type === 'checkout' && (
            <Checkout 
                items={cartItems}
                onBack={() => setView({ type: 'home' })}
                initialDiscount={view.discount}
                initialPromoCode={view.promoCode}
                initialPrefill={'prefill' in view ? view.prefill : undefined}
                onClearCart={() => setCartItems([])}
                onOrderCreated={handleOrderCreated}
            />
        )}

        {view.type === 'orders' && (
            <OrderHistory 
                orders={orders}
                onBack={() => setView({ type: 'home' })}
                onViewProduct={(p) => setView({ type: 'product', product: p })}
                onSimulateStatusUpdate={handleSimulateStatusUpdate}
            />
        )}
      </main>

      {view.type !== 'checkout' && <Footer onLinkClick={handleNavClick} />}
      
      <Assistant 
        onNavigate={(targetView) => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
          setView(targetView);
        }}
        onAddToCart={addToCart}
        cartItems={cartItems}
        currentView={view}
      />
      
      <CartDrawer 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onRemoveItem={removeFromCart}
        onAddToCart={addToCart}
        onCheckout={(discount, activePromo) => {
            setIsCartOpen(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setView({ type: 'checkout', discount, promoCode: activePromo });
        }}
      />

      <StyleQuiz 
        isOpen={isQuizOpen}
        onClose={() => setIsQuizOpen(false)}
        onViewProduct={(p) => setView({ type: 'product', product: p })}
      />

      {compareAlert && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-[#A34E36] text-[#F5F2EB] px-6 py-3 rounded-lg shadow-xl text-xs uppercase tracking-widest font-mono font-semibold animate-pulse border border-stone-850">
          {compareAlert}
        </div>
      )}

      <CompareBar 
        compareList={compareList}
        onRemoveFromCompare={handleRemoveFromCompare}
        onClearCompare={handleClearCompare}
        onOpenCompareModal={() => setIsCompareOpen(true)}
      />

      <CompareModal 
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        compareList={compareList}
        onRemoveFromCompare={handleRemoveFromCompare}
        onAddToCompare={handleAddToCompare}
        onAddToCart={addToCart}
        onViewProduct={(p) => setView({ type: 'product', product: p })}
      />
    </div>
  );
}

export default App;
