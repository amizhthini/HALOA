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
  ChevronLeft,
  Heart, 
  Sparkles, 
  Check, 
  ArrowRight,
  Menu,
  X,
  Bone,
  Smile,
  Zap,
  Leaf,
  MapPin,
  Wind,
  Shield,
  User,
  Package,
  Truck,
  History,
  CreditCard,
  CloudUpload,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  auth, 
  db, 
  signInWithGoogle, 
  logOut, 
  handleFirestoreError, 
  OperationType 
} from './lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  onSnapshot, 
  serverTimestamp, 
  orderBy,
  doc,
  updateDoc
} from 'firebase/firestore';

// Types
interface Product {
  id: string;
  name: string;
  description: string;
  image: string;
  benefits: {
    icon: any;
    text: string;
  }[];
  process: {
    step: string;
    label: string;
    title: string;
    description: string;
    icon: any;
    image: string;
  }[];
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
  subscriptionType?: 'none' | 'monthly' | 'annual';
  frequency?: number;
}

// Data
const PRODUCTS: Product[] = [
  {
    id: 'crunchy-paws',
    name: 'Crunchy Paws',
    description: 'Dehydrated chicken feet. A natural source of glucosamine and chondroitin for healthy joints.',
    image: 'input_file_0.png',
    benefits: [
      { icon: Bone, text: 'Natural Glucosamine & Chondroitin for Joint Support' },
      { icon: Smile, text: 'Promotes Dental Hygiene through Chewing Action' },
      { icon: Zap, text: 'Rich in Bio-available Collagen' },
      { icon: Leaf, text: 'Grain-Free & Low in Fat' }
    ],
    process: [
      {
        step: '01',
        label: 'Origin',
        title: 'Locally Sourced',
        description: 'Supporting local Sri Lankan farmers while ensuring the shortest supply chain for maximum freshness.',
        icon: MapPin,
        image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=600'
      },
      {
        step: '02',
        label: 'Process',
        title: 'Low-Temp Air Dried',
        description: 'We dehydrate our treats at precise temperatures to preserve vital nutrients and enzymes without harsh additives.',
        icon: Wind,
        image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=600'
      },
      {
        step: '03',
        label: 'Integrity',
        title: 'No Additives',
        description: 'Absolutely zero salt, sugar, preservatives, or artificial colors. Just 100% natural chicken feet.',
        icon: Shield,
        image: 'input_file_2.png'
      }
    ],
    options: [
      { size: '12 Pieces', price: 599, image: 'input_file_2.png' },
      { size: '20 Pieces', price: 799, image: 'input_file_1.png' },
      { size: '40 Pieces', price: 1990, image: 'input_file_0.png' },
    ]
  },
  {
    id: 'collagen',
    name: 'Beef Collagen',
    description: 'Premium liquid collagen for dogs. Supports skin elasticity, coat shine, and joint mobility.',
    image: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&q=80&w=800',
    benefits: [
      { icon: Zap, text: 'Improves Skin Elasticity & Coat Shine' },
      { icon: Shield, text: 'Supports Healthy Gut Lining' },
      { icon: Bone, text: 'Aids in Muscle & Tissue Repair' },
      { icon: Sparkles, text: '100% Bio-available Nutrients' }
    ],
    process: [
      {
        step: '01',
        label: 'Sourcing',
        title: 'Ethically Farmed',
        description: 'Our beef collagen is sourced from grass-fed cattle, ensuring a pure and ethical supply chain.',
        icon: Leaf,
        image: 'https://images.unsplash.com/photo-1502472545331-cb294ee1648c?auto=format&fit=crop&q=80&w=600'
      },
      {
        step: '02',
        label: 'Craft',
        title: 'Small Batch Extraction',
        description: 'Simmered slowly at low temperatures to preserve the delicate peptide structures of the collagen.',
        icon: Sparkles,
        image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=600'
      },
      {
        step: '03',
        label: 'Purity',
        title: 'Triple Filtration',
        description: 'Fine filtration ensures a smooth, highly concentrated liquid collagen free from any sediment or additives.',
        icon: Shield,
        image: 'https://images.unsplash.com/photo-1626224734893-6902967675e4?auto=format&fit=crop&q=80&w=600'
      }
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
      { icon: Zap, text: 'Concentrated Source of Vitamin A & Iron' },
      { icon: Smile, text: 'Highly Palatable for Training' },
      { icon: Shield, text: 'Supports Cognitive Health' },
      { icon: Heart, text: 'Zero Fillers or Preservatives' }
    ],
    process: [
      {
        step: '01',
        label: 'Quality',
        title: 'Premium Raw Cuts',
        description: 'We select only the finest human-grade liver, ensuring every bite is packed with vitamins.',
        icon: Check,
        image: 'https://images.unsplash.com/photo-1607623198457-7aad0d6a8348?auto=format&fit=crop&q=80&w=600'
      },
      {
        step: '02',
        label: 'Care',
        title: 'Precision Slicing',
        description: 'Bite-sized pieces are carefully cut to maintain texture while allowing for even dehydration.',
        icon: Sparkles,
        image: 'https://images.unsplash.com/photo-1589924691995-400dc99ee5af?auto=format&fit=crop&q=80&w=600'
      },
      {
        step: '03',
        label: 'Nature',
        title: 'Fresh Dehydration',
        description: 'Cold-air dehydration locks in nutrition without compromising the high-value flavor profile.',
        icon: Wind,
        image: 'https://images.unsplash.com/photo-1591769225440-811ad7d62ca3?auto=format&fit=crop&q=80&w=600'
      }
    ],
    options: [
      { size: '50g Bag', price: 399, image: 'https://images.unsplash.com/photo-1589924691995-400dc99ee5af?auto=format&fit=crop&q=80&w=400' },
      { size: '100g Bag', price: 699, image: 'https://images.unsplash.com/photo-1591769225440-811ad7d62ca3?auto=format&fit=crop&q=80&w=400' },
      { size: '250g Bag', price: 1499, image: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&q=80&w=400' }
    ]
  }
];

// Why Subscribe Component with Interactive Graphical View
const WhySubscribe = () => {
  const [estimateFoodPrice, setEstimateFoodPrice] = useState(15000); // Default estimate monthly budget in LKR
  
  // Calculate yearly costs:
  // Assume 12 orders a year
  // One-off delivery estimate: LKR 800 per delivery
  const deliveryCostPerOrder = 800;
  const yearlyOneOff = (estimateFoodPrice * 12) + (deliveryCostPerOrder * 12);
  const yearlyMonthly = (estimateFoodPrice * 0.95 * 12);
  const yearlyAnnual = (estimateFoodPrice * 0.90 * 12);

  const maxVal = Math.max(yearlyOneOff, yearlyMonthly, yearlyAnnual);

  return (
    <section className="bg-brand-bg border-t border-brand-border p-8 md:p-16 lg:p-24">
      <div className="max-w-6xl mx-auto">
        <span className="text-sm uppercase tracking-[0.25em] font-extrabold text-emerald-800 block mb-4 text-center md:text-left">Membership Perks</span>
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif italic mb-12 text-center md:text-left">Why Subscribe to Haloa?</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          {/* Left Column: Key subscription benefits */}
          <div className="lg:col-span-6 space-y-10">
            <p className="text-xl text-gray-700 font-normal leading-relaxed">
              Our subscription service is designed to keep your pet's bowl filled with freshly prepared, preservative-free meals on autopilot, while being kinder to your wallet.
            </p>
            
            <div className="space-y-8">
              {[
                { 
                  title: 'Consistent Freshness & Zero Additives', 
                  desc: 'Every subscription cycle guarantees priority preparation. Meals are cooked in small, artisanal batches and shipped direct, ensuring continuous nutritional integrity.' 
                },
                { 
                  title: '100% Free Delivery, No Exceptions', 
                  desc: 'Whether you choose a monthly or annual subscription, and no matter your shipping interval (20d, 45d, or 60d), delivery is completely free.' 
                },
                { 
                  title: 'Flexible & Pauseable Cycles', 
                  desc: 'Going away or have extra food left? Easily pause, modify intervals, or cancel your subscription at any time directly from your dashboard with zero fees.' 
                },
                { 
                  title: 'Exclusive Member Privileges', 
                  desc: 'Annual subscribers automatically unlock the Pawsome Cycle, which includes priority batch allocations, custom birthday treats, and first access to seasonal recipes.' 
                }
              ].map((benefit, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-emerald-900/10 text-emerald-900 flex items-center justify-center font-serif italic text-sm font-extrabold mt-1 shrink-0">
                    {i + 1}
                  </div>
                  <div>
                    <h4 className="font-serif italic text-xl text-emerald-950 mb-1.5 font-semibold">{benefit.title}</h4>
                    <p className="text-base text-gray-600 font-light leading-relaxed">{benefit.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Right Column: Comparative Interactive Graph */}
          <div className="lg:col-span-6 bg-white border border-brand-border p-8 md:p-10 rounded-[2rem] shadow-md space-y-8">
            <div>
              <span className="text-xs uppercase tracking-widest font-extrabold text-emerald-800 block mb-2">Estimate Your Savings</span>
              <h3 className="text-3xl font-serif italic text-emerald-950">Yearly Value Calculator</h3>
            </div>
            
            {/* Input Slider for Monthly Budget */}
            <div className="space-y-4">
              <div className="flex justify-between text-base font-semibold">
                <span className="text-gray-600">Monthly Pet Food Expense:</span>
                <span className="font-serif font-bold text-emerald-900 text-lg">LKR {estimateFoodPrice.toLocaleString()}</span>
              </div>
              <input 
                type="range" 
                min="5000" 
                max="50000" 
                step="2500" 
                value={estimateFoodPrice} 
                onChange={(e) => setEstimateFoodPrice(Number(e.target.value))}
                className="w-full accent-emerald-900 h-1.5 bg-emerald-900/10 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 uppercase tracking-wider font-bold">
                <span>5,000 LKR</span>
                <span>25,000 LKR</span>
                <span>50,000 LKR</span>
              </div>
            </div>

            {/* Graphical Visualization Bars */}
            <div className="space-y-6 pt-6 border-t border-brand-border">
              {/* One-off Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-semibold">
                  <span className="text-gray-600">One-off Orders (12 Months)</span>
                  <span className="text-gray-800 font-bold">LKR {yearlyOneOff.toLocaleString()}</span>
                </div>
                <div className="relative h-8 bg-gray-100 rounded-md overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(yearlyOneOff / maxVal) * 100}%` }}
                    transition={{ duration: 0.5 }}
                    className="absolute top-0 left-0 bottom-0 bg-gray-300 rounded-md flex items-center pl-3"
                  >
                    <span className="text-xs uppercase tracking-wider font-bold text-gray-750">Standard Price + Shipping</span>
                  </motion.div>
                </div>
              </div>

              {/* Monthly Sub Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-semibold">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-emerald-900 font-bold font-serif italic">Monthly Subscription</span>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded uppercase font-extrabold tracking-wider">Save 5% & Free Delivery</span>
                  </div>
                  <span className="text-emerald-900 font-bold">LKR {yearlyMonthly.toLocaleString()}</span>
                </div>
                <div className="relative h-8 bg-emerald-900/5 rounded-md overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(yearlyMonthly / maxVal) * 100}%` }}
                    transition={{ duration: 0.5 }}
                    className="absolute top-0 left-0 bottom-0 bg-emerald-800/20 rounded-md flex items-center justify-between px-3"
                  >
                    <span className="text-xs uppercase tracking-wider font-extrabold text-emerald-950">Reduced Cost</span>
                    <span className="text-xs font-serif italic font-bold text-emerald-950">Saved LKR {(yearlyOneOff - yearlyMonthly).toLocaleString()}</span>
                  </motion.div>
                </div>
              </div>

              {/* Annual Sub Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-semibold">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-emerald-950 font-bold font-serif italic">Annual Pawsome Cycle</span>
                    <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded uppercase font-extrabold tracking-wider">Save 10% & Free Delivery</span>
                  </div>
                  <span className="text-emerald-950 font-bold text-base">LKR {yearlyAnnual.toLocaleString()}</span>
                </div>
                <div className="relative h-8 bg-emerald-900/10 rounded-md overflow-hidden border border-emerald-900/20">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(yearlyAnnual / maxVal) * 100}%` }}
                    transition={{ duration: 0.5 }}
                    className="absolute top-0 left-0 bottom-0 bg-emerald-900 rounded-md flex items-center justify-between px-3"
                  >
                    <span className="text-xs uppercase tracking-wider font-extrabold text-emerald-100 animate-pulse">Best Value Plan</span>
                    <span className="text-xs font-serif italic font-bold text-emerald-200">Saved LKR {(yearlyOneOff - yearlyAnnual).toLocaleString()}</span>
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Subtle disclaimer */}
            <p className="text-xs text-gray-500 font-normal italic leading-relaxed text-center">
              *Calculated based on estimated average pet feeding cycles consisting of 12 orders per year with an estimated local shipping charge of LKR 800 per shipment. Subscriptions enjoy free delivery on all shipments no matter the intervals (20d, 45d, 60d).
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default function App() {
  const [currentView, setCurrentView] = useState<'home' | 'products' | 'subscribe' | 'dashboard'>('home');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState<Record<string, number>>({
    'crunchy-paws': 0
  });
  const [subscriptionType, setSubscriptionType] = useState<'none' | 'monthly' | 'annual'>('none');
  const isSubscribing = subscriptionType !== 'none';
  const [subFrequency, setSubFrequency] = useState(20);
  const [activeHeroIdx, setActiveHeroIdx] = useState(0);

  // Firebase Auth & Database State
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) {
        setIsLoadingOrders(true);
        const q = query(
          collection(db, 'orders'), 
          where('userId', '==', u.uid),
          orderBy('createdAt', 'desc')
        );
        const unsubOrders = onSnapshot(q, (snapshot) => {
          setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
          setIsLoadingOrders(false);
        }, (error) => {
          handleFirestoreError(error, OperationType.LIST, 'orders');
        });
        return unsubOrders;
      } else {
        setOrders([]);
      }
    });
    return () => unsubscribe();
  }, []);

  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'info' | 'payment' | 'success'>('cart');
  const [contactInfo, setContactInfo] = useState({ name: '', phone: '', address: '' });
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);

  const cartTotal = useMemo(() => 
    cart.reduce((sum, item) => {
      const discount = item.subscriptionType === 'annual' ? 0.90 : item.subscriptionType === 'monthly' ? 0.95 : 1.0;
      const price = Math.round(item.price * discount);
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
      (!isSubscribing || item.subscriptionType === subscriptionType) &&
      (!isSubscribing || item.frequency === subFrequency)
    );
    
    if (existingItem) {
      setCart(cart.map(item => 
        (item.id === product.id && item.size === option.size && item.isSubscription === isSubscribing && (!isSubscribing || item.subscriptionType === subscriptionType) && (!isSubscribing || item.frequency === subFrequency))
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
        subscriptionType: subscriptionType,
        frequency: isSubscribing ? subFrequency : undefined
      }]);
    }
    setIsCartOpen(true);
    setCheckoutStep('cart');
  };

  const handleCheckout = async () => {
    if (!user) {
      const result = await signInWithGoogle();
      if (!result) return;
      return; // User is now signed in, allow them to click again or continue
    }

    if (checkoutStep === 'cart') {
      setCheckoutStep('info');
    } else if (checkoutStep === 'info') {
      if (!contactInfo.name || !contactInfo.phone || !contactInfo.address) {
        alert("Please fill in all contact details.");
        return;
      }
      setCheckoutStep('payment');
    } else if (checkoutStep === 'payment') {
      // Create Order in Firestore
      try {
        const orderData = {
          userId: user.uid,
          items: cart,
          total: cartTotal,
          status: 'pending_payment',
          contactInfo,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        const docRef = await addDoc(collection(db, 'orders'), orderData);
        setLastOrderId(docRef.id);
        setCheckoutStep('success');
        setCart([]);
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, 'orders');
      }
    }
  };

  const uploadReceipt = async (order: any, receiptNote: string) => {
    try {
      const orderRef = doc(db, 'orders', order.id);
      await updateDoc(orderRef, {
        paymentReceipt: receiptNote,
        status: 'paid',
        updatedAt: serverTimestamp(),
        receiptTimestamp: serverTimestamp()
      });

      // Send Email Notification to Admin
      await fetch('/api/notify-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          orderEmail: user?.email || 'N/A',
          total: order.total,
          userDetails: order.contactInfo,
          items: order.items,
          receiptNote
        })
      });

    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `orders/${order.id}`);
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
        <div className="[writing-mode:vertical-rl] rotate-180 text-xs tracking-[0.3em] font-semibold text-gray-500 uppercase">
          Artisanal Pet Nutrition
        </div>
        <div className="h-24 w-[1px] bg-brand-border"></div>
        <div className="[writing-mode:vertical-rl] rotate-180 text-xs tracking-[0.3em] font-semibold text-gray-500 uppercase">
          Est. 2025
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-16">
        {/* Navigation */}
        <nav className="h-20 flex items-center justify-between px-8 md:px-16 border-b border-brand-border bg-brand-bg/80 backdrop-blur-sm sticky top-0 z-30">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setCurrentView('home')}
              className="hover:opacity-80 transition-opacity flex items-center py-1"
            >
              <img src="input_file_3.png" alt="Haloa Logo" className="h-11 md:h-12 w-auto object-contain" referrerPolicy="no-referrer" />
            </button>
            <div className="hidden md:flex items-center gap-6 ml-8">
              <button 
                onClick={() => setCurrentView('home')}
                className={`text-xs md:text-sm tracking-[0.15em] uppercase font-extrabold transition-colors pb-1 ${currentView === 'home' ? 'text-emerald-900 border-b-2 border-emerald-900' : 'text-gray-500 hover:text-emerald-800'}`}
              >
                Home
              </button>
              <button 
                onClick={() => setCurrentView('products')}
                className={`text-xs md:text-sm tracking-[0.15em] uppercase font-extrabold transition-colors pb-1 ${currentView === 'products' ? 'text-emerald-900 border-b-2 border-emerald-900' : 'text-gray-400 hover:text-emerald-800'}`}
              >
                Our Products
              </button>
              <button 
                onClick={() => setCurrentView('subscribe')}
                className={`text-xs md:text-sm tracking-[0.15em] uppercase font-extrabold transition-colors pb-1 ${currentView === 'subscribe' ? 'text-emerald-900 border-b-2 border-emerald-900' : 'text-gray-500 hover:text-emerald-800'}`}
              >
                Why Subscribe?
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-8">
            {user ? (
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setCurrentView('dashboard')}
                  className={`text-xs md:text-sm tracking-[0.15em] uppercase font-extrabold transition-colors flex items-center gap-2 ${currentView === 'dashboard' ? 'text-emerald-900' : 'text-gray-500 hover:text-emerald-800'}`}
                >
                  <History className="w-4 h-4" /> My Orders
                </button>
                <div className="h-4 w-[1px] bg-brand-border"></div>
                <button 
                  onClick={logOut}
                  className="text-xs md:text-sm tracking-[0.15em] uppercase font-extrabold text-gray-500 hover:text-red-800 transition-colors"
                >
                  Logout
                </button>
                <img src={user.photoURL || ''} alt="" className="w-9 h-9 rounded-full border border-brand-border" referrerPolicy="no-referrer" />
              </div>
            ) : (
              <button 
                onClick={() => signInWithGoogle()}
                className="text-xs md:text-sm tracking-[0.15em] uppercase font-extrabold text-emerald-900 border border-emerald-900 px-5 py-2.5 hover:bg-emerald-900 hover:text-white transition-all rounded-lg"
              >
                Sign In
              </button>
            )}
            <button 
              onClick={() => { setIsCartOpen(true); setCheckoutStep('cart'); }}
              className="relative p-2 hover:bg-gray-100 rounded-full transition-colors group"
            >
              <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform" />
              {cart.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-emerald-900 text-white text-[11px] w-5 h-5 flex items-center justify-center rounded-full font-bold shadow-sm">
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
                      <div className="lg:col-span-6">
                        <div className="flex items-center gap-4 mb-4">
                          <span className="text-xs md:text-sm uppercase tracking-[0.2em] font-extrabold text-emerald-800">Featured Nutrition</span>
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
                          <span className="text-xs md:text-sm uppercase tracking-widest font-extrabold text-emerald-850">Select Purchase Plan</span>
                          <div className="grid grid-cols-3 gap-2 bg-emerald-900/5 p-1 rounded-xl max-w-md border border-emerald-900/10">
                            {[
                              { id: 'none', label: 'One-off', discount: 'Regular' },
                              { id: 'monthly', label: 'Monthly', discount: 'Save 5%', delivery: 'Free Delivery' },
                              { id: 'annual', label: 'Annual', discount: 'Save 10%', delivery: 'Free Delivery' }
                            ].map((plan) => (
                              <button
                                key={plan.id}
                                onClick={() => setSubscriptionType(plan.id as 'none' | 'monthly' | 'annual')}
                                className={`py-3 px-2 rounded-lg flex flex-col items-center justify-center transition-all ${
                                  subscriptionType === plan.id 
                                    ? 'bg-emerald-900 text-white shadow-md' 
                                    : 'text-gray-500 hover:text-emerald-900 hover:bg-white/50'
                                }`}
                              >
                                <span className={`font-bold uppercase tracking-wider ${
                                  subscriptionType === plan.id ? 'text-white text-sm' : 'text-gray-655 text-xs'
                                }`}>{plan.label}</span>
                                <span className={`font-serif font-bold mt-1 tracking-wide ${
                                  subscriptionType === plan.id ? 'text-emerald-200 text-sm' : 'text-emerald-900 text-sm'
                                }`}>
                                  {plan.discount}
                                </span>
                                {plan.delivery && (
                                  <span className={`font-extrabold uppercase mt-0.5 tracking-wider ${
                                    subscriptionType === plan.id ? 'text-emerald-100 text-[11px]' : 'text-emerald-800/80 text-[11px]'
                                  }`}>
                                    {plan.delivery}
                                  </span>
                                )}
                              </button>
                            ))}
                          </div>

                          {subscriptionType !== 'none' && (
                            <motion.div 
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="flex items-center gap-3 bg-white p-3 rounded-lg border border-brand-border max-w-sm"
                            >
                              <span className="text-xs md:text-sm uppercase tracking-widest font-bold text-gray-500">Interval:</span>
                              <div className="flex gap-1.5">
                                {[20, 45, 60].map(days => (
                                  <button
                                    key={days}
                                    onClick={() => setSubFrequency(days)}
                                    className={`py-1.5 px-3 text-xs font-bold uppercase tracking-widest transition-all rounded ${
                                      subFrequency === days ? 'bg-emerald-800 text-white' : 'text-gray-455 hover:bg-gray-50'
                                    }`}
                                  >
                                    {days} Days
                                  </button>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </div>

                        {/* Product Size Selectors */}
                        <div className="flex flex-wrap gap-4 mb-16">
                          {PRODUCTS[activeHeroIdx].options.map((opt, idx) => {
                            const discount = subscriptionType === 'annual' ? 0.90 : subscriptionType === 'monthly' ? 0.95 : 1.0;
                            const finalPrice = Math.round(opt.price * discount);
                            return (
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
                                <span className={`text-xs uppercase tracking-widest mb-2 relative z-10 font-bold ${
                                  selectedSizes[PRODUCTS[activeHeroIdx].id] === idx ? 'text-emerald-200' : 'text-gray-400'
                                }`}>
                                  {idx === 0 ? 'Starter' : idx === 1 ? 'Value' : 'Premium'}
                                </span>
                                <span className="text-2xl font-serif mb-1 relative z-10 whitespace-nowrap">{opt.size}</span>
                                <div className="flex items-center gap-2 relative z-10 font-sans">
                                  {subscriptionType !== 'none' && (
                                    <span className="text-xs line-through opacity-40">LKR {opt.price.toLocaleString()}</span>
                                  )}
                                  <span className={`font-medium ${
                                    selectedSizes[PRODUCTS[activeHeroIdx].id] === idx ? 'text-white' : 'text-emerald-800'
                                  }`}>
                                    LKR {finalPrice.toLocaleString()}
                                  </span>
                                </div>
                              </button>
                            );
                          })}
                        </div>

                        <div className="flex flex-wrap items-center gap-6">
                          <button 
                            onClick={() => addToCart(PRODUCTS[activeHeroIdx], selectedSizes[PRODUCTS[activeHeroIdx].id] || 0)}
                            className="px-12 py-5 bg-emerald-900 text-white font-serif italic text-xl hover:bg-emerald-950 transition-all flex items-center gap-4 group"
                          >
                            {subscriptionType === 'annual' ? 'Start Pawsome Cycle' : subscriptionType === 'monthly' ? 'Start Monthly Cycle' : 'Add to Delivery'} <div className="w-8 h-[1px] bg-white group-hover:w-12 transition-all"></div>
                          </button>
                          
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => setActiveHeroIdx(i => (i - 1 + PRODUCTS.length) % PRODUCTS.length)}
                              className="w-10 h-10 rounded-full border border-brand-border flex items-center justify-center text-emerald-900 hover:bg-emerald-900/5 transition-all"
                              aria-label="Previous product"
                            >
                              <ChevronLeft className="w-5 h-5" />
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

                            <button
                              onClick={() => setActiveHeroIdx(i => (i + 1) % PRODUCTS.length)}
                              className="w-10 h-10 rounded-full border border-brand-border flex items-center justify-center text-emerald-900 hover:bg-emerald-900/5 transition-all"
                              aria-label="Next product"
                            >
                              <ChevronRight className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="lg:col-span-6 relative">
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
                  <span className="text-sm uppercase tracking-[0.2em] font-extrabold text-gray-500 block mb-16 text-center">Beyond the Crunch</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                    {PRODUCTS[activeHeroIdx].benefits.map((benefit, i) => (
                      <div key={i} className="flex flex-col items-center text-center group">
                        <div className="w-16 h-16 bg-emerald-900/5 rounded-full flex items-center justify-center mb-8 group-hover:bg-emerald-900 group-hover:text-white transition-all duration-500">
                          <benefit.icon className="w-6 h-6 transition-transform group-hover:scale-110" />
                        </div>
                        <p className="font-serif italic text-xl leading-snug px-4">{benefit.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Process Flow Section */}
              <section className="border-t border-brand-border p-8 md:p-16 lg:p-24 overflow-hidden">
                <div className="max-w-6xl mx-auto">
                  <div className="flex flex-col md:flex-row items-stretch justify-between gap-0 border border-brand-border rounded-[2rem] overflow-hidden bg-white">
                    {PRODUCTS[activeHeroIdx].process.map((item, i) => (
                      <div key={i} className={`flex-1 flex flex-col group relative ${i !== 2 ? 'md:border-r border-brand-border' : ''}`}>
                        <div className="aspect-[16/10] overflow-hidden relative">
                          <img 
                            src={item.image} 
                            alt={item.title} 
                            className="w-full h-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-105" 
                          />
                          <div className="absolute inset-0 bg-emerald-950/20 group-hover:bg-transparent transition-colors"></div>
                          <div className="absolute top-6 left-6 w-12 h-12 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center text-xs font-bold tracking-widest text-emerald-900 border border-emerald-900/20 shadow-sm">
                            {item.step}
                          </div>
                        </div>
                        <div className="p-10 flex flex-col flex-1">
                          <div className="flex items-center gap-3 mb-6">
                            <item.icon className="w-4 h-4 text-emerald-800/60" />
                            <span className="text-xs uppercase tracking-[0.2em] font-extrabold text-emerald-800/60">{item.label}</span>
                          </div>
                          <h4 className="text-3xl font-serif italic mb-4">{item.title}</h4>
                          <p className="text-base text-gray-600 font-light leading-relaxed mb-8">
                            {item.description}
                          </p>
                          <div className="mt-auto pt-8 border-t border-brand-border/50 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-xs uppercase tracking-widest font-bold text-emerald-800">Learn about our standards →</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
              <WhySubscribe />
            </motion.div>
          ) : currentView === 'products' ? (
            <motion.div
              key="products"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-8 md:p-16 lg:p-24"
            >
              <div className="max-w-6xl mx-auto">
                <header className="mb-20">
                  <span className="text-sm uppercase tracking-[0.25em] font-extrabold text-gray-500 block mb-4">Our Collection</span>
                  <h2 className="text-6xl font-serif italic">Artisanal Selection</h2>
                </header>

                <div className="space-y-32">
                  {PRODUCTS.map((product) => (
                    <div key={product.id} className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
                      <div className="lg:col-span-6 relative">
                        <div className="aspect-[4/5] bg-brand-bg border border-brand-border overflow-hidden relative shadow-sm">
                          <img 
                            src={product.image} 
                            alt={product.name}
                            className="w-full h-full object-cover grayscale-[20%] transition-all duration-1000 hover:grayscale-0"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      </div>
                      <div className="lg:col-span-6">
                        <h3 className="text-5xl font-serif mb-6 italic">{product.name}</h3>
                        <p className="text-xl text-gray-500 font-light mb-10 leading-relaxed max-w-lg">{product.description}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                          <div className="space-y-4">
                            <span className="text-xs uppercase tracking-widest font-extrabold text-emerald-800">Key Benefits</span>
                            <ul className="space-y-3">
                              {product.benefits.map((benefit, i) => (
                                <li key={i} className="flex items-start gap-4 text-base font-normal text-gray-600">
                                  <benefit.icon className="w-4 h-4 text-emerald-800 mt-1 flex-shrink-0" />
                                  {benefit.text}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="space-y-4">
                            <span className="text-xs uppercase tracking-widest font-extrabold text-emerald-800">Select & Add</span>
                            <div className="flex flex-col gap-3">
                              {product.options.map((opt, idx) => {
                                const discountPrice = Math.round(opt.price * (subscriptionType === 'annual' ? 0.90 : subscriptionType === 'monthly' ? 0.95 : 1.0));
                                return (
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
                                        <div className="flex items-baseline gap-2">
                                          {subscriptionType !== 'none' && (
                                            <span className="text-xs line-through text-gray-400">LKR {opt.price.toLocaleString()}</span>
                                          )}
                                          <span className="text-emerald-950 font-serif font-medium">
                                            LKR {discountPrice.toLocaleString()}
                                          </span>
                                        </div>
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
                                );
                              })}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-8 border-t border-brand-border pt-10">
                          <div className="flex flex-col">
                            <span className="text-sm uppercase tracking-widest font-extrabold text-emerald-850 mb-2">Select Purchase Plan</span>
                            <div className="flex gap-2 bg-emerald-900/5 p-1 rounded-xl max-w-sm border border-emerald-900/10">
                              {[
                                { id: 'none', label: 'One-off', discount: 'Regular' },
                                { id: 'monthly', label: 'Monthly', discount: 'Save 5%', delivery: 'Free Delivery' },
                                { id: 'annual', label: 'Annual', discount: 'Save 10%', delivery: 'Free Delivery' }
                              ].map((plan) => (
                                <button
                                  key={plan.id}
                                  onClick={() => setSubscriptionType(plan.id as 'none' | 'monthly' | 'annual')}
                                  className={`py-2 px-3 rounded-lg flex flex-col items-center justify-center transition-all ${
                                    subscriptionType === plan.id 
                                      ? 'bg-emerald-900 text-white shadow-sm' 
                                      : 'text-gray-500 hover:text-emerald-900 hover:bg-white/50'
                                  }`}
                                >
                                  <span className={`font-bold uppercase tracking-wider ${
                                    subscriptionType === plan.id ? 'text-white text-sm' : 'text-gray-655 text-xs'
                                  }`}>{plan.label}</span>
                                  <span className={`font-serif font-bold mt-1 tracking-wide ${
                                    subscriptionType === plan.id ? 'text-emerald-200 text-sm' : 'text-emerald-900 text-sm'
                                  }`}>
                                    {plan.discount}
                                  </span>
                                  {plan.delivery && (
                                    <span className={`font-extrabold uppercase mt-0.5 tracking-wider ${
                                      subscriptionType === plan.id ? 'text-emerald-100 text-[11px]' : 'text-emerald-850 text-[11px]'
                                    }`}>
                                      {plan.delivery}
                                    </span>
                                  )}
                                </button>
                              ))}
                            </div>
                          </div>
                          {subscriptionType !== 'none' && (
                             <div className="flex items-center gap-3 bg-brand-bg p-3 rounded-lg border border-brand-border h-fit my-auto">
                               <span className="text-xs md:text-sm uppercase tracking-widest font-bold text-gray-500">Interval:</span>
                               <div className="flex gap-1.5">
                                 {[20, 45, 60].map(days => (
                                   <button
                                     key={days}
                                     onClick={() => setSubFrequency(days)}
                                     className={`py-1.5 px-3.5 text-xs font-bold uppercase tracking-widest transition-all rounded ${
                                       subFrequency === days ? 'bg-emerald-800 text-white' : 'text-gray-455 hover:bg-gray-50'
                                     }`}
                                   >
                                     {days}d
                                   </button>
                                 ))}
                               </div>
                             </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : currentView === 'subscribe' ? (
            <motion.div
              key="subscribe"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-8 md:p-16 lg:p-24"
            >
              <div className="max-w-6xl mx-auto">
                <WhySubscribe />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-8 md:p-16 lg:p-24"
            >
              <div className="max-w-6xl mx-auto">
                <header className="mb-20 flex justify-between items-end">
                  <div>
                    <span className="text-sm uppercase tracking-[0.25em] font-extrabold text-gray-500 block mb-4">Account Dashboard</span>
                    <h2 className="text-6xl font-serif italic">Your Orders</h2>
                  </div>
                  <p className="text-gray-400 font-light italic">Tracking status for artisanal nourishment</p>
                </header>

                {isLoadingOrders ? (
                  <div className="py-20 text-center opacity-40 font-serif italic text-2xl">Retrieving your order history...</div>
                ) : orders.length === 0 ? (
                  <div className="py-20 text-center border border-dashed border-brand-border rounded-[2rem] bg-emerald-900/5">
                    <History className="w-12 h-12 text-emerald-900/20 mx-auto mb-6" />
                    <p className="font-serif italic text-3xl mb-4">No orders yet</p>
                    <button 
                      onClick={() => setCurrentView('products')}
                      className="text-sm uppercase tracking-widest font-bold text-emerald-900 border-b border-emerald-900 pb-1"
                    >
                      Browse the collection
                    </button>
                  </div>
                ) : (
                  <div className="space-y-12">
                    {orders.map((order) => (
                      <div key={order.id} className="bg-white border border-brand-border rounded-[2rem] overflow-hidden shadow-sm group">
                        {/* Order Header */}
                        <div className="p-8 bg-brand-bg flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-brand-border">
                          <div>
                            <span className="text-xs uppercase tracking-widest font-bold text-gray-550 block mb-1">Order ID: {order.id.slice(0, 8)}</span>
                            <span className="text-base font-semibold">{new Date(order.createdAt?.seconds * 1000).toLocaleDateString()} — LKR {order.total.toLocaleString()}</span>
                          </div>
                          
                          {/* Order Status Timeline */}
                          <div className="flex items-center gap-8">
                            {[
                              { label: 'Packed', status: 'packed', icon: Package },
                              { label: 'Shipped', status: 'shipped', icon: Truck },
                              { label: 'Delivered', status: 'delivered', icon: Check }
                            ].map((step, i) => {
                              const isActive = order.status === step.status || 
                                (step.status === 'packed' && ['shipped', 'delivered'].includes(order.status)) ||
                                (step.status === 'shipped' && order.status === 'delivered');
                              
                              return (
                                <div key={step.label} className="flex items-center gap-2 relative">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isActive ? 'bg-emerald-900 text-white shadow-lg' : 'bg-gray-100 text-gray-300'}`}>
                                    <step.icon className="w-4 h-4" />
                                  </div>
                                  <span className={`text-xs uppercase tracking-widest font-bold ${isActive ? 'text-emerald-900' : 'text-gray-300'}`}>{step.label}</span>
                                  {i < 2 && <div className={`w-4 h-[1px] ${isActive ? 'bg-emerald-900' : 'bg-gray-100'} hidden lg:block`} />}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                          {/* Items List */}
                          <div className="p-8 border-b md:border-b-0 md:border-r border-brand-border">
                            <span className="text-xs uppercase tracking-widest font-bold text-emerald-800 block mb-6">Items</span>
                            <div className="space-y-4">
                              {order.items.map((item: any, idx: number) => (
                                <div key={idx} className="flex justify-between items-center text-sm italic">
                                  <span className="opacity-60">{item.name} ({item.size}) x {item.quantity}</span>
                                  <span className="font-serif">LKR {(item.price * item.quantity).toLocaleString()}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Payment Receipt Upload */}
                          <div className="p-8 border-b md:border-b-0 md:border-r border-brand-border bg-emerald-900/5">
                            <span className="text-xs uppercase tracking-widest font-bold text-emerald-800 block mb-6">Payment Receipt</span>
                            {order.paymentReceipt ? (
                              <div className="py-4">
                                <div className="flex items-center gap-3 text-emerald-800 mb-2">
                                  <Check className="w-4 h-4" />
                                  <span className="text-sm font-medium">Receipt Uploaded</span>
                                </div>
                                <p className="text-xs text-gray-500 font-light">Ref: {order.paymentReceipt}</p>
                              </div>
                            ) : (
                              <div className="space-y-4">
                                <p className="text-xs text-emerald-900/60 leading-relaxed italic">
                                  Please transfer to our bank account and upload your transaction reference or receipt image link below.
                                </p>
                                <textarea 
                                  placeholder="Transaction Reference or Receipt Link"
                                  className="w-full p-3 text-sm bg-white border border-emerald-900/20 focus:outline-none focus:border-emerald-800 transition-all italic h-20 resize-none"
                                  onBlur={(e) => {
                                    if (e.target.value) uploadReceipt(order, e.target.value);
                                  }}
                                />
                                <button className="w-full py-3.5 bg-emerald-900 text-white text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-emerald-950 transition-all">
                                  <CloudUpload className="w-4 h-4" /> Upload Receipt
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Contact Info */}
                          <div className="p-8">
                            <span className="text-xs uppercase tracking-widest font-bold text-emerald-850 block mb-6">Delivery Details</span>
                            <div className="space-y-2 italic text-sm text-gray-650">
                              <p className="font-semibold text-black not-italic">{order.contactInfo?.name}</p>
                              <p>{order.contactInfo?.phone}</p>
                              <p className="leading-relaxed">{order.contactInfo?.address}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>


        {/* Footer */}
        <footer className="p-8 md:p-16 lg:p-24 flex flex-col md:flex-row justify-between items-center sm:items-end gap-12 border-t border-brand-border bg-white">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <img src="input_file_4.png" alt="Haloa Badge" className="w-20 h-20 object-contain rounded-2xl border border-brand-border p-1 bg-brand-bg shrink-0 shadow-sm" referrerPolicy="no-referrer" />
            <div className="space-y-3 text-center sm:text-left">
              <span className="text-xs uppercase tracking-widest text-emerald-800 font-extrabold block">Est. 2025 ; Inquiries</span>
              <p className="text-3xl font-serif italic text-emerald-950">hello@haloa.pets</p>
              <p className="text-sm uppercase tracking-widest font-bold text-gray-500">Jaffna, Sri Lanka</p>
            </div>
          </div>
          <div className="text-xs leading-relaxed text-gray-500 max-w-sm text-center sm:text-right uppercase tracking-wider space-y-2 font-medium">
            <p className="font-extrabold text-[#111]">© 2026 Haloa Pet Co.</p>
            <p className="text-emerald-900 font-semibold bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-900/10">All products are free from preservatives, additives, and hidden salt.</p>
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
                          className="text-sm uppercase tracking-widest font-extrabold border-b border-black pb-1 hover:opacity-70 transition-all"
                        >
                          Discover Haloa
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-8">
                        {cart.map((item) => {
                          const itemPrice = item.subscriptionType === 'annual' ? Math.round(item.price * 0.9) : item.subscriptionType === 'monthly' ? Math.round(item.price * 0.95) : item.price;
                          return (
                            <div key={`${item.id}-${item.size}-${item.subscriptionType || 'none'}-${item.frequency || ''}`} className="flex gap-6 group border-b border-brand-border pb-6">
                              <div className="w-20 h-24 bg-gray-50 flex-shrink-0">
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover grayscale-[20%]" referrerPolicy="no-referrer" />
                              </div>
                              <div className="flex-1">
                                <div className="flex justify-between items-start mb-1">
                                  <h4 className="font-serif italic text-xl">
                                    {item.name}
                                    {item.isSubscription && (
                                      <span className="text-[11px] uppercase tracking-widest font-extrabold text-emerald-800 ml-2">
                                        ({item.frequency}d {item.subscriptionType === 'annual' ? 'Annual Cycle' : 'Monthly Cycle'})
                                      </span>
                                    )}
                                  </h4>
                                  <button 
                                    onClick={() => updateQuantity(item.id, item.size, -item.quantity, item.isSubscription, item.frequency)}
                                    className="p-1 opacity-0 group-hover:opacity-100 hover:text-red-800 transition-all"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                                <p className="text-xs md:text-sm uppercase tracking-widest text-emerald-800 font-extrabold mb-4">
                                  {item.size} — LKR {item.price.toLocaleString()} {item.subscriptionType === 'monthly' && <span className="text-emerald-900/60">- 5% Off</span>}{item.subscriptionType === 'annual' && <span className="text-emerald-900/60">- 10% Off</span>}
                                </p>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-4 text-sm font-medium">
                                    <button onClick={() => updateQuantity(item.id, item.size, -1, item.isSubscription, item.frequency)} className="hover:text-emerald-800">—</button>
                                    <span>{item.quantity}</span>
                                    <button onClick={() => updateQuantity(item.id, item.size, 1, item.isSubscription, item.frequency)} className="hover:text-emerald-800">+</button>
                                  </div>
                                  <span className="font-serif italic">
                                    LKR {(itemPrice * item.quantity).toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : checkoutStep === 'info' ? (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                    <div className="space-y-6">
                      <div className="group">
                        <label className="block text-xs md:text-sm uppercase tracking-widest font-extrabold text-gray-500 mb-2 group-focus-within:text-emerald-800 transition-colors">Recipient</label>
                        <input 
                           type="text" 
                           value={contactInfo.name}
                           onChange={(e) => setContactInfo({ ...contactInfo, name: e.target.value })}
                           className="w-full bg-brand-bg border-b border-brand-border py-2 focus:outline-none focus:border-emerald-800 transition-colors text-lg font-serif italic"
                           placeholder="Your Name"
                        />
                      </div>
                      <div className="group">
                        <label className="block text-xs md:text-sm uppercase tracking-widest font-extrabold text-gray-500 mb-2 group-focus-within:text-emerald-800 transition-colors">Contact</label>
                        <input 
                           type="tel" 
                           value={contactInfo.phone}
                           onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                           className="w-full bg-brand-bg border-b border-brand-border py-2 focus:outline-none focus:border-emerald-800 transition-colors text-lg font-serif italic"
                           placeholder="077 XXXXXXX"
                        />
                      </div>
                      <div className="group">
                        <label className="block text-xs md:text-sm uppercase tracking-widest font-extrabold text-gray-500 mb-2 group-focus-within:text-emerald-800 transition-colors">Address</label>
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
                      <span className="text-xs md:text-sm uppercase tracking-widest font-extrabold text-emerald-800 block mb-4">Summary</span>
                      {cart.map(item => {
                        const itemPrice = item.subscriptionType === 'annual' ? Math.round(item.price * 0.9) : item.subscriptionType === 'monthly' ? Math.round(item.price * 0.95) : item.price;
                        return (
                          <div key={`${item.id}-${item.size}-${item.subscriptionType || 'none'}-${item.frequency || ''}`} className="flex justify-between text-sm mb-1 font-sans">
                            <span className="opacity-70 font-medium">
                              {item.name} ({item.size}) {item.isSubscription ? `(${item.frequency}d)` : ''} x {item.quantity}
                            </span>
                            <span className="font-serif">LKR {(itemPrice * item.quantity).toLocaleString()}</span>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                ) : checkoutStep === 'payment' ? (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                    <div className="p-8 bg-emerald-900/5 border border-emerald-900/10 rounded-[2rem]">
                      <span className="text-xs md:text-sm uppercase tracking-widest font-extrabold text-emerald-900 block mb-6">Bank Transfer Details</span>
                      <div className="space-y-4 font-serif italic text-lg leading-relaxed">
                        <div className="flex justify-between border-b border-emerald-900/10 pb-2">
                          <span className="opacity-50 text-xs uppercase font-sans font-extrabold tracking-widest text-[#555]">Bank</span>
                          <span className="font-semibold text-emerald-950">Commercial Bank</span>
                        </div>
                        <div className="flex justify-between border-b border-emerald-900/10 pb-2">
                          <span className="opacity-50 text-xs uppercase font-sans font-extrabold tracking-widest text-[#555]">Name</span>
                          <span className="font-semibold text-emerald-950">Haloa Pet Care (PVT) LTD</span>
                        </div>
                        <div className="flex justify-between border-b border-emerald-900/10 pb-2">
                          <span className="opacity-50 text-xs uppercase font-sans font-extrabold tracking-widest text-[#555]">Account</span>
                          <span className="font-mono text-emerald-950 font-bold">1000 4567 8901</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="opacity-50 text-xs uppercase font-sans font-extrabold tracking-widest text-[#555]">Branch</span>
                          <span className="font-semibold text-emerald-950">Colombo 07</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <span className="text-xs md:text-sm uppercase tracking-widest font-extrabold text-gray-500 block mb-4">Quick Pay via App</span>
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { name: 'ComBank Digital', color: 'bg-[#005cbb]', url: 'https://www.combankdigital.com' },
                          { name: 'Sampath Vishwa', color: 'bg-[#f47b20]', url: 'https://www.sampathvishwa.com' },
                          { name: 'NTB Flash', color: 'bg-black', url: 'https://www.nationstrust.com/personal/digital-banking/flash' },
                          { name: 'HNB Solo', color: 'bg-[#0054a6]', url: 'https://www.hnb.net/solo' }
                        ].map(bank => (
                          <a 
                            key={bank.name} 
                            href={bank.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 border border-brand-border hover:border-emerald-900 transition-all rounded-xl grayscale hover:grayscale-0"
                          >
                            <div className={`w-8 h-8 ${bank.color} rounded-lg flex items-center justify-center text-white text-[10px] font-extrabold text-center leading-tight`}>
                              {bank.name.split(' ')[0]}
                            </div>
                            <span className="text-xs font-extrabold uppercase tracking-widest whitespace-nowrap">{bank.name}</span>
                          </a>
                        ))}
                      </div>
                    </div>

                    <div className="p-6 bg-amber-50 border border-amber-200 rounded-xl flex gap-4">
                      <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                      <p className="text-sm text-amber-900 leading-relaxed italic font-normal">
                        After payment, please log in to your account and upload the receipt under "My Orders" to confirm your delivery.
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    className="h-full flex flex-col items-center justify-center text-center p-8 space-y-6"
                  >
                    <div className="w-20 h-20 bg-emerald-900/10 rounded-full flex items-center justify-center mb-4">
                      <Check className="w-10 h-10 text-emerald-900" />
                    </div>
                    <h4 className="text-4xl font-serif italic">Order Placed</h4>
                    <p className="text-gray-600 font-normal leading-relaxed text-base">
                      Your order <span className="font-serif italic text-black font-semibold">#{lastOrderId?.slice(0, 8)}</span> has been registered. 
                      Once we confirm your payment, your artisanal treats will be prepared.
                    </p>
                    <button 
                      onClick={() => {
                        setCurrentView('dashboard');
                        setIsCartOpen(false);
                      }}
                      className="px-8 py-4 bg-emerald-900 text-white text-xs md:text-sm font-extrabold uppercase tracking-widest flex items-center gap-4 group"
                    >
                      Track Order <div className="w-6 h-[1px] bg-white group-hover:w-10 transition-all"></div>
                    </button>
                  </motion.div>
                )}
              </div>

              {cart.length > 0 && checkoutStep !== 'success' && (
                <div className="p-8 border-t border-brand-border bg-brand-bg space-y-8">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs font-extrabold tracking-widest uppercase opacity-40 text-gray-500">Subtotal</span>
                    <span className="text-4xl font-serif italic">LKR {cartTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex gap-4">
                    {checkoutStep !== 'cart' && (
                      <button 
                        onClick={() => setCheckoutStep(prev => prev === 'payment' ? 'info' : 'cart')}
                        className="p-5 border border-brand-border hover:bg-gray-50 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                    <button 
                      className="flex-1 py-6 bg-emerald-900 text-white font-serif italic text-xl hover:bg-emerald-950 transition-all flex items-center justify-center gap-6 group"
                      onClick={handleCheckout}
                    >
                      {!user ? 'Sign in to Checkout' : checkoutStep === 'cart' ? 'Proceed to Details' : checkoutStep === 'info' ? 'Proceed to Payment' : 'Complete Order'}
                      <div className="w-8 h-[1px] bg-white group-hover:w-16 transition-all"></div>
                    </button>
                  </div>
                  <p className="text-xs font-extrabold text-center opacity-40 uppercase tracking-[0.2em]">
                    {checkoutStep === 'cart' ? 'Sri Lanka Delivery' : 'Bank Transfer / Cash'}
                  </p>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

