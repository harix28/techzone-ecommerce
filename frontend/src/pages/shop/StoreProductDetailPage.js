import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  FiCheck,
  FiHeart,
  FiMinus,
  FiPlus,
  FiShield,
  FiShoppingCart,
  FiStar,
  FiTruck,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import API, { extractApiData } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import {
  getProductFeatures,
  getProductHref,
  getProductId,
  getProductImage,
  getProductSpecifications,
  isLowStock,
} from '../../utils/catalog';
import { formatCurrency, formatDate } from '../../utils/format';

export default function StoreProductDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { addItem } = useCart();
  const { hasItem, toggleWishlist } = useWishlist();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);

  const loadProduct = async () => {
    try {
      const response = await API.get(`/products/${id}`);
      setProduct(extractApiData(response));
      setSelectedImageIndex(0);
      setQuantity(1);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to load product');
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    loadProduct();
  }, [id]);

  const images = useMemo(() => {
    if (!product) {
      return [];
    }

    const productImages = Array.isArray(product.images) && product.images.length
      ? product.images.map((image, index) => ({
          key: image.id || index,
          imageUrl: image.imageUrl || getProductImage(product, `detail-${index}`),
          altText: image.altText || product.name,
        }))
      : [
          {
            key: 'fallback',
            imageUrl: getProductImage(product, 'detail-fallback'),
            altText: product.name,
          },
        ];

    return productImages;
  }, [product]);

  const featureList = useMemo(() => getProductFeatures(product), [product]);
  const specifications = useMemo(() => getProductSpecifications(product), [product]);
  const productId = getProductId(product);
  const saved = hasItem(productId);
  const compareAtPrice = Number(product?.compareAtPrice || 0);
  const discount =
    compareAtPrice > Number(product?.price || 0)
      ? Math.round(((compareAtPrice - product.price) / compareAtPrice) * 100)
      : 0;

  const submitReview = async () => {
    if (reviewComment.trim().length < 10) {
      toast.error('Review comments must be at least 10 characters.');
      return;
    }

    setSubmittingReview(true);
    try {
      await API.post(`/products/${id}/reviews`, {
        rating: reviewRating,
        title: reviewTitle,
        comment: reviewComment,
      });
      toast.success('Review submitted successfully.');
      setReviewTitle('');
      setReviewComment('');
      setReviewRating(5);
      await loadProduct();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="aspect-square rounded-[32px] skeleton" />
          <div className="space-y-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="h-5 rounded-full skeleton" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-slate-950" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          Product not found
        </h1>
        <p className="mt-3 text-slate-500">
          The product you requested could not be loaded or may no longer be active.
        </p>
        <Link
          to="/products"
          className="mt-6 inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          Back to catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-slate-500">
        <Link to="/" className="transition hover:text-slate-950">Home</Link>
        <span>/</span>
        <Link to="/products" className="transition hover:text-slate-950">Products</Link>
        {product.category ? (
          <>
            <span>/</span>
            <Link to={`/products?category=${product.category.slug}`} className="transition hover:text-slate-950">
              {product.category.name}
            </Link>
          </>
        ) : null}
        <span>/</span>
        <span className="truncate text-slate-900">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <div className="overflow-hidden rounded-[36px] border border-slate-200 bg-white shadow-sm">
            <img
              src={images[selectedImageIndex]?.imageUrl}
              alt={images[selectedImageIndex]?.altText || product.name}
              className="aspect-square h-full w-full object-cover"
            />
          </div>
          {images.length > 1 ? (
            <div className="mt-4 grid grid-cols-4 gap-3">
              {images.map((image, index) => (
                <button
                  key={image.key}
                  type="button"
                  onClick={() => setSelectedImageIndex(index)}
                  className={`overflow-hidden rounded-3xl border transition ${
                    selectedImageIndex === index
                      ? 'border-slate-950'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <img src={image.imageUrl} alt={image.altText} className="aspect-square h-full w-full object-cover" />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="space-y-6">
          <div className="rounded-[36px] border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  {product.brand}
                </p>
                <h1
                  className="mt-3 text-4xl font-bold text-slate-950"
                  style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                >
                  {product.name}
                </h1>
              </div>
              <button
                type="button"
                onClick={() => toggleWishlist(productId)}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  saved
                    ? 'border-rose-200 bg-rose-50 text-rose-600'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <FiHeart className={saved ? 'fill-current' : ''} />
                {saved ? 'Saved' : 'Save'}
              </button>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-slate-500">
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5">
                <FiStar className="fill-current text-amber-400" />
                {(product.ratingAverage || 0).toFixed(1)} rating
              </div>
              <span>{product.ratingCount || 0} reviews</span>
              <span>{product.soldCount || 0} sold</span>
            </div>

            <div className="mt-6 flex flex-wrap items-end gap-4">
              <div className="text-4xl font-bold text-slate-950">{formatCurrency(product.price)}</div>
              {compareAtPrice ? (
                <>
                  <div className="text-xl text-slate-400 line-through">{formatCurrency(compareAtPrice)}</div>
                  <span className="rounded-full bg-rose-100 px-3 py-1 text-sm font-semibold text-rose-700">
                    Save {discount}%
                  </span>
                </>
              ) : null}
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3 text-sm">
              <span
                className={`rounded-full px-3 py-1.5 font-medium ${
                  product.stockQuantity > 0
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-rose-100 text-rose-700'
                }`}
              >
                {product.stockQuantity > 0
                  ? `${product.stockQuantity} in stock`
                  : 'Currently unavailable'}
              </span>
              {isLowStock(product) ? (
                <span className="rounded-full bg-amber-100 px-3 py-1.5 font-medium text-amber-700">
                  Low stock alert
                </span>
              ) : null}
            </div>

            <p className="mt-6 text-base leading-8 text-slate-600">
              {product.shortDescription || product.description}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <div className="inline-flex items-center rounded-full border border-slate-200 bg-white">
                <button
                  type="button"
                  onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                  className="inline-flex h-12 w-12 items-center justify-center text-slate-700 transition hover:bg-slate-50"
                >
                  <FiMinus />
                </button>
                <span className="inline-flex min-w-[52px] justify-center text-sm font-semibold text-slate-900">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((current) => Math.min(product.stockQuantity || 1, current + 1))}
                  className="inline-flex h-12 w-12 items-center justify-center text-slate-700 transition hover:bg-slate-50"
                >
                  <FiPlus />
                </button>
              </div>
              <button
                type="button"
                onClick={() => addItem(product, quantity)}
                disabled={product.stockQuantity <= 0}
                className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
              >
                <FiShoppingCart />
                Add to cart
              </button>
            </div>

            {featureList.length ? (
              <div className="mt-8">
                <h2 className="text-lg font-semibold text-slate-950">Highlights</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {featureList.map((feature) => (
                    <span key={feature} className="rounded-full bg-slate-100 px-3 py-2 text-sm text-slate-700">
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="mt-8 grid gap-3 border-t border-slate-100 pt-6 sm:grid-cols-2">
              <div className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-700">
                <div className="flex items-center gap-2 font-semibold text-slate-900">
                  <FiTruck className="text-blue-700" />
                  Shipping
                </div>
                <p className="mt-2">Orders over $99 ship free with tracked delivery.</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-700">
                <div className="flex items-center gap-2 font-semibold text-slate-900">
                  <FiShield className="text-blue-700" />
                  Warranty
                </div>
                <p className="mt-2">{product.warranty || 'Standard manufacturer coverage included.'}</p>
              </div>
            </div>
          </div>

          {specifications.length ? (
            <div className="rounded-[36px] border border-slate-200 bg-white p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-950" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Specifications
              </h2>
              <div className="mt-6 overflow-hidden rounded-3xl border border-slate-100">
                {specifications.map((specification, index) => (
                  <div
                    key={`${specification.key}-${index}`}
                    className={`grid gap-3 px-5 py-4 text-sm sm:grid-cols-[0.38fr_0.62fr] ${
                      index % 2 === 0 ? 'bg-slate-50' : 'bg-white'
                    }`}
                  >
                    <span className="font-semibold text-slate-900">{specification.key}</span>
                    <span className="text-slate-600">{specification.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[36px] border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-950" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Product details
          </h2>
          <p className="mt-5 text-base leading-8 text-slate-600">{product.description}</p>
        </div>

        <div className="rounded-[36px] border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-950" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Reviews
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                {(product.ratingAverage || 0).toFixed(1)} average from {product.ratingCount || 0} reviews
              </p>
            </div>
            <Link to={getProductHref(product)} className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
              {product.category?.name}
            </Link>
          </div>

          {user ? (
            <div className="mt-8 rounded-[32px] border border-slate-200 bg-slate-50 p-6">
              <h3 className="text-lg font-semibold text-slate-950">Write a review</h3>
              <div className="mt-4 flex gap-2">
                {Array.from({ length: 5 }).map((_, index) => {
                  const starValue = index + 1;

                  return (
                    <button
                      key={starValue}
                      type="button"
                      onClick={() => setReviewRating(starValue)}
                      className={`rounded-full p-2 transition ${
                        starValue <= reviewRating ? 'text-amber-400' : 'text-slate-300'
                      }`}
                    >
                      <FiStar className={starValue <= reviewRating ? 'fill-current' : ''} />
                    </button>
                  );
                })}
              </div>
              <div className="mt-4 grid gap-4">
                <input
                  value={reviewTitle}
                  onChange={(event) => setReviewTitle(event.target.value)}
                  placeholder="Review title (optional)"
                  className="h-12 rounded-2xl border border-slate-200 px-4 text-sm outline-none transition focus:border-blue-500"
                />
                <textarea
                  value={reviewComment}
                  onChange={(event) => setReviewComment(event.target.value)}
                  rows={4}
                  placeholder="Share your experience with this product"
                  className="rounded-3xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={submitReview}
                  disabled={submittingReview}
                  className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
                >
                  {submittingReview ? 'Submitting...' : 'Submit review'}
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-8 rounded-[32px] border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
              <Link to="/login" className="font-semibold text-blue-700">
                Sign in
              </Link>{' '}
              to submit a review or save this product to your wishlist.
            </div>
          )}

          <div className="mt-8 space-y-4">
            {(product.reviews || []).length ? (
              product.reviews.map((review) => (
                <div key={review.id} className="rounded-[32px] border border-slate-200 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700">
                          {review.user?.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{review.user?.name}</p>
                          <p className="text-sm text-slate-500">{formatDate(review.createdAt)}</p>
                        </div>
                      </div>
                      {review.title ? (
                        <p className="mt-3 text-base font-semibold text-slate-900">{review.title}</p>
                      ) : null}
                    </div>
                    <div className="flex items-center gap-1 text-amber-400">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <FiStar
                          key={index}
                          className={index + 1 <= review.rating ? 'fill-current' : ''}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-7 text-slate-600">{review.comment}</p>
                  {review.isVerifiedPurchase ? (
                    <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                      <FiCheck />
                      Verified purchase
                    </div>
                  ) : null}
                </div>
              ))
            ) : (
              <div className="rounded-[32px] border border-dashed border-slate-200 px-6 py-10 text-center text-slate-500">
                No reviews yet. Be the first to share feedback.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
