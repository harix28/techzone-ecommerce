import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiStar, FiShoppingCart, FiArrowLeft, FiCheck, FiMinus, FiPlus, FiTruck, FiShield } from 'react-icons/fi';
import API from '../../utils/api';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
  const { id } = useParams();
  const { addItem } = useCart();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await API.get(`/products/${id}`);
        setProduct(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const submitReview = async () => {
    if (!reviewComment.trim()) return toast.error('Please write a comment');
    setSubmittingReview(true);
    try {
      await API.post(`/products/${id}/reviews`, { rating: reviewRating, comment: reviewComment });
      const { data } = await API.get(`/products/${id}`);
      setProduct(data);
      setReviewComment('');
      toast.success('Review submitted!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="aspect-square skeleton rounded-2xl" />
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => <div key={i} className={`h-4 skeleton rounded w-${['1/3','2/3','full','1/2','full','1/4'][i]}`} />)}
        </div>
      </div>
    </div>
  );

  if (!product) return (
    <div className="text-center py-20">
      <p className="text-4xl mb-4">😕</p>
      <h2 className="text-xl font-bold mb-2">Product not found</h2>
      <Link to="/products" className="btn-primary mt-4 inline-block">Back to Products</Link>
    </div>
  );

  const images = product.images?.length ? product.images : [`https://picsum.photos/seed/${product._id}/600/600`];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-blue-600">Home</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-blue-600">Products</Link>
        <span>/</span>
        <span className="text-gray-900 truncate max-w-xs">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Images */}
        <div>
          <div className="aspect-square rounded-2xl overflow-hidden bg-gray-50 mb-3">
            <img src={images[selectedImage]} alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => { e.target.src = `https://picsum.photos/seed/${product._id}/600/600`; }}
            />
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {images.map((img, i) => (
                <button key={i} onClick={() => setSelectedImage(i)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                    selectedImage === i ? 'border-blue-500' : 'border-transparent'
                  }`}>
                  <img src={img} alt={`View ${i+1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <div className="flex items-start justify-between gap-4 mb-2">
            <div>
              <p className="text-sm font-medium text-blue-600 mb-1">{product.brand}</p>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                {product.name}
              </h1>
            </div>
            {product.isFeatured && <span className="badge bg-blue-100 text-blue-800 flex-shrink-0">Featured</span>}
          </div>

          {/* Rating */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-1">
              {[1,2,3,4,5].map(s => (
                <FiStar key={s} className={`w-4 h-4 ${s <= Math.round(product.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`} />
              ))}
            </div>
            <span className="text-sm font-semibold">{product.rating?.toFixed(1)}</span>
            <span className="text-sm text-gray-500">({product.numReviews} reviews)</span>
            {product.sold > 0 && <span className="text-sm text-gray-500">• {product.sold} sold</span>}
          </div>

          {/* Price */}
          <div className="flex items-center gap-3 mb-6 bg-gray-50 rounded-xl p-4">
            <span className="text-4xl font-bold text-gray-900">${product.price?.toLocaleString()}</span>
            {product.originalPrice && (
              <>
                <span className="text-xl text-gray-400 line-through">${product.originalPrice?.toLocaleString()}</span>
                <span className="bg-red-100 text-red-700 text-sm font-bold px-2 py-1 rounded-lg">
                  {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                </span>
              </>
            )}
          </div>

          {/* Stock */}
          <div className={`flex items-center gap-2 text-sm font-medium mb-4 ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
            {product.stock > 0 ? (
              <><FiCheck size={16} /> In Stock {product.stock <= 5 && `(Only ${product.stock} left)`}</>
            ) : (
              'Out of Stock'
            )}
          </div>

          {/* Short description */}
          {product.shortDescription && <p className="text-gray-600 mb-6">{product.shortDescription}</p>}

          {/* Quantity + Add to Cart */}
          {product.stock > 0 && (
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 transition-colors">
                  <FiMinus size={16} />
                </button>
                <span className="w-12 text-center font-semibold">{qty}</span>
                <button onClick={() => setQty(q => Math.min(product.stock, q + 1))} className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 transition-colors">
                  <FiPlus size={16} />
                </button>
              </div>
              <button onClick={() => addItem(product, qty)} className="btn-primary flex-1 flex items-center justify-center gap-2 py-3">
                <FiShoppingCart size={18} /> Add to Cart
              </button>
            </div>
          )}

          {/* Features */}
          {product.features?.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Key Features</h3>
              <div className="flex flex-wrap gap-2">
                {product.features.map(f => (
                  <span key={f} className="bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1.5 rounded-full">{f}</span>
                ))}
              </div>
            </div>
          )}

          {/* Guarantee badges */}
          <div className="grid grid-cols-2 gap-3 border-t border-gray-100 pt-6">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <FiTruck className="text-blue-500 flex-shrink-0" />
              <span>Free shipping on orders over $99</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <FiShield className="text-blue-500 flex-shrink-0" />
              <span>{product.warranty || '1 Year Warranty'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Description, Specs, Reviews */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Description + Specs */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <h2 className="text-lg font-bold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Description</h2>
            <p className="text-gray-600 leading-relaxed">{product.description}</p>
          </div>

          {product.specifications?.length > 0 && (
            <div className="card p-6">
              <h2 className="text-lg font-bold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Specifications</h2>
              <table className="w-full text-sm">
                <tbody>
                  {product.specifications.map((spec, i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : ''}>
                      <td className="py-2.5 px-4 font-medium text-gray-700 w-1/3 rounded-l-lg">{spec.key}</td>
                      <td className="py-2.5 px-4 text-gray-600 rounded-r-lg">{spec.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Reviews */}
        <div className="space-y-4">
          <div className="card p-6">
            <h2 className="text-lg font-bold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Reviews ({product.numReviews})
            </h2>

            {/* Average rating */}
            <div className="flex items-center gap-3 mb-4 bg-gray-50 rounded-xl p-4">
              <span className="text-5xl font-bold text-gray-900">{product.rating?.toFixed(1)}</span>
              <div>
                <div className="flex items-center mb-1">
                  {[1,2,3,4,5].map(s => (
                    <FiStar key={s} className={`w-4 h-4 ${s <= Math.round(product.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`} />
                  ))}
                </div>
                <p className="text-sm text-gray-500">{product.numReviews} reviews</p>
              </div>
            </div>

            {/* Review form */}
            {user ? (
              <div className="border-t border-gray-100 pt-4">
                <h3 className="text-sm font-semibold mb-3">Write a Review</h3>
                <div className="flex gap-1 mb-3">
                  {[1,2,3,4,5].map(s => (
                    <button key={s} onClick={() => setReviewRating(s)}>
                      <FiStar className={`w-6 h-6 cursor-pointer transition-colors ${s <= reviewRating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 fill-gray-300 hover:text-yellow-300'}`} />
                    </button>
                  ))}
                </div>
                <textarea value={reviewComment} onChange={(e) => setReviewComment(e.target.value)}
                  rows={3} placeholder="Share your experience..."
                  className="input resize-none mb-2" />
                <button onClick={submitReview} disabled={submittingReview}
                  className="btn-primary w-full text-sm">
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            ) : (
              <p className="text-sm text-gray-500 border-t pt-4">
                <Link to="/login" className="text-blue-600 font-medium">Login</Link> to write a review
              </p>
            )}
          </div>

          {/* Review list */}
          {product.reviews?.map((review, i) => (
            <div key={i} className="card p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-sm">
                    {review.name?.[0]?.toUpperCase()}
                  </div>
                  <span className="text-sm font-medium">{review.name}</span>
                </div>
                <div className="flex">
                  {[1,2,3,4,5].map(s => (
                    <FiStar key={s} className={`w-3 h-3 ${s <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`} />
                  ))}
                </div>
              </div>
              <p className="text-sm text-gray-600">{review.comment}</p>
              <p className="text-xs text-gray-400 mt-2">{new Date(review.createdAt).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}