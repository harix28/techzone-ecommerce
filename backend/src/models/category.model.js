const mapCategory = (row) => ({
  id: row.id,
  name: row.name,
  slug: row.slug,
  icon: row.icon || '',
  description: row.description || '',
  displayOrder: row.display_order || 0,
  isActive: Boolean(row.is_active),
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

module.exports = {
  mapCategory,
};
