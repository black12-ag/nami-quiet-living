/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Order, Product } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  ArrowLeft, 
  Package, 
  Truck, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Compass, 
  Sparkles,
  ChevronRight,
  ExternalLink,
  RotateCcw
} from 'lucide-react';

interface OrderHistoryProps {
  orders: Order[];
  onBack: () => void;
  onViewProduct?: (product: Product) => void;
  onSimulateStatusUpdate?: (orderId: string, newStatus: 'Processed' | 'Dispatched' | 'In Transit' | 'Delivered') => void;
}

const OrderHistory: React.FC<OrderHistoryProps> = ({ 
  orders, 
  onBack, 
  onViewProduct,
  onSimulateStatusUpdate 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  // Auto-select latest order if any exist, or use url / state tracking id query
  useEffect(() => {
    if (orders.length > 0 && !selectedOrderId) {
      setSelectedOrderId(orders[0].id);
    }
  }, [orders, selectedOrderId]);

  // Handle Search Result Lookup
  const filteredOrders = orders.filter(o => 
    o.id.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
    o.recipientName.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
    o.items.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase().trim()))
  );

  const selectedOrder = orders.find(o => o.id === selectedOrderId);

  const copyOrderToClipboard = (id: string) => {
    navigator.clipboard.writeText(id);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'Processed': return 'text-stone-500 bg-stone-100 border-stone-200';
      case 'Dispatched': return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'In Transit': return 'text-indigo-700 bg-indigo-50 border-indigo-200';
      case 'Delivered': return 'text-[#76846E] bg-[#76846E]/10 border-[#76846E]/30';
    }
  };

  const trackingSteps = [
    { 
      key: 'Processed', 
      title: 'Ledger Processed', 
      desc: 'The order signature has been finalized and validated.',
      icon: Clock 
    },
    { 
      key: 'Dispatched', 
      title: 'Nami Dispatched', 
      desc: 'Scent, sonic elements, or gears loaded in a delicate wood box.',
      icon: Sparkles 
    },
    { 
      key: 'In Transit', 
      title: 'Aesthetic Air Route', 
      desc: 'Sailing smoothly to your postal coordinate.',
      icon: Truck 
    },
    { 
      key: 'Delivered', 
      title: 'Nami Grounded', 
      desc: 'Handover complete. Resonance activated.',
      icon: CheckCircle2 
    }
  ];

  // Logic to check if step is achieved/active
  const getStepStatus = (currentStatus: Order['status'], stepKey: string) => {
    const sequence = ['Processed', 'Dispatched', 'In Transit', 'Delivered'];
    const currentIndex = sequence.indexOf(currentStatus);
    const stepIndex = sequence.indexOf(stepKey);

    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'active';
    return 'pending';
  };

  return (
    <div className="min-h-screen pt-28 pb-32 px-6 md:px-12 bg-[#F5F2EB]" id="order-history-viewport">
      <div className="max-w-[1500px] mx-auto">
        
        {/* Navigation back and section title */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <button 
            onClick={onBack}
            className="group flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#A8A29E] hover:text-[#2C2A26] transition-colors"
            id="back-to-shop-btn"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to quiet collections
          </button>
          
          <div className="text-right md:text-left">
            <h1 className="text-3xl md:text-4xl font-serif text-[#2C2A26] tracking-tight">Your Nami Ledger</h1>
            <p className="text-xs text-[#A8A29E] tracking-widest uppercase mt-1">Real-Time Order Tracking & Log</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* LEFT PANEL: Order Directory & Search (4 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Search inputs */}
            <div className="bg-white/40 p-4 border border-[#D6D1C7] rounded-xl flex items-center gap-3">
              <Search className="w-4 h-4 text-[#A8A29E] flex-shrink-0" />
              <input
                type="text"
                placeholder="Search by Order ID, Recipient or Item..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-sm outline-none text-[#2C2A26] placeholder-[#A8A29E]"
                id="order-search-input"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="text-xs text-[#A8A29E] hover:text-[#2C2A26]"
                >
                  Clear
                </button>
              )}
            </div>

            {/* List of Orders */}
            <div className="space-y-4 max-h-[700px] overflow-y-auto pr-1 no-scrollbar">
              {filteredOrders.length === 0 ? (
                <div className="bg-white/30 border border-dashed border-[#D6D1C7] p-12 text-center rounded-xl">
                  <Package className="w-8 h-8 text-[#A8A29E] mx-auto mb-4 stroke-[1.2]" />
                  <p className="text-sm text-[#2C2A26] font-serif italic">No orders match the nami resonance.</p>
                  <p className="text-xs text-[#A8A29E] mt-1">Place an order at Checkout to log dynamic state traces.</p>
                </div>
              ) : (
                filteredOrders.map((order) => {
                  const isSelected = order.id === selectedOrderId;
                  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  });

                  return (
                    <div
                      key={order.id}
                      onClick={() => setSelectedOrderId(order.id)}
                      className={`p-5 rounded-xl border transition-all duration-300 cursor-pointer text-left relative ${
                        isSelected 
                          ? 'bg-white border-[#2C2A26] shadow-md shadow-[#2C2A26]/5 scale-[1.01]' 
                          : 'bg-white/50 border-[#D6D1C7]/60 hover:bg-white hover:border-[#D6D1C7]'
                      }`}
                      id={`order-list-item-${order.id}`}
                    >
                      {/* Active marker indicator */}
                      {isSelected && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-12 bg-[#2C2A26] rounded-r-md" />
                      )}

                      <div className="flex justify-between items-start gap-4 mb-3">
                        <div className="space-y-0.5">
                          <p className="text-xs font-mono font-bold text-[#2C2A26] tracking-wider">{order.id}</p>
                          <p className="text-[10px] text-[#A8A29E] uppercase tracking-widest">{formattedDate}</p>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-medium border ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>

                      {/* Snippet summary items count & price */}
                      <div className="flex items-center justify-between border-t border-[#D6D1C7]/30 pt-3 mt-3">
                        <span className="text-xs text-[#5D5A53]">
                          {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                        </span>
                        <span className="text-xs font-serif text-[#2C2A26] font-medium">${order.total}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* RIGHT PANEL: Tracker Detail & Simulation Controller (7 cols) */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              {selectedOrder ? (
                <motion.div
                  key={selectedOrder.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.4 }}
                  className="bg-white border border-[#D6D1C7] rounded-2xl p-6 md:p-8 text-left space-y-8 shadow-sm"
                  id={`checked-order-detail-${selectedOrder.id}`}
                >
                  {/* Detailed Title with copy utility */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D6D1C7]/60 pb-6">
                    <div className="space-y-1">
                      <span className="text-xs font-semibold text-[#A8A29E] uppercase tracking-widest font-mono">Current Tracking Spec</span>
                      <h2 className="text-2xl font-serif text-[#2C2A26] flex items-center gap-2">
                        {selectedOrder.id}
                        <button 
                          onClick={() => copyOrderToClipboard(selectedOrder.id)}
                          className="p-1 hover:bg-stone-100 rounded transition-colors text-stone-400 hover:text-stone-700"
                          title="Copy order ID"
                        >
                          <span className="text-xs font-sans text-stone-500 font-normal">
                            {isCopied ? 'Copied' : 'Copy'}
                          </span>
                        </button>
                      </h2>
                    </div>

                    {/* Simulation Console widget for developers / users */}
                    {onSimulateStatusUpdate && (
                      <div className="bg-[#F5F2EB] p-3 border border-[#D6D1C7] rounded-xl shrink-0 space-y-1.5 shadow-inner">
                        <span className="block text-[8px] font-bold uppercase tracking-widest text-[#2C2A26] flex items-center gap-1">
                          <Compass className="w-2.5 h-2.5 animate-spin" /> Logistics Simulator
                        </span>
                        <div className="flex gap-1.5 flex-wrap">
                          {(['Processed', 'Dispatched', 'In Transit', 'Delivered'] as const).map((stage) => (
                            <button
                              key={stage}
                              onClick={() => onSimulateStatusUpdate(selectedOrder.id, stage)}
                              className={`px-2 py-1 text-[9px] font-mono border rounded transition-all ${
                                selectedOrder.status === stage 
                                  ? 'bg-[#2C2A26] text-white border-[#2C2A26]' 
                                  : 'bg-white text-stone-600 hover:bg-stone-50 border-stone-200'
                              }`}
                            >
                              {stage}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* VISUAL PIPELINE TIMELINE STEP-BY-STEP */}
                  <div className="space-y-6">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-[#2C2A26]">Interactive Delivery Pipeline</h3>
                    
                    <div className="relative pt-2 pb-2 pl-4 md:pl-6 space-y-8 border-l border-[#D6D1C7]">
                      {trackingSteps.map((step, idx) => {
                        const stepState = getStepStatus(selectedOrder.status, step.key);
                        const StepIcon = step.icon;

                        let bulletClass = '';
                        let textClass = '';
                        let descClass = '';

                        if (stepState === 'completed') {
                          bulletClass = 'bg-[#76846E] text-[#F5F2EB] border-[#76846E] scale-100 shadow-md';
                          textClass = 'text-[#2C2A26] font-medium';
                          descClass = 'text-[#5D5A53]';
                        } else if (stepState === 'active') {
                          bulletClass = 'bg-[#2C2A26] text-[#F5F2EB] border-[#2C2A26] scale-110 ring-4 ring-[#2C2A26]/10 animate-pulse';
                          textClass = 'text-[#2C2A26] font-bold';
                          descClass = 'text-stone-700 font-light';
                        } else {
                          bulletClass = 'bg-white text-stone-300 border-[#D6D1C7] text-stone-300';
                          textClass = 'text-[#A8A29E] font-light';
                          descClass = 'text-[#A8A29E]/75';
                        }

                        return (
                          <div key={step.key} className="relative flex gap-4 md:gap-6 items-start">
                            {/* Bullet icon placement */}
                            <div className={`absolute -left-[27px] md:-left-[35px] w-6 h-6 md:w-8 md:h-8 rounded-full border flex items-center justify-center transition-all duration-500 z-10 ${bulletClass}`}>
                              <StepIcon className="w-3.5 h-3.5 md:w-4.5 md:h-4.5 stroke-[1.5]" />
                            </div>

                            {/* Text labels */}
                            <div className="flex-1 space-y-1 pl-4">
                              <h4 className={`text-sm tracking-wide ${textClass}`}>{step.title}</h4>
                              <p className={`text-xs leading-relaxed ${descClass}`}>{step.desc}</p>
                              
                              {/* Extra simulated location tag for transit / active steps */}
                              {stepState === 'active' && step.key === 'In Transit' && (
                                <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-mono bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-100 animate-pulse">
                                  <MapPin className="w-2.5 h-2.5" /> High-frequency postal dispatch hub
                                </span>
                              )}
                              {stepState === 'active' && step.key === 'Dispatched' && (
                                <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-mono bg-amber-50 text-amber-700 px-2 py-0.5 rounded border border-amber-100">
                                  <Compass className="w-2.5 h-2.5" /> Checked, packed, & certified by Nami artisans
                                </span>
                              )}
                              {stepState === 'active' && step.key === 'Delivered' && (
                                <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-mono bg-stone-50 text-[#76846E] px-2 py-0.5 rounded border border-[#76846E]/20">
                                  <CheckCircle2 className="w-2.5 h-2.5" /> Delivered to {selectedOrder.recipientName}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Shipment specs grid details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-[#D6D1C7]/60">
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-[#2C2A26] flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-[#A8A29E]" /> Recipient coordinate
                      </h4>
                      <div className="text-xs text-[#5D5A53] leading-relaxed pl-5 space-y-1">
                        <p className="font-semibold text-stone-800">{selectedOrder.recipientName}</p>
                        <p>{selectedOrder.address}</p>
                        <p className="font-mono text-[10px] text-[#A8A29E] mt-1 select-all">{selectedOrder.email}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-[#2C2A26] flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-[#A8A29E]" /> Estimated Handover
                      </h4>
                      <div className="text-xs text-[#5D5A53] leading-relaxed pl-5 space-y-1">
                        <p className="font-serif italic text-sm text-[#2C2A26]">{selectedOrder.arrivalDate}</p>
                        <p className="text-[10px] text-[#A8A29E] uppercase tracking-wide">
                          Carrier Style: {selectedOrder.shippingMethod === 'express' ? 'Secured Lightning Express' : 'Standard Ground Courier'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Ordered Items summary list details */}
                  <div className="space-y-4 pt-6 border-t border-[#D6D1C7]/60">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-[#2C2A26] flex items-center gap-2">
                      <Package className="w-3.5 h-3.5 text-[#A8A29E]" /> Package Manifest
                    </h4>
                    
                    <div className="divide-y divide-[#D6D1C7]/30 pl-5">
                      {selectedOrder.items.map((item, index) => (
                        <div 
                          key={`${item.id}-${index}`}
                          onClick={() => onViewProduct?.(item)}
                          className="flex items-center justify-between py-3.5 group cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-12 bg-stone-100 flex-shrink-0 overflow-hidden border border-stone-200/50">
                              <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                            </div>
                            <div>
                              <p className="text-xs font-serif text-[#2C2A26] leading-tight group-hover:underline">{item.name}</p>
                              <p className="text-[10px] text-[#A8A29E] tracking-widest uppercase font-mono">{item.category}</p>
                            </div>
                          </div>
                          
                          <div className="text-right flex items-center gap-2 text-stone-500 hover:text-stone-800 transition-colors">
                            <span className="text-xs font-light">${item.price}</span>
                            <ChevronRight className="w-3 h-3 text-[#A8A29E] opacity-40 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Invoice calculation sub-board */}
                  <div className="bg-[#F5F2EB]/40 p-5 rounded-xl border border-[#D6D1C7]/70 space-y-2.5 text-xs text-[#5D5A53]">
                    <div className="flex justify-between">
                      <span>Products Subtotal</span>
                      <span>${selectedOrder.subtotal}</span>
                    </div>
                    {selectedOrder.discount > 0 && (
                      <div className="flex justify-between text-[#76846E]">
                        <span>Coupon Offer Rebate</span>
                        <span>-${selectedOrder.discount}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Carrier Dispatch</span>
                      <span>{selectedOrder.shippingCost === 0 ? 'Complimentary' : `$${selectedOrder.shippingCost}`}</span>
                    </div>
                    <div className="flex justify-between font-serif text-sm text-[#2C2A26] font-medium pt-2.5 border-t border-[#D6D1C7]/30">
                      <span>Total Invoice Settled</span>
                      <span>${selectedOrder.total}</span>
                    </div>
                  </div>

                </motion.div>
              ) : (
                <div className="h-full bg-white border border-[#D6D1C7] border-dashed rounded-2xl p-16 text-center flex flex-col justify-center items-center space-y-4">
                  <Compass className="w-12 h-12 text-[#A8A29E] stroke-[1]" />
                  <h3 className="text-lg font-serif italic text-[#2C2A26]">No order selected</h3>
                  <p className="text-xs text-[#A8A29E] max-w-xs leading-relaxed">
                    Select an order from the ledger directory or execute a search lookup to trace shipping progress.
                  </p>
                </div>
              )}
            </AnimatePresence>
          </div>

        </div>

      </div>
    </div>
  );
};

export default OrderHistory;
