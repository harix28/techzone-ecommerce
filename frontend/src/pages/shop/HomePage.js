import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiStar, FiShield, FiTruck, FiRefreshCw, FiHeadphones } from 'react-icons/fi';
import API from '../../utils/api';
import ProductCard from '../../components/ui/ProductCard';

const CATEGORIES = [
  { name: 'Smartphones', icon: '📱', slug: 'smartphones', bg: 'from-blue-500 to-blue-700' },
  { name: 'Laptops', icon: '💻', slug: 'laptops', bg: 'from-purple-500 to-purple-700' },
  { name: 'Audio', icon: '🎧', slug: 'audio', bg: 'from-green-500 to-green-700' },
  { name: 'Smart Watches', icon: '⌚', slug: 'smartwatches', bg: 'from-orange-500 to-orange-700' },
  { name: 'Gaming', icon: '🎮', slug: 'gaming', bg: 'from-red-500 to-red-700' },
  { name: 'Cameras', icon: '📷', slug: 'cameras', bg: 'from-pink-500 to-pink-700' },
  { name: 'Tablets', icon: '📟', slug: 'tablets', bg: 'from-indigo-500 to-indigo-700' },
  { name: 'Accessories', icon: '🔌', slug: 'accessories', bg: 'from-teal-500 to-teal-700' },
];

const FEATURES = [
  { icon: FiTruck, title: 'Free Shipping', desc: 'On orders over $99' },
  { icon: FiRefreshCw, title: '30-Day Returns', desc: 'Hassle-free returns' },
  { icon: FiShield, title: 'Warranty', desc: 'Official warranties on all products' },
  { icon: FiHeadphones, title: '24/7 Support', desc: 'Always here to help' },
];

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [featuredRes, newRes, catRes] = await Promise.all([
          API.get('/products?featured=true&limit=8'),
          API.get('/products?limit=8&sort=newest'),
          API.get('/categories')
        ]);
        setFeaturedProducts(featuredRes.data.products);
        setNewArrivals(newRes.data.products);
        setCategories(catRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-blue-950 to-gray-900 text-white">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-indigo-500 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-3xl">
            <span className="inline-block bg-blue-500/20 border border-blue-500/30 text-blue-300 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
              🎉 New Arrivals Available
            </span>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              The Future of
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400"> Tech </span>
              is Here
            </h1>
            <p className="text-lg text-gray-300 mb-8 leading-relaxed">
              Discover the latest smartphones, laptops, audio gear, and more. Premium tech at competitive prices with official warranties.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/products" className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-3.5 rounded-xl transition-all flex items-center gap-2 group">
                Shop Now <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/products?featured=true" className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-8 py-3.5 rounded-xl transition-all backdrop-blur-sm">
                Featured Items
              </Link>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 mt-12">
              {[['50K+', 'Happy Customers'], ['2K+', 'Products'], ['100+', 'Brands'], ['99%', 'Satisfaction']].map(([num, label]) => (
                <div key={label}>
                  <p className="text-2xl font-bold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{num}</p>
                  <p className="text-sm text-gray-400">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Bar */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon className="text-blue-600" size={20} />
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-900">{title}</p>
                  <p className="text-xs text-gray-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Shop by Category
          </h2>
          <Link to="/products" className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1">
            See all <FiArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {CATEGORIES.map(cat => (
            <Link key={cat.slug}
              to={`/products?search=${cat.name}`}
              className={`bg-gradient-to-br ${cat.bg} p-4 rounded-2xl text-white text-center hover:scale-105 transition-transform duration-200 group`}>
              <span className="text-3xl block mb-2">{cat.icon}</span>
              <span className="text-xs font-semibold leading-tight">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              ⭐ Featured Products
            </h2>
            <p className="text-gray-500 text-sm mt-1">Handpicked top picks for you</p>
          </div>
          <Link to="/products?featured=true" className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1">
            View all <FiArrowRight size={14} />
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="card">
                <div className="aspect-square skeleton" />
                <div className="p-4 space-y-2">
                  <div className="h-3 skeleton rounded w-1/3" />
                  <div className="h-4 skeleton rounded" />
                  <div className="h-4 skeleton rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {featuredProducts.map(p => <ProductCard key={p._id} product={p} />)}
          </div>
        )}
      </section>

      {/* Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 md:p-12 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-white rounded-full" />
          </div>
          <div className="relative max-w-xl">
            <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full mb-4 inline-block">Limited Time</span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Gaming Week Special
            </h2>
            <p className="text-blue-100 mb-6">Up to 40% off on gaming consoles, peripherals, and accessories. Don't miss out!</p>
            <Link to="/products?search=gaming"
              className="bg-white text-blue-700 font-bold px-6 py-3 rounded-xl hover:bg-blue-50 transition-colors inline-flex items-center gap-2">
              Shop Gaming Deals <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              🆕 New Arrivals
            </h2>
            <p className="text-gray-500 text-sm mt-1">Fresh drops just for you</p>
          </div>
          <Link to="/products" className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1">
            View all <FiArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {newArrivals.map(p => <ProductCard key={p._id} product={p} />)}
        </div>
      </section>
    </div>
  );
}