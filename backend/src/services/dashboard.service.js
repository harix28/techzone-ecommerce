const { one, query } = require('../config/database');

const getDashboardSummary = async () => {
  const [
    orderStats,
    productStats,
    userStats,
    recentOrders,
    topProducts,
    monthlyRevenue,
    lowStockProducts,
  ] = await Promise.all([
    one(
      `
        SELECT
          COUNT(*) AS total_orders,
          SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending_orders,
          SUM(CASE WHEN status <> 'cancelled' THEN total_amount ELSE 0 END) AS total_revenue
        FROM orders
      `,
    ),
    one(
      `
        SELECT
          COUNT(*) AS total_products,
          SUM(CASE WHEN stock_quantity = 0 THEN 1 ELSE 0 END) AS out_of_stock
        FROM products
        WHERE is_active = TRUE
      `,
    ),
    one(
      `
        SELECT COUNT(*) AS total_users
        FROM users u
        INNER JOIN roles r ON r.id = u.role_id
        WHERE r.role_key = 'customer'
      `,
    ),
    query(
      `
        SELECT
          o.id,
          o.order_number,
          o.status,
          o.payment_status,
          o.payment_method,
          o.total_amount,
          o.created_at,
          u.id AS user_id,
          u.full_name,
          u.email
        FROM orders o
        INNER JOIN users u ON u.id = o.user_id
        ORDER BY o.created_at DESC
        LIMIT 5
      `,
    ),
    query(
      `
        SELECT
          p.id,
          p.name,
          p.price,
          p.sold_count,
          (
            SELECT pi.image_url
            FROM product_images pi
            WHERE pi.product_id = p.id
            ORDER BY pi.sort_order ASC
            LIMIT 1
          ) AS image_url
        FROM products p
        WHERE p.is_active = TRUE
        ORDER BY p.sold_count DESC, p.created_at DESC
        LIMIT 5
      `,
    ),
    query(
      `
        SELECT
          DATE_FORMAT(created_at, '%Y-%m') AS month_key,
          SUM(total_amount) AS revenue,
          COUNT(*) AS order_count
        FROM orders
        WHERE status <> 'cancelled'
        GROUP BY DATE_FORMAT(created_at, '%Y-%m')
        ORDER BY month_key DESC
        LIMIT 12
      `,
    ),
    query(
      `
        SELECT id, name, sku, stock_quantity
        FROM products
        WHERE is_active = TRUE AND stock_quantity <= low_stock_threshold
        ORDER BY stock_quantity ASC, name ASC
        LIMIT 10
      `,
    ),
  ]);

  return {
    stats: {
      totalOrders: Number(orderStats?.total_orders || 0),
      pendingOrders: Number(orderStats?.pending_orders || 0),
      totalRevenue: Number(orderStats?.total_revenue || 0),
      totalProducts: Number(productStats?.total_products || 0),
      outOfStock: Number(productStats?.out_of_stock || 0),
      totalUsers: Number(userStats?.total_users || 0),
      lowStockProducts: lowStockProducts.length,
    },
    recentOrders: recentOrders.map((row) => ({
      id: row.id,
      orderNumber: row.order_number,
      status: row.status,
      paymentStatus: row.payment_status,
      paymentMethod: row.payment_method,
      totalAmount: Number(row.total_amount || 0),
      createdAt: row.created_at,
      customer: {
        id: row.user_id,
        name: row.full_name,
        email: row.email,
      },
    })),
    topProducts: topProducts.map((row) => ({
      id: row.id,
      name: row.name,
      price: Number(row.price || 0),
      soldCount: Number(row.sold_count || 0),
      imageUrl: row.image_url || '',
    })),
    monthlyRevenue: monthlyRevenue
      .slice()
      .reverse()
      .map((row) => ({
        monthKey: row.month_key,
        revenue: Number(row.revenue || 0),
        orders: Number(row.order_count || 0),
      })),
    lowStockProducts: lowStockProducts.map((row) => ({
      id: row.id,
      name: row.name,
      sku: row.sku,
      stockQuantity: Number(row.stock_quantity || 0),
    })),
  };
};

module.exports = {
  getDashboardSummary,
};
