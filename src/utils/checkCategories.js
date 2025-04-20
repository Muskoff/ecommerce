const checkCategories = () => {
  try {
    // Use the fetched categories data directly
    const categories = [
      {
        "id": 1,
        "name": "fb",
        "description": "kkh",
        "parent_id": null,
        "created_at": "2025-04-02T15:38:24.000Z",
        "updated_a": "2025-04-02T15:38:24.000Z",
        "image_url": null,
        "is_active": "1"
      },
      {
        "id": 2,
        "name": "Muskoff Nueon",
        "description": "nice",
        "parent_id": 1,
        "created_at": "2025-04-02T15:39:12.000Z",
        "updated_a": "2025-04-02T15:39:12.000Z",
        "image_url": null,
        "is_active": "1"
      }
    ];
    
    console.log('Categories:', categories);
    return categories;
  } catch (error) {
    console.error('Error with categories:', error);
    return [];
  }
};

export default checkCategories; 