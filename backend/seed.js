const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

const { buildDbConfig } = require('./src/config/database');
const { categories, products } = require('./scripts/seed-data/catalog');
const { users } = require('./scripts/seed-data/users');
const { carts, coupons, orders, reviews, wishlists } = require('./scripts/seed-data/commerce');

const resetTables = async (connection) => {
  const tables = [
    'refresh_tokens',
    'payments',
    'reviews',
    'order_items',
    'orders',
    'cart_items',
    'carts',
    'wishlist_items',
    'wishlists',
    'inventory_movements',
    'product_features',
    'product_specs',
    'product_images',
    'products',
    'addresses',
    'coupons',
    'users',
    'categories',
    'roles',
  ];

  await connection.query('SET FOREIGN_KEY_CHECKS = 0');

  for (const table of tables) {
    await connection.query(`TRUNCATE TABLE \`${table}\``);
  }

  await connection.query('SET FOREIGN_KEY_CHECKS = 1');
};

const calculateDiscountAmount = (coupon, subtotal) => {
  if (!coupon) {
    return 0;
  }

  const raw =
    coupon.discountType === 'percent'
      ? (subtotal * coupon.discountValue) / 100
      : coupon.discountValue;

  if (coupon.maxDiscountAmount) {
    return Number(Math.min(raw, coupon.maxDiscountAmount).toFixed(2));
  }

  return Number(raw.toFixed(2));
};

const paymentStateForOrder = (order) => {
  if (order.paymentStatus === 'refunded') {
    return 'refunded';
  }

  if (order.paymentStatus === 'paid') {
    return 'paid';
  }

  if (order.paymentStatus === 'failed') {
    return 'failed';
  }

  return 'pending';
};

