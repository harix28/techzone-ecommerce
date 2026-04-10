import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  FiArrowRight,
  FiCheck,
  FiClock,
  FiHeart,
  FiMinus,
  FiPlus,
  FiRefreshCw,
  FiShield,
  FiShoppingCart,
  FiStar,
  FiTruck,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import API, { extractApiData } from '../../utils/api';
import Breadcrumbs from '../../components/ui/Breadcrumbs';
import ProductCard from '../../components/ui/ProductCard';
import RatingStars from '../../components/ui/RatingStars';
import SectionHeading from '../../components/ui/SectionHeading';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import {
  getProductFeatures,
  getProductId,
  getProductImage,
  getProductSpecifications,
  isLowStock,
} from '../../utils/catalog';
import { formatCurrency, formatDate } from '../../utils/format';

export default function StoreProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addItem } = useCart();
  const { hasItem, toggleWishlist } = useWishlist();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
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

  useEffect(() => {
    if (!product?.category?.slug) {
      setRelatedProducts([]);
      return;
    }

    let active = true;

    API.get(`/products?category=${product.category.slug}&limit=4`)
      .then((response) => {
        if (!active) {
          return;
        }

        const nextProducts = extractApiData(response).filter((item) => getProductId(item) !== getProductId(product));
        setRelatedProducts(nextProducts.slice(0, 4));
      })
      .catch(() => {
        if (active) {
          setRelatedProducts([]);
        }
      });

    return () => {
      active = false;
    };
  }, [product]);

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
  const breadcrumbItems = useMemo(
    () => [
      { label: 'Home', href: '/' },
      { label: 'Catalog', href: '/products' },
      ...(product?.category
        ? [{ label: product.category.name, href: `/products?category=${product.category.slug}` }]
        : []),
      { label: product?.name || 'Product' },
    ],
    [product],
  );

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
    <div className="page-shell">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Breadcrumbs items={breadcrumbItems} />

        <div className="mt-6 grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-4">
            <div className="panel overflow-hidden rounded-[36px] p-3">
              <div className="overflow-hidden rounded-[30px] bg-[rgba(15,23,42,0.04)]">
                <img
                  src={images[selectedImageIndex]?.imageUrl}
                  alt={images[selectedImageIndex]?.altText || product.name}
                  className="aspect-square h-full w-full object-cover transition duration-500 hover:scale-[1.03]"
                />
              </div>
            </div>
            {images.length > 1 ? (
              <div className="grid grid-cols-4 gap-3">
                {images.map((image, index) => (
                  <button
                    key={image.key}
                    type="button"
                    onClick={() => setSelectedImageIndex(index)}
                    className={`panel overflow-hidden rounded-[24px] p-2 transition ${
                      selectedImageIndex === index ? 'ring-2 ring-slate-950' : 'hover:border-slate-300'
                    }`}
                  >
                    <img src={image.imageUrl} alt={image.altText} className="aspect-square h-full w-full rounded-[18px] object-cover" />
                  </button>
                ))}
              </div>
            ) : null}

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                {
                  icon: FiTruck,
                  title: 'Fast dispatch',
                  description: 'Free tracked shipping on qualifying baskets over $99.',
                },
                {
                  icon: FiRefreshCw,
                  title: 'Easy returns',
                  description: '30-day returns on eligible products with clear policy coverage.',
                },
                {
                  icon: FiShield,
                  title: 'Protected purchase',
                  description: product.warranty || 'Manufacturer-backed protection included where applicable.',
                },
              ].map(({ icon: Icon, title: trustTitle, description }) => (
                <div key={trustTitle} className="panel-muted rounded-[28px] p-5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white">
                    <Icon size={18} />
                  </div>
                  <p className="mt-4 text-sm font-semibold text-slate-950">{trustTitle}</p>
                  <p className="mt-2 text-sm leading-7 text-slate-600">{description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="panel rounded-[36px] p-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="section-kicker">{product.brand}</p>
                  <h1
                    className="headline-balance mt-4 text-4xl font-bold text-slate-950"
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
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <FiHeart className={saved ? 'fill-current' : ''} />
                  {saved ? 'Saved' : 'Save'}
                </button>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-slate-500">
                <div className="inline-flex items-center gap-3 rounded-full bg-slate-100 px-4 py-2">
                  <RatingStars rating={product.ratingAverage || 0} />
                  <span className="font-medium text-slate-700">{(product.ratingAverage || 0).toFixed(1)}</span>
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
                    product.stockQuantity > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                  }`}
                >
                  {product.stockQuantity > 0 ? `${product.stockQuantity} in stock` : 'Currently unavailable'}
                </span>
                {isLowStock(product) ? (
                  <span className="rounded-full bg-amber-100 px-3 py-1.5 font-medium text-amber-700">
                    Low stock alert
                  </span>
                ) : null}
                <span className="rounded-full bg-slate-100 px-3 py-1.5 text-slate-700">
                  Category: {product.category?.name || 'Tech'}
                </span>
              </div>

              <p className="mt-6 text-base leading-8 text-slate-600">{product.shortDescription || product.description}</p>

              {featureList.length ? (
                <div className="mt-7 flex flex-wrap gap-2">
                  {featureList.map((feature) => (
                    <span key={feature} className="pill pill-muted">
                      {feature}
                    </span>
                  ))}
                </div>
              ) : null}

              <div className="mt-8 grid gap-4 rounded-[28px] bg-[rgba(15,23,42,0.04)] p-5 sm:grid-cols-[auto_1fr] sm:items-center">
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

                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => addItem(product, quantity)}
                    disabled={product.stockQuantity <= 0}
                    className="btn-primary h-12 justify-center disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <FiShoppingCart />
                    Add to cart
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      addItem(product, quantity);
                      navigate('/checkout');
                    }}
                    disabled={product.stockQuantity <= 0}
                    className="btn-secondary h-12 justify-center disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Buy now
                    <FiArrowRight />
                  </button>
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[24px] border border-slate-200 bg-white px-4 py-4 text-sm text-slate-700">
                  <div className="flex items-center gap-2 font-semibold text-slate-900">
                    <FiTruck className="text-teal-700" />
                    Delivery
                  </div>
                  <p className="mt-2 leading-7">Orders over $99 ship free, with tracking and a clearer delivery summary at checkout.</p>
                </div>
                <div className="rounded-[24px] border border-slate-200 bg-white px-4 py-4 text-sm text-slate-700">
                  <div className="flex items-center gap-2 font-semibold text-slate-900">
                    <FiClock className="text-amber-600" />
                    Purchase confidence
                  </div>
                  <p className="mt-2 leading-7">Ratings, stock signals, and specs are surfaced here to reduce uncertainty before purchase.</p>
                </div>
              </div>
            </div>

            {specifications.length ? (
              <div className="panel rounded-[36px] p-8">
                <SectionHeading
                  eyebrow="Specifications"
                  title="Everything shoppers usually need before adding to cart"
                  description="A clearer specification layout helps buyers compare essentials without leaving the PDP."
                  align="start"
                />
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

        <div className="mt-12 grid gap-10 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="panel rounded-[36px] p-8">
            <SectionHeading
              eyebrow="Product details"
              title="Why this product deserves a closer look"
              description="Long-form product copy sits beside the structured specification table so the page works for both quick scanners and detail-oriented buyers."
              align="start"
            />
            <p className="mt-6 text-base leading-8 text-slate-600">{product.description}</p>
          </div>

          <div className="panel rounded-[36px] p-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="section-kicker">Reviews</p>
                <h2 className="mt-3 text-3xl font-bold text-slate-950" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  Trusted shopper feedback
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {(product.ratingAverage || 0).toFixed(1)} average from {product.ratingCount || 0} reviews.
                </p>
              </div>
              <span className="pill pill-muted">{product.category?.name || 'Catalog'}</span>
            </div>

            {user ? (
              <div className="panel-muted mt-8 rounded-[32px] p-6">
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
                    className="input h-12"
                  />
                  <textarea
                    value={reviewComment}
                    onChange={(event) => setReviewComment(event.target.value)}
                    rows={4}
                    placeholder="Share your experience with this product"
                    className="input min-h-[120px] rounded-[24px] px-4 py-3"
                  />
                  <button
                    type="button"
                    onClick={submitReview}
                    disabled={submittingReview}
                    className="btn-primary justify-center disabled:opacity-50"
                  >
                    {submittingReview ? 'Submitting...' : 'Submit review'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="panel-muted mt-8 rounded-[32px] p-6 text-sm text-slate-600">
                <Link to="/login" className="font-semibold text-slate-950 underline-offset-4 hover:underline">
                  Sign in
                </Link>{' '}
                to submit a review or save this product to your wishlist.
              </div>
            )}

            <div className="mt-8 space-y-4">
              {(product.reviews || []).length ? (
                product.reviews.map((review) => (
                  <div key={review.id} className="rounded-[32px] border border-slate-200 bg-white p-5">
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
                        {review.title ? <p className="mt-3 text-base font-semibold text-slate-900">{review.title}</p> : null}
                      </div>
                      <RatingStars rating={review.rating} />
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

        {relatedProducts.length ? (
          <section className="mt-12">
            <SectionHeading
              eyebrow="You may also like"
              title="More products from the same shopping lane"
              description="Keep discovery moving with adjacent products from the same category, merchandised to avoid dead ends in the browsing journey."
              align="between"
              action={
                <Link to={`/products?category=${product.category?.slug || ''}`} className="btn-secondary">
                  Browse category
                </Link>
              }
            />
            <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
