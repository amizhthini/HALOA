/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useEffect } from 'react';
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  ChevronRight, 
  Heart, 
  Sparkles, 
  Check, 
  ArrowRight,
  Menu,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Types
interface Product {
  id: string;
  name: string;
  description: string;
  image: string;
  benefits: string[];
  options: {
    size: string;
    price: number;
    image?: string;
    originalPrice?: number;
  }[];
  comingSoon?: boolean;
}

interface CartItem {
  id: string;
  name: string;
  image: string;
  size: string;
  price: number;
  quantity: number;
  isSubscription: boolean;
  frequency?: number;
}

// Data
const PRODUCTS: Product[] = [
  {
    id: 'crunchy-paws',
    name: 'Crunchy Paws',
    description: 'Dehydrated chicken feet. A natural source of glucosamine and chondroitin for healthy joints.',
    image: 'https://images.unsplash.com/photo-1594489428504-5c0c480a15fd?auto=format&fit=crop&q=80&w=800',
    benefits: [
      'Natural Glucosamine & Chondroitin for Joint Support',
      'Promotes Dental Hygiene through Chewing Action',
      'Rich in Bio-available Collagen',
      'Grain-Free & Low in Fat'
    ],
    options: [
      { size: '12 Pieces', price: 499, image: 'https://images.unsplash.com/photo-1594489428504-5c0c480a15fd?auto=format&fit=crop&q=80&w=400' },
      { size: '20 Pieces', price: 799, image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=400' },
      { size: '40 Pieces', price: 1699, image: 'https://images.unsplash.com/photo-1533038590840-1cde6b56f405?auto=format&fit=crop&q=80&w=400' },
    ]
  },
  {
    id: 'collagen',
    name: 'Beef Collagen',
    description: 'Premium liquid collagen for dogs. Supports skin elasticity, coat shine, and joint mobility.',
    image: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&q=80&w=800',
    benefits: [
      'Improves Skin Elasticity & Coat Shine',
      'Supports Healthy Gut Lining',
      'Aids in Muscle & Tissue Repair'
    ],
    options: [
      { size: '250ml Jar', price: 999, image: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&q=80&w=400' },
      { size: '500ml Jar', price: 1799, image: 'https://images.unsplash.com/photo-1626224734893-6902967675e4?auto=format&fit=crop&q=80&w=400' }
    ]
  },
  {
    id: 'liver-treats',
    name: 'Liver Treats',
    description: 'Iron-rich, protein-packed dehydrated liver bites. The ultimate high-value training reward.',
    image: 'https://images.unsplash.com/photo-1589924691995-400dc99ee5af?auto=format&fit=crop&q=80&w=800',
    benefits: [
      'Concentrated Source of Vitamin A & Iron',
      'Highly Palatable for Training',
      'Supports Cognitive Health'
    ],
    options: [
      { size: '50g Bag', price: 399, image: 'https://images.unsplash.com/photo-1589924691995-400dc99ee5af?auto=format&fit=crop&q=80&w=400' },
      { size: '100g Bag', price: 699, image: 'https://images.unsplash.com/photo-1591769225440-811ad7d62ca3?auto=format&fit=crop&q=80&w=400' },
      { size: '250g Bag', price: 1499, image: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&q=80&w=400' }
    ]
  }
];

export default function App() {
  const [currentView, setCurrentView] = useState<'home' | 'products'>('home');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState<Record<string, number>>({
    'crunchy-paws': 0
  });
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subFrequency, setSubFrequency] = useState(30);
  const [activeHeroIdx, setActiveHeroIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      if (currentView === 'home') {
        setActiveHeroIdx(prev => (prev + 1) % PRODUCTS.length);
      }
    }, 8000);
    return () => clearInterval(timer);
  }, [currentView]);

  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'info'>('cart');
  const [contactInfo, setContactInfo] = useState({ name: '', phone: '', address: '' });

  const cartTotal = useMemo(() => 
    cart.reduce((sum, item) => {
      const price = item.isSubscription ? item.price * 0.9 : item.price;
      return sum + (price * item.quantity);
    }, 0),
  [cart]);

  const addToCart = (product: Product, optionIndex: number) => {
    const option = product.options[optionIndex];
    if (!option) return;

    const existingItem = cart.find(item => 
      item.id === product.id && 
      item.size === option.size && 
      item.isSubscription === isSubscribing &&
      (!isSubscribing || item.frequency === subFrequency)
    );
    
    if (existingItem) {
      setCart(cart.map(item => 
        (item.id === product.id && item.size === option.size && item.isSubscription === isSubscribing && (!isSubscribing || item.frequency === subFrequency))
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, {
        id: product.id,
        name: product.name,
        image: option.image || product.image,
        size: option.size,
        price: option.price,
        quantity: 1,
        isSubscription: isSubscribing,
        frequency: isSubscribing ? subFrequency : undefined
      }]);
    }
    setIsCartOpen(true);
    setCheckoutStep('cart');
  };

  const handleCheckout = () => {
    if (checkoutStep === 'cart') {
      setCheckoutStep('info');
    } else {
      if (!contactInfo.name || !contactInfo.phone || !contactInfo.address) {
        alert("Please fill in all contact details.");
        return;
      }
      alert(`Thank you ${contactInfo.name}! Your order for LKR ${cartTotal.toLocaleString()} has been received. We will contact you at ${contactInfo.phone} to confirm delivery.`);
      setCart([]);
      setCheckoutStep('cart');
      setIsCartOpen(false);
      setContactInfo({ name: '', phone: '', address: '' });
    }
  };

  const updateQuantity = (itemId: string, size: string, delta: number, isSub: boolean, freq?: number) => {
    setCart(cart.map(item => {
      if (item.id === itemId && item.size === size && item.isSubscription === isSub && item.frequency === freq) {
        const newQty = Math.max(0, item.quantity + delta);
        return newQty === 0 ? null : { ...item, quantity: newQty };
      }
      return item;
    }).filter((item): item is CartItem => item !== null));
    
    if (cart.length === 1 && delta < 0 && cart[0].quantity === 1) {
      setCheckoutStep('cart');
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg text-[#1a1a1a] flex selection:bg-emerald-100">
      {/* Left Sidebar - Brand Identity */}
      <aside className="fixed left-0 top-0 bottom-0 w-16 border-r border-brand-border hidden lg:flex flex-col items-center py-12 justify-between z-40 bg-brand-bg">
        <div className="[writing-mode:vertical-rl] rotate-180 text-[10px] tracking-[0.3em] font-medium text-gray-400 uppercase">
          Artisanal Pet Nutrition
        </div>
        <div className="h-24 w-[1px] bg-brand-border"></div>
        <div className="[writing-mode:vertical-rl] rotate-180 text-[10px] tracking-[0.3em] font-medium text-gray-400 uppercase">
          Est. 2024
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-16">
        {/* Navigation */}
        <nav className="h-20 flex items-center justify-between px-8 md:px-16 border-b border-brand-border bg-brand-bg/80 backdrop-blur-sm sticky top-0 z-30">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setCurrentView('home')}
              className="text-3xl font-serif tracking-tight font-light hover:opacity-70 transition-opacity"
            >
              Haloa
            </button>
            <div className="hidden md:flex items-center gap-6 ml-8">
              <button 
                onClick={() => setCurrentView('home')}
                className={`text-[10px] tracking-[0.2em] uppercase font-bold transition-colors ${currentView === 'home' ? 'text-emerald-900 border-b-2 border-emerald-900' : 'text-gray-400 hover:text-emerald-800'}`}
              >
                Home
              </button>
              <button 
                onClick={() => setCurrentView('products')}
                className={`text-[10px] tracking-[0.2em] uppercase font-bold transition-colors ${currentView === 'products' ? 'text-emerald-900 border-b-2 border-emerald-900' : 'text-gray-400 hover:text-emerald-800'}`}
              >
                Our Products
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-8">
            <button 
              onClick={() => { setIsCartOpen(true); setCheckoutStep('cart'); }}
              className="relative p-2 hover:bg-gray-100 rounded-full transition-colors group"
            >
              <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-emerald-900 text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                  {cart.reduce((a, b) => a + b.quantity, 0)}
                </span>
              )}
            </button>
          </div>
        </nav>

        <AnimatePresence mode="wait">
          {currentView === 'home' ? (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {/* Hero Slider Section */}
              <header className="p-8 md:p-16 lg:p-24 bg-brand-bg relative overflow-hidden">
                <div className="max-w-6xl mx-auto">
                  <AnimatePresence mode="wait">
                    <motion.div 
                      key={activeHeroIdx}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.5 }}
                      className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center"
                    >
                      <div className="lg:col-span-7">
                        <div className="flex items-center gap-4 mb-4">
                          <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-emerald-800">Featured Nutrition</span>
                          <div className="h-[1px] w-12 bg-emerald-800/30"></div>
                        </div>
                        <h2 className="text-6xl md:text-8xl lg:text-9xl font-serif leading-[0.85] mb-8 italic">
                          {PRODUCTS[activeHeroIdx].name.split(' ')[0]}<br />
                          {PRODUCTS[activeHeroIdx].name.split(' ')[1]}
                        </h2>
                        <p className="text-xl leading-relaxed text-gray-600 font-light mb-12 max-w-md">
                          {PRODUCTS[activeHeroIdx].description}
                        </p>
                        
                        {/* Subscription & Frequency Selector */}
                        <div className="mb-10 space-y-4">
                          <div className="flex items-center gap-4 bg-emerald-900/5 p-4 rounded-xl max-w-sm border border-emerald-900/10">
                            <button 
                              onClick={() => setIsSubscribing(!isSubscribing)}
                              className={`w-12 h-6 rounded-full transition-colors relative ${isSubscribing ? 'bg-emerald-800' : 'bg-gray-200'}`}
                            >
                              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${isSubscribing ? 'left-7' : 'left-1'}`}></div>
                            </button>
                            <div className="flex flex-col">
                              <span className="text-[10px] uppercase tracking-widest font-bold">Subscribe & Save 10%</span>
                              <span className="text-[9px] text-emerald-800 opacity-60">Custom delivery intervals</span>
                            </div>
                          </div>

                          {isSubscribing && (
                            <motion.div 
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="flex gap-2 p-2 bg-white border border-brand-border rounded-lg max-w-xs"
                            >
                              {[30, 45, 60].map(days => (
                                <button
                                  key={days}
                                  onClick={() => setSubFrequency(days)}
                                  className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest transition-all rounded ${
                                    subFrequency === days ? 'bg-emerald-900 text-white' : 'text-gray-400 hover:bg-gray-50'
                                  }`}
                                >
                                  {days} Days
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </div>

                        {/* Product Size Selectors */}
                        <div className="flex flex-wrap gap-4 mb-16">
                          {PRODUCTS[activeHeroIdx].options.map((opt, idx) => (
                            <button
                              key={opt.size}
                              onClick={() => setSelectedSizes(prev => ({ ...prev, [PRODUCTS[activeHeroIdx].id]: idx }))}
                              className={`flex flex-col p-6 w-40 transition-all border group relative overflow-hidden ${
                                selectedSizes[PRODUCTS[activeHeroIdx].id] === idx
                                  ? 'bg-emerald-900 border-emerald-900 text-white shadow-2xl scale-105 z-10'
                                  : 'bg-white border-brand-border text-gray-400 hover:border-emerald-900/30'
                              }`}
                            >
                              {opt.image && (
                                <div className="absolute -right-4 -top-4 w-20 h-20 opacity-20 group-hover:opacity-40 transition-opacity">
                                  <img src={opt.image} alt="" className="w-full h-full object-cover rounded-full" />
                                </div>
                              )}
                              <span className={`text-[10px] uppercase tracking-widest mb-2 relative z-10 ${
                                selectedSizes[PRODUCTS[activeHeroIdx].id] === idx ? 'text-emerald-200' : 'text-gray-400'
                              }`}>
                                {idx === 0 ? 'Starter' : idx === 1 ? 'Value' : 'Premium'}
                              </span>
                              <span className="text-2xl font-serif mb-1 relative z-10 whitespace-nowrap">{opt.size}</span>
                              <div className="flex items-center gap-2 relative z-10">
                                {isSubscribing && (
                                  <span className="text-xs line-through opacity-40">LKR {opt.price.toLocaleString()}</span>
                                )}
                                <span className={`font-medium ${
                                  selectedSizes[PRODUCTS[activeHeroIdx].id] === idx ? 'text-white' : 'text-emerald-800'
                                }`}>
                                  LKR {(isSubscribing ? opt.price * 0.9 : opt.price).toLocaleString()}
                                </span>
                              </div>
                            </button>
                          ))}
                        </div>

                        <div className="flex items-center gap-6">
                          <button 
                            onClick={() => addToCart(PRODUCTS[activeHeroIdx], selectedSizes[PRODUCTS[activeHeroIdx].id] || 0)}
                            className="px-12 py-5 bg-emerald-900 text-white font-serif italic text-xl hover:bg-emerald-950 transition-all flex items-center gap-4 group"
                          >
                            {isSubscribing ? 'Start Monthly Cycle' : 'Add to Delivery'} <div className="w-8 h-[1px] bg-white group-hover:w-12 transition-all"></div>
                          </button>
                          
                          <div className="flex gap-2">
                            {PRODUCTS.map((_, i) => (
                              <button 
                                key={i}
                                onClick={() => setActiveHeroIdx(i)}
                                className={`w-2 h-2 rounded-full transition-all ${activeHeroIdx === i ? 'bg-emerald-900 w-8' : 'bg-emerald-200'}`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="lg:col-span-5 relative">
                        <div className="aspect-[4/5] bg-emerald-900/5 rounded-t-[10rem] overflow-hidden border border-brand-border relative">
                          <AnimatePresence mode="wait">
                            <motion.img 
                              key={`${activeHeroIdx}-${selectedSizes[PRODUCTS[activeHeroIdx].id]}`}
                              initial={{ opacity: 0, scale: 1.1 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              transition={{ duration: 0.4 }}
                              src={PRODUCTS[activeHeroIdx].options[selectedSizes[PRODUCTS[activeHeroIdx].id] || 0]?.image || PRODUCTS[activeHeroIdx].image} 
                              alt="Product Selection"
                              className="w-full h-full object-cover grayscale-[20%] hover:grayscale-0 transition-all duration-700"
                              referrerPolicy="no-referrer"
                            />
                          </AnimatePresence>
                        </div>
                        <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-emerald-900/10 rounded-full blur-2xl"></div>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </header>

              {/* Benefits Section */}
              <section className="bg-white border-t border-brand-border p-8 md:p-16 lg:p-24">
                <div className="max-w-6xl mx-auto">
                  <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-gray-400 block mb-12 text-center">Beyond the Crunch</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                    {PRODUCTS[0].benefits.map((benefit, i) => (
                      <div key={i} className="flex flex-col items-center text-center">
                        <div className="w-10 h-10 bg-emerald-900/5 rounded-full flex items-center justify-center mb-6">
                          <Check className="w-5 h-5 text-emerald-800" />
                        </div>
                        <p className="font-serif italic text-lg leading-tight">{benefit}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Info Blocks */}
              <section className="border-t border-brand-border p-8 md:p-16 lg:p-24 grid grid-cols-1 md:grid-cols-3 gap-16">
                 <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-widest text-emerald-800 font-bold mb-4">Origin</span>
                  <h4 className="text-2xl font-serif italic mb-3">Locally Sourced</h4>
                  <p className="text-sm text-gray-500 font-light leading-relaxed">
                    Supporting local Sri Lankan farmers while ensuring the shortest supply chain for maximum freshness.
                  </p>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-widest text-emerald-800 font-bold mb-4">Process</span>
                  <h4 className="text-2xl font-serif italic mb-3">Low-Temp Air Dried</h4>
                  <p className="text-sm text-gray-500 font-light leading-relaxed">
                    We dehydrate our treats at precise temperatures to preserve vital nutrients and enzymes without harsh additives.
                  </p>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-widest text-emerald-800 font-bold mb-4">Integrity</span>
                  <h4 className="text-2xl font-serif italic mb-3">No Additives</h4>
                  <p className="text-sm text-gray-500 font-light leading-relaxed">
                    Absolutely zero salt, sugar, preservatives, or artificial colors. Just 100% natural chicken feet.
                  </p>
                </div>
              </section>
            </motion.div>
          ) : (
            <motion.div
              key="products"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-8 md:p-16 lg:p-24"
            >
              <div className="max-w-6xl mx-auto">
                <header className="mb-20">
                  <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-gray-400 block mb-4">Our Collection</span>
                  <h2 className="text-6xl font-serif italic">Artisanal Selection</h2>
                </header>

                <div className="space-y-32">
                  {PRODUCTS.map((product) => (
                    <div key={product.id} className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
                      <div className="lg:col-span-5 relative">
                        <div className="aspect-[4/5] bg-brand-bg border border-brand-border overflow-hidden relative shadow-sm">
                          <img 
                            src={product.image} 
                            alt={product.name}
                            className="w-full h-full object-cover grayscale-[20%] transition-all duration-1000 hover:grayscale-0"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      </div>
                      <div className="lg:col-span-7">
                        <h3 className="text-5xl font-serif mb-6 italic">{product.name}</h3>
                        <p className="text-xl text-gray-500 font-light mb-10 leading-relaxed max-w-lg">{product.description}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                          <div className="space-y-4">
                            <span className="text-[10px] uppercase tracking-widest font-bold text-emerald-800">Key Benefits</span>
                            <ul className="space-y-3">
                              {product.benefits.map((benefit, i) => (
                                <li key={i} className="flex items-start gap-3 text-sm font-light text-gray-600">
                                  <Check className="w-4 h-4 text-emerald-800 mt-0.5 flex-shrink-0" />
                                  {benefit}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="space-y-4">
                            <span className="text-[10px] uppercase tracking-widest font-bold text-emerald-800">Select & Add</span>
                            <div className="flex flex-col gap-3">
                              {product.options.map((opt, idx) => (
                                <div 
                                  key={opt.size}
                                  className={`p-4 border flex justify-between items-center transition-all group overflow-hidden relative ${
                                    selectedSizes[product.id] === idx ? 'border-emerald-900 bg-emerald-900/5 shadow-sm' : 'border-brand-border'
                                  }`}
                                  onClick={() => setSelectedSizes(prev => ({ ...prev, [product.id]: idx }))}
                                >
                                  <div className="flex items-center gap-4 relative z-10 cursor-pointer">
                                    {opt.image && (
                                      <div className="w-12 h-12 bg-gray-100 flex-shrink-0">
                                        <img src={opt.image} alt="" className="w-full h-full object-cover grayscale-[20%]" />
                                      </div>
                                    )}
                                    <div className="flex flex-col">
                                      <span className="text-sm font-medium">{opt.size}</span>
                                      <span className="text-emerald-900 font-serif">LKR {opt.price.toLocaleString()}</span>
                                    </div>
                                  </div>
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      addToCart(product, idx);
                                    }}
                                    className="p-3 bg-emerald-900 text-white rounded-full hover:bg-emerald-950 transition-all opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 lg:group-hover:translate-x-0 translate-x-4 duration-300"
                                  >
                                    <Plus className="w-4 h-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-8 border-t border-brand-border pt-10">
                          <div className="flex flex-col">
                            <span className="text-[10px] uppercase tracking-widest font-bold text-emerald-800 mb-2">Subscription Ready</span>
                            <label className="flex items-center gap-3 cursor-pointer group">
                              <div 
                                onClick={() => setIsSubscribing(!isSubscribing)}
                                className={`w-10 h-5 rounded-full transition-colors relative ${isSubscribing ? 'bg-emerald-800' : 'bg-gray-200'}`}
                              >
                                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${isSubscribing ? 'left-5.5' : 'left-0.5'}`}></div>
                              </div>
                              <span className="text-sm font-light text-gray-500">Enable Subscription (-10%)</span>
                            </label>
                          </div>
                          {isSubscribing && (
                             <div className="flex gap-2 p-1 bg-brand-bg md:border-l border-brand-border md:pl-8">
                               {[30, 45, 60].map(days => (
                                 <button
                                   key={days}
                                   onClick={() => setSubFrequency(days)}
                                   className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all ${
                                     subFrequency === days ? 'bg-emerald-900 text-white shadow-lg' : 'text-gray-400 hover:text-emerald-800'
                                   }`}
                                 >
                                   {days}d
                                 </button>
                               ))}
                             </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>


        {/* Footer */}
        <footer className="p-8 md:p-16 lg:p-24 flex flex-col md:flex-row justify-between items-end gap-12 border-t border-brand-border">
          <div className="space-y-4">
            <span className="text-[10px] uppercase tracking-widest text-gray-400">Inquiries</span>
            <p className="text-2xl font-serif italic">hello@haloa.pets</p>
            <p className="text-xs uppercase tracking-widest font-medium">Colombo, Sri Lanka</p>
          </div>
          <div className="text-[10px] leading-relaxed text-gray-400 max-w-xs text-right uppercase tracking-widest space-y-2">
            <p>© 2024 Haloa Pet Co.</p>
            <p>All products are free from preservatives, additives, and hidden salt.</p>
          </div>
        </footer>
      </div>

      {/* Shopping Cart Drawer (Preserved Logic, Re-Styled) */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-emerald-950/20 backdrop-blur-sm z-50"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white z-[60] shadow-2xl flex flex-col border-l border-brand-border"
            >
              <div className="p-8 border-b border-brand-border flex items-center justify-between bg-brand-bg">
                <h3 className="text-3xl font-serif italic">
                  {checkoutStep === 'cart' ? 'The Order' : 'Details'}
                </h3>
                <button 
                  onClick={() => setIsCartOpen(false)}
                  className="p-2 hover:bg-emerald-50 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-emerald-900" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8">
                {checkoutStep === 'cart' ? (
                  <div className="space-y-8">
                    {cart.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center opacity-30 space-y-4 pt-20">
                        <ShoppingBag className="w-12 h-12" />
                        <p className="font-serif italic text-2xl">Your bag is empty</p>
                        <button 
                          onClick={() => setIsCartOpen(false)}
                          className="text-xs uppercase tracking-widest font-bold border-b border-black pb-1 hover:opacity-70 transition-all"
                        >
                          Discover Haloa
                        </button>
                      </div>
                    ) : (
                      cart.map((item) => (
                        <div key={`${item.id}-${item.size}`} className="flex gap-6 group border-b border-brand-border pb-6">
                          <div className="w-20 h-24 bg-gray-50 flex-shrink-0">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover grayscale-[20%]" referrerPolicy="no-referrer" />
                          </div>
                            <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-serif italic text-xl">
                            {item.name}
                            {item.isSubscription && <span className="text-[9px] uppercase tracking-widest font-bold text-emerald-800 ml-2">({item.frequency} Day Cycle)</span>}
                          </h4>
                          <button 
                            onClick={() => updateQuantity(item.id, item.size, -item.quantity, item.isSubscription, item.frequency)}
                            className="p-1 opacity-0 group-hover:opacity-100 hover:text-red-800 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-[10px] uppercase tracking-widest text-emerald-800 font-bold mb-4">
                          {item.size} — LKR {item.price.toLocaleString()} {item.isSubscription && <span className="text-emerald-900/40">- 10% Off</span>}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm font-medium">
                            <button onClick={() => updateQuantity(item.id, item.size, -1, item.isSubscription, item.frequency)} className="hover:text-emerald-800">—</button>
                            <span>{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, item.size, 1, item.isSubscription, item.frequency)} className="hover:text-emerald-800">+</button>
                          </div>
                          <span className="font-serif italic">
                            LKR {( (item.isSubscription ? item.price * 0.9 : item.price) * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      </div>
                        </div>
                      ))
                    )}
                  </div>
                ) : (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                    <div className="space-y-6">
                      <div className="group">
                        <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2 group-focus-within:text-emerald-800 transition-colors">Recipient</label>
                        <input 
                          type="text" 
                          value={contactInfo.name}
                          onChange={(e) => setContactInfo({ ...contactInfo, name: e.target.value })}
                          className="w-full bg-brand-bg border-b border-brand-border py-2 focus:outline-none focus:border-emerald-800 transition-colors text-lg font-serif italic"
                          placeholder="Your Name"
                        />
                      </div>
                      <div className="group">
                        <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2 group-focus-within:text-emerald-800 transition-colors">Contact</label>
                        <input 
                          type="tel" 
                          value={contactInfo.phone}
                          onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                          className="w-full bg-brand-bg border-b border-brand-border py-2 focus:outline-none focus:border-emerald-800 transition-colors text-lg font-serif italic"
                          placeholder="077 XXXXXXX"
                        />
                      </div>
                      <div className="group">
                        <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2 group-focus-within:text-emerald-800 transition-colors">Address</label>
                        <textarea 
                          rows={2}
                          value={contactInfo.address}
                          onChange={(e) => setContactInfo({ ...contactInfo, address: e.target.value })}
                          className="w-full bg-brand-bg border-b border-brand-border py-2 focus:outline-none focus:border-emerald-800 transition-colors text-lg font-serif italic resize-none"
                          placeholder="Your street address"
                        />
                      </div>
                    </div>
                    
                    <div className="p-6 bg-emerald-900/5 border border-emerald-900/10 italic">
                      <span className="text-[10px] uppercase tracking-widest font-bold text-emerald-800 block mb-4">Summary</span>
                      {cart.map(item => (
                        <div key={item.id+item.size+item.isSubscription+(item.frequency || '')} className="flex justify-between text-sm mb-1">
                          <span className="opacity-60">
                            {item.name} ({item.size}) {item.isSubscription ? `(${item.frequency} Days)` : ''} x {item.quantity}
                          </span>
                          <span>LKR {((item.isSubscription ? item.price * 0.9 : item.price) * item.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>

                    <button 
                      onClick={() => setCheckoutStep('cart')}
                      className="text-[10px] font-bold uppercase tracking-widest opacity-40 hover:opacity-100 flex items-center gap-2"
                    >
                      <Minus className="w-3 h-3" /> Back to Bag
                    </button>
                  </motion.div>
                )}
              </div>

              {cart.length > 0 ? (
                <div className="p-8 border-t border-brand-border bg-brand-bg space-y-8">
                  <div className="flex justify-between items-baseline">
                    <span className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-30">Subtotal</span>
                    <span className="text-4xl font-serif italic">LKR {cartTotal.toLocaleString()}</span>
                  </div>
                  <button 
                    className="w-full py-6 bg-emerald-900 text-white font-serif italic text-xl hover:bg-emerald-950 transition-all flex items-center justify-center gap-6 group"
                    onClick={handleCheckout}
                  >
                    {checkoutStep === 'cart' ? 'Continue' : 'Confirm Order'} 
                    <div className="w-8 h-[1px] bg-white group-hover:w-16 transition-all"></div>
                  </button>
                  <p className="text-[9px] text-center opacity-40 uppercase tracking-[0.2em]">
                    {checkoutStep === 'cart' ? 'Sri Lanka Delivery' : 'Bank Transfer / Cash'}
                  </p>
                </div>
              ) : null}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

