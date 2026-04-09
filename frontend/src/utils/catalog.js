const CATEGORY_THEMES = {
  laptops: {
    gradient: 'from-sky-500 via-cyan-500 to-blue-700',
    surface: 'bg-sky-50 text-sky-800 border-sky-200',
  },
  smartphones: {
    gradient: 'from-violet-500 via-fuchsia-500 to-indigo-700',
    surface: 'bg-violet-50 text-violet-800 border-violet-200',
  },
  audio: {
    gradient: 'from-emerald-500 via-teal-500 to-cyan-700',
    surface: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  },
  gaming: {
    gradient: 'from-rose-500 via-orange-500 to-red-700',
    surface: 'bg-rose-50 text-rose-800 border-rose-200',
  },
  accessories: {
    gradient: 'from-amber-500 via-orange-500 to-yellow-700',
    surface: 'bg-amber-50 text-amber-800 border-amber-200',
  },
  'smart-home': {
    gradient: 'from-slate-500 via-cyan-500 to-sky-700',
    surface: 'bg-slate-100 text-slate-800 border-slate-200',
  },
  wearables: {
    gradient: 'from-indigo-500 via-blue-500 to-cyan-700',
    surface: 'bg-indigo-50 text-indigo-800 border-indigo-200',
  },
  default: {
    gradient: 'from-slate-700 via-blue-700 to-slate-900',
    surface: 'bg-slate-100 text-slate-800 border-slate-200',
  },
};

const CATEGORY_LABELS = {
  laptop: 'LT',
  phone: 'PH',
  headphones: 'AU',
  controller: 'GM',
  bolt: 'AC',
  home: 'HM',
  watch: 'WR',
};

export const getCategoryTheme = (slug) => CATEGORY_THEMES[slug] || CATEGORY_THEMES.default;

export const getCategoryIconLabel = (category) => {
  const iconKey = String(category?.icon || '').toLowerCase();

  if (CATEGORY_LABELS[iconKey]) {
    return CATEGORY_LABELS[iconKey];
  }

  const source = String(category?.name || 'TZ')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('');

  return source || 'TZ';
};

export const getProductId = (product) => Number(product?.id || product?.productId || 0);

export const getProductHref = (product) => `/products/${product?.slug || getProductId(product)}`;

export const getProductImage = (product, seed = 'techzone') => {
  const image = Array.isArray(product?.images)
    ? product.images.find(Boolean)
    : null;

  if (typeof image === 'string' && image) {
    return image;
  }

  if (image?.imageUrl) {
    return image.imageUrl;
  }

  if (product?.imageUrl) {
    return product.imageUrl;
  }

  return `https://picsum.photos/seed/${seed}-${product?.slug || getProductId(product) || 'item'}/800/800`;
};

export const getProductFeatures = (product) =>
  (Array.isArray(product?.features) ? product.features : [])
    .map((feature) => (typeof feature === 'string' ? feature : feature?.featureText))
    .filter(Boolean);

export const getProductSpecifications = (product) =>
  (Array.isArray(product?.specifications) ? product.specifications : []).filter(
    (item) => item?.key && item?.value,
  );

export const isLowStock = (product) => {
  const stock = Number(product?.stockQuantity || 0);
  const threshold = Number(product?.lowStockThreshold || 5);

  return stock > 0 && stock <= threshold;
};