const runSeed = async () => {
  const connection = await mysql.createConnection({
    ...buildDbConfig(),
    decimalNumbers: true,
  });

  const roleMap = new Map();
  const categoryMap = new Map();
  const userMap = new Map();
  const addressMap = new Map();
  const cartMap = new Map();
  const wishlistMap = new Map();
  const productMap = new Map();
  const couponMap = new Map();

  try {
    await connection.beginTransaction();
    await resetTables(connection);

    const roles = [
      { roleKey: 'admin', name: 'Administrator', description: 'Full platform management access.' },
      { roleKey: 'customer', name: 'Customer', description: 'Standard customer account.' },
    ];

    for (const role of roles) {
      const [result] = await connection.execute(
        'INSERT INTO roles (role_key, name, description) VALUES (?, ?, ?)',
        [role.roleKey, role.name, role.description],
      );
      roleMap.set(role.roleKey, result.insertId);
    }

    for (const category of categories) {
      const [result] = await connection.execute(
        `
          INSERT INTO categories (name, slug, icon, description, display_order, is_active)
          VALUES (?, ?, ?, ?, ?, TRUE)
        `,
        [category.name, category.slug, category.icon, category.description, category.displayOrder],
      );
      categoryMap.set(category.slug, result.insertId);
    }

    for (const user of users) {
      const passwordHash = await bcrypt.hash(user.password, 12);
      const [userResult] = await connection.execute(
        `
          INSERT INTO users (
            role_id,
            full_name,
            email,
            password_hash,
            phone,
            avatar_url,
            is_active,
            email_verified_at
          )
          VALUES (?, ?, ?, ?, ?, ?, TRUE, CURRENT_TIMESTAMP)
        `,
        [roleMap.get(user.role), user.name, user.email, passwordHash, user.phone, user.avatarUrl],
      );

      userMap.set(user.email, { id: userResult.insertId, ...user });

      const [cartResult] = await connection.execute('INSERT INTO carts (user_id) VALUES (?)', [userResult.insertId]);
      const [wishlistResult] = await connection.execute('INSERT INTO wishlists (user_id) VALUES (?)', [userResult.insertId]);
      cartMap.set(user.email, cartResult.insertId);
      wishlistMap.set(user.email, wishlistResult.insertId);

      for (const address of user.addresses) {
        const [addressResult] = await connection.execute(
          `
            INSERT INTO addresses (
              user_id,
              label,
              full_name,
              phone,
              line1,
              line2,
              city,
              state,
              postal_code,
              country,
              is_default
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `,
          [
            userResult.insertId,
            address.label,
            address.fullName,
            address.phone,
            address.line1,
            address.line2 || null,
            address.city,
            address.state,
            address.postalCode,
            address.country,
            address.isDefault,
          ],
        );

        addressMap.set(`${user.email}:${address.label}`, { id: addressResult.insertId, ...address });
      }
    }

    for (const coupon of coupons) {
      const [couponResult] = await connection.execute(
        `
          INSERT INTO coupons (
            code,
            description,
            discount_type,
            discount_value,
            min_order_value,
            max_discount_amount,
            starts_at,
            ends_at,
            usage_limit,
            usage_count,
            is_active
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)
        `,
        [
          coupon.code,
          coupon.description,
          coupon.discountType,
          coupon.discountValue,
          coupon.minOrderValue,
          coupon.maxDiscountAmount,
          coupon.startsAt,
          coupon.endsAt,
          coupon.usageLimit,
          coupon.isActive,
        ],
      );

      couponMap.set(coupon.code, { id: couponResult.insertId, ...coupon, usageCount: 0 });
    }

    for (const product of products) {
      const [productResult] = await connection.execute(
        `
          INSERT INTO products (
            category_id,
            name,
            slug,
            sku,
            brand,
            short_description,
            description,
            price,
            compare_at_price,
            stock_quantity,
            low_stock_threshold,
            warranty,
            search_keywords,
            rating_average,
            rating_count,
            sold_count,
            is_featured,
            is_active
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 0, ?, TRUE)
        `,
        [
          categoryMap.get(product.categorySlug),
          product.name,
          product.slug,
          product.sku,
          product.brand,
          product.shortDescription,
          product.description,
          product.price,
          product.compareAtPrice,
          product.stockQuantity,
          product.lowStockThreshold,
          product.warranty,
          product.searchKeywords,
          product.isFeatured,
        ],
      );

      productMap.set(product.sku, { id: productResult.insertId, ...product });

      for (const [index, item] of product.images.entries()) {
        await connection.execute(
          `
            INSERT INTO product_images (product_id, image_url, alt_text, sort_order)
            VALUES (?, ?, ?, ?)
          `,
          [productResult.insertId, item, product.name, index],
        );
      }

      for (const [index, feature] of product.features.entries()) {
        await connection.execute(
          `
            INSERT INTO product_features (product_id, feature_text, sort_order)
            VALUES (?, ?, ?)
          `,
          [productResult.insertId, feature, index],
        );
      }

      for (const [index, spec] of product.specifications.entries()) {
        await connection.execute(
          `
            INSERT INTO product_specs (product_id, spec_key, spec_value, sort_order)
            VALUES (?, ?, ?, ?)
          `,
          [productResult.insertId, spec.key, spec.value, index],
        );
      }

      await connection.execute(
        `
          INSERT INTO inventory_movements (product_id, quantity_delta, change_type, reference_type, reference_id, notes)
          VALUES (?, ?, 'seed', 'catalog', ?, 'Initial seeded stock level')
        `,
        [productResult.insertId, product.stockQuantity, product.sku],
      );
    }

    for (const cart of carts) {
      for (const item of cart.items) {
        const product = productMap.get(item.sku);
        await connection.execute(
          `
            INSERT INTO cart_items (cart_id, product_id, quantity, unit_price_snapshot)
            VALUES (?, ?, ?, ?)
          `,
          [cartMap.get(cart.email), product.id, item.quantity, product.price],
        );
      }
    }

    for (const wishlist of wishlists) {
      for (const sku of wishlist.skus) {
        const product = productMap.get(sku);
        await connection.execute(
          `
            INSERT INTO wishlist_items (wishlist_id, product_id)
            VALUES (?, ?)
          `,
          [wishlistMap.get(wishlist.email), product.id],
        );
      }
    }

    for (const order of orders) {
      const user = userMap.get(order.email);
      const address = addressMap.get(`${order.email}:${order.addressLabel}`);
      const coupon = order.couponCode ? couponMap.get(order.couponCode) : null;
      const items = order.items.map((item) => {
        const product = productMap.get(item.sku);
        return {
          ...item,
          product,
          lineTotal: Number((product.price * item.quantity).toFixed(2)),
        };
      });
      const subtotal = Number(items.reduce((sum, item) => sum + item.lineTotal, 0).toFixed(2));
      const shippingAmount = subtotal >= 99 ? 0 : 9.99;
      const taxAmount = Number((subtotal * 0.08).toFixed(2));
      const discountAmount = calculateDiscountAmount(coupon, subtotal);
      const totalAmount = Number((subtotal + shippingAmount + taxAmount - discountAmount).toFixed(2));

      const [orderResult] = await connection.execute(
        `
          INSERT INTO orders (
            order_number,
            user_id,
            address_id,
            address_label,
            address_full_name,
            address_phone,
            address_line1,
            address_line2,
            address_city,
            address_state,
            address_postal_code,
            address_country,
            status,
            payment_status,
            payment_method,
            coupon_id,
            coupon_code,
            discount_amount,
            subtotal,
            shipping_amount,
            tax_amount,
            total_amount,
            notes,
            tracking_number,
            placed_at,
            delivered_at,
            cancelled_at,
            created_at,
            updated_at
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          order.orderNumber,
          user.id,
          address.id,
          address.label,
          address.fullName,
          address.phone,
          address.line1,
          address.line2 || null,
          address.city,
          address.state,
          address.postalCode,
          address.country,
          order.status,
          order.paymentStatus,
          order.paymentMethod,
          coupon?.id || null,
          coupon?.code || null,
          discountAmount,
          subtotal,
          shippingAmount,
          taxAmount,
          totalAmount,
          order.notes || null,
          order.trackingNumber || null,
          order.placedAt,
          order.deliveredAt || null,
          order.cancelledAt || null,
          order.placedAt,
          order.deliveredAt || order.cancelledAt || order.placedAt,
        ],
      );

      for (const item of items) {
        await connection.execute(
          `
            INSERT INTO order_items (
              order_id,
              product_id,
              product_name,
              sku,
              image_url,
              unit_price,
              quantity,
              line_total,
              created_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `,
          [
            orderResult.insertId,
            item.product.id,
            item.product.name,
            item.product.sku,
            item.product.images[0],
            item.product.price,
            item.quantity,
            item.lineTotal,
            order.placedAt,
          ],
        );

        if (order.status !== 'cancelled') {
          await connection.execute(
            `
              UPDATE products
              SET stock_quantity = stock_quantity - ?, sold_count = sold_count + ?
              WHERE id = ?
            `,
            [item.quantity, item.quantity, item.product.id],
          );
          await connection.execute(
            `
              INSERT INTO inventory_movements (product_id, quantity_delta, change_type, reference_type, reference_id, notes, created_at)
              VALUES (?, ?, 'order_placed', 'order', ?, ?, ?)
            `,
            [item.product.id, -item.quantity, order.orderNumber, `Stock reserved for ${order.orderNumber}`, order.placedAt],
          );
        }
      }

      await connection.execute(
        `
          INSERT INTO payments (
            order_id,
            provider,
            transaction_reference,
            amount,
            currency,
            status,
            paid_at,
            created_at,
            updated_at
          )
          VALUES (?, ?, ?, ?, 'USD', ?, ?, ?, ?)
        `,
        [
          orderResult.insertId,
          order.paymentMethod,
          `${order.orderNumber}-${order.paymentMethod}`,
          totalAmount,
          paymentStateForOrder(order),
          order.paymentStatus === 'paid' ? order.deliveredAt || order.placedAt : null,
          order.placedAt,
          order.deliveredAt || order.cancelledAt || order.placedAt,
        ],
      );

      if (coupon) {
        await connection.execute('UPDATE coupons SET usage_count = usage_count + 1 WHERE id = ?', [coupon.id]);
      }
    }

    for (const review of reviews) {
      const user = userMap.get(review.email);
      const product = productMap.get(review.sku);
      await connection.execute(
        `
          INSERT INTO reviews (
            product_id,
            user_id,
            rating,
            title,
            comment,
            is_verified_purchase,
            created_at,
            updated_at
          )
          VALUES (?, ?, ?, ?, ?, TRUE, ?, ?)
        `,
        [product.id, user.id, review.rating, review.title, review.comment, review.createdAt, review.createdAt],
      );
    }

    await connection.execute(
      `
        UPDATE products p
        LEFT JOIN (
          SELECT product_id, ROUND(AVG(rating), 2) AS avg_rating, COUNT(*) AS rating_count
          FROM reviews
          GROUP BY product_id
        ) r ON r.product_id = p.id
        SET
          p.rating_average = COALESCE(r.avg_rating, 0),
          p.rating_count = COALESCE(r.rating_count, 0)
      `,
    );

    await connection.commit();

    console.log('Seed completed successfully.');
    console.log('Admin login: admin@techzone.com / Admin@1234');
    console.log('Customer login: aisha.khan@example.com / User@1234');
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    await connection.end();
  }
};

if (require.main === module) {
  runSeed().catch((error) => {
    console.error('Seed failed:', error.message);
    process.exit(1);
  });
}

module.exports = {
  runSeed,
};
