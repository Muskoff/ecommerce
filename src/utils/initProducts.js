const sampleProducts = [
  {
    id: 1,
    name: "Wireless Headphones",
    description: "Premium wireless headphones with noise cancellation and 30-hour battery life.",
    price: 199.99,
    rating: 4.5,
    images: [
      "https://placehold.co/600x400?text=Headphones+1",
      "https://placehold.co/600x400?text=Headphones+2",
      "https://placehold.co/600x400?text=Headphones+3"
    ],
    specifications: [
      { name: "Battery Life", value: "30 hours" },
      { name: "Bluetooth", value: "5.0" },
      { name: "Noise Cancellation", value: "Active" }
    ],
    reviews: [
      { user: "John D.", rating: 5, comment: "Great sound quality and comfortable fit!" },
      { user: "Sarah M.", rating: 4, comment: "Battery life is impressive, but a bit pricey." }
    ]
  },
  {
    id: 2,
    name: "Smart Watch",
    description: "Feature-rich smartwatch with health monitoring and app support.",
    price: 249.99,
    rating: 4.2,
    images: [
      "https://placehold.co/600x400?text=Watch+1",
      "https://placehold.co/600x400?text=Watch+2"
    ],
    specifications: [
      { name: "Display", value: "1.4\" AMOLED" },
      { name: "Battery Life", value: "7 days" },
      { name: "Water Resistance", value: "5 ATM" }
    ],
    reviews: [
      { user: "Mike R.", rating: 5, comment: "Perfect for fitness tracking!" },
      { user: "Lisa K.", rating: 3, comment: "Good features but battery could be better." }
    ]
  },
  {
    id: 3,
    name: "Laptop Pro",
    description: "High-performance laptop with latest processor and dedicated graphics.",
    price: 1299.99,
    rating: 4.8,
    images: [
      "https://placehold.co/600x400?text=Laptop+1",
      "https://placehold.co/600x400?text=Laptop+2",
      "https://placehold.co/600x400?text=Laptop+3"
    ],
    specifications: [
      { name: "Processor", value: "Intel i7 12th Gen" },
      { name: "RAM", value: "16GB" },
      { name: "Storage", value: "512GB SSD" }
    ],
    reviews: [
      { user: "Alex T.", rating: 5, comment: "Fast and reliable, perfect for work!" },
      { user: "Emma W.", rating: 4, comment: "Great performance but gets warm under load." }
    ]
  }
];

export const initializeProducts = () => {
  try {
    const existingProducts = JSON.parse(localStorage.getItem('ecommerce_products') || '[]');
    if (existingProducts.length === 0) {
      localStorage.setItem('ecommerce_products', JSON.stringify(sampleProducts));
      console.log('Sample products initialized in local storage');
    }
  } catch (error) {
    console.error('Error initializing products:', error);
  }
}; 