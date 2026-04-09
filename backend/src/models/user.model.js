const mapUser = (row) => ({
  id: row.id,
  name: row.full_name,
  email: row.email,
  phone: row.phone || '',
  avatar: row.avatar_url || '',
  role: row.role_key,
  isActive: Boolean(row.is_active),
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const mapAddress = (row) => ({
  id: row.id,
  label: row.label,
  fullName: row.full_name,
  phone: row.phone,
  line1: row.line1,
  line2: row.line2 || '',
  city: row.city,
  state: row.state,
  postalCode: row.postal_code,
  country: row.country,
  isDefault: Boolean(row.is_default),
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

module.exports = {
  mapUser,
  mapAddress,
};
