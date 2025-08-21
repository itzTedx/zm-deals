import { Deal } from "@/modules/product/types";

const REVIEWS = [
  {
    id: 1,
    name: "Sarah M.",
    rating: 5,
    date: new Date("2025-08-15"),
    comment:
      "This vacuum suction phone holder is a game-changer for my daily commute. It's incredibly stable and holds my phone securely even on bumpy roads. The suction is so strong that I don't worry about it falling off. Perfect for using GPS and taking hands-free calls.",
  },
  {
    id: 2,
    name: "Mike R.",
    rating: 3,
    date: new Date("2025-08-10"),
    comment:
      "I've tried several phone mounts before, but this one is by far the best. The vacuum suction is incredibly strong and it's easy to position. My phone stays put even during sharp turns. The build quality is excellent and it looks great in my car.",
  },
  {
    id: 3,
    name: "Jennifer L.",
    rating: 4,
    date: new Date("2025-08-08"),
    comment:
      "This phone holder works really well! The suction is strong and it holds my phone securely. The only reason I'm giving it 4 stars instead of 5 is that it took a couple of tries to get the perfect angle for my windshield. Once positioned correctly, it's perfect.",
  },
  {
    id: 4,
    name: "David K.",
    rating: 2,
    date: new Date("2025-08-05"),
    comment:
      "I'm impressed with the quality of this phone holder. The suction mechanism is very reliable and the phone stays in place even on rough roads. The installation was straightforward and it's easy to remove when needed. Highly recommend!",
  },
  {
    id: 5,
    name: "Amanda T.",
    rating: 5,
    date: new Date("2025-08-01"),
    comment:
      "Used this on a 6-hour road trip and it performed flawlessly. The phone stayed perfectly positioned the entire time, making navigation much easier and safer. The suction is incredibly strong - I was worried it might fall off but it never budged.",
  },
  {
    id: 6,
    name: "Robert J.",
    rating: 2,
    date: new Date("2025-08-28"),
    comment:
      "This is a well-made phone holder with excellent suction power. It holds my phone securely and the positioning is flexible. The only minor issue is that it can be a bit tricky to remove from the windshield, but that's actually a good sign of how strong the suction is.",
  },
  {
    id: 7,
    name: "John D.",
    rating: 5,
    date: new Date("2025-08-05"),
    comment:
      "I'm impressed with the quality of this phone holder. The suction mechanism is very reliable and the phone stays in place even on rough roads. The installation was straightforward and it's easy to remove when needed. Highly recommend!",
  },
  {
    id: 8,
    name: "Jane S.",
    rating: 3,
    date: new Date("2025-08-01"),
    comment:
      "Used this on a 6-hour road trip and it performed flawlessly. The phone stayed perfectly positioned the entire time, making navigation much easier and safer. The suction is incredibly strong - I was worried it might fall off but it never budged.",
  },
  {
    id: 9,
    name: "James T.",
    rating: 4,
    date: new Date("2025-08-28"),
    comment:
      "This is a well-made phone holder with excellent suction power. It holds my phone securely and the positioning is flexible. The only minor issue is that it can be a bit tricky to remove from the windshield, but that's actually a good sign of how strong the suction is.",
  },
];

export const PRODUCT = {
  title: "Vacuum Suction Phone Holder",
  overview: "Secure your phone while driving - hands-free, safe, and stable.",
  slug: "vacuum-suction-phone-holder",
  price: "39.00",
  originalPrice: "89.50",
  featuredImage: "/images/vacuum-holder.webp",
  stock: 21,
  endsIn: new Date("2025-08-23T23:59:59Z"), // Deal ends on August 23rd, 2025
  description:
    "Drive safer and smarter with the Magnetic Car Phone Mount. Designed with powerful magnets and a sleek, compact design, it keeps your phone securely in place while you focus on the road. Whether you're navigating maps, answering calls hands-free, or playing music, this mount makes your ride stress-free. Perfect for daily commutes and road trips alike.",
  images: [
    { url: "/images/vacuum-1.webp" },
    { url: "/images/vacuum-2.webp" },
    { url: "/images/vacuum-3.webp" },
    { url: "/images/vacuum-4.webp" },
  ],
  reviews: REVIEWS,
};

export const DEALS: Deal[] = [
  {
    id: 1,
    title: "Vacuum Suction Phone Holder",
    overview: "Secure your phone while driving - hands-free, safe, and stable.",
    slug: "vacuum-suction-phone-holder",
    price: "39.00",
    originalPrice: "89.50",
    featuredImage: "/images/vacuum-holder.webp",
    stock: 21,
    endsIn: new Date("2025-08-23T23:23:59Z"), // Deal ends on August 23rd, 2025
    description:
      "Drive safer and smarter with the Magnetic Car Phone Mount. Designed with powerful magnets and a sleek, compact design, it keeps your phone securely in place while you focus on the road. Whether you're navigating maps, answering calls hands-free, or playing music, this mount makes your ride stress-free. Perfect for daily commutes and road trips alike.",
    images: [
      { url: "/images/vacuum-1.webp" },
      { url: "/images/vacuum-2.webp" },
      { url: "/images/vacuum-3.webp" },
      { url: "/images/vacuum-4.webp" },
    ],
    reviews: REVIEWS,
    delivery: "30.00",
  },
  {
    id: 2,
    title: "USB C Car Charger (Fast Charger USB-C)",
    overview: "Secure your phone while driving - hands-free, safe, and stable.",
    slug: "usb-c-car-charger",
    price: "50.00",
    originalPrice: "109.50",
    featuredImage: "/images/usb-c-car-charger.webp",
    stock: 16,
    endsIn: new Date("2025-08-21T21:59:46Z"), // Deal ends on August 23rd, 2025
    description:
      "Drive safer and smarter with the Magnetic Car Phone Mount. Designed with powerful magnets and a sleek, compact design, it keeps your phone securely in place while you focus on the road. Whether you're navigating maps, answering calls hands-free, or playing music, this mount makes your ride stress-free. Perfect for daily commutes and road trips alike.",
    images: [
      { url: "/images/vacuum-1.webp" },
      { url: "/images/vacuum-2.webp" },
      { url: "/images/vacuum-3.webp" },
      { url: "/images/vacuum-4.webp" },
    ],
    reviews: [...REVIEWS, ...REVIEWS, ...REVIEWS, ...REVIEWS, ...REVIEWS, ...REVIEWS, ...REVIEWS],
    delivery: "30.00",
  },
  {
    id: 3,
    title: "Foldable Automobile Windshield Umbrella",
    overview: "Secure your phone while driving - hands-free, safe, and stable.",
    slug: "foldable-automobile-windshield-umbrella",
    price: "10.00",
    originalPrice: "20.50",
    featuredImage: "/images/car-umbrella.webp",
    stock: 10,
    endsIn: new Date("2025-08-26T21:29:52Z"), // Deal ends on August 23rd, 2025
    description:
      "Drive safer and smarter with the Magnetic Car Phone Mount. Designed with powerful magnets and a sleek, compact design, it keeps your phone securely in place while you focus on the road. Whether you're navigating maps, answering calls hands-free, or playing music, this mount makes your ride stress-free. Perfect for daily commutes and road trips alike.",
    images: [
      { url: "/images/vacuum-1.webp" },
      { url: "/images/vacuum-2.webp" },
      { url: "/images/vacuum-3.webp" },
      { url: "/images/vacuum-4.webp" },
    ],
    reviews: [...REVIEWS, ...REVIEWS, ...REVIEWS],
    delivery: "10.00",
  },
  {
    id: 4,
    title: "Car Combo Essential",
    combo: true,
    overview:
      "Secure your phone while driving - hands-free, safe, and stable. Plus, stay protected from the sun with our foldable windshield umbrella.",
    slug: "car-combo-essential",
    price: "99.00",
    originalPrice: "219.50",
    featuredImage: "/images/combo.webp",
    stock: 20,
    endsIn: new Date("2025-08-26T21:29:59Z"), // Deal ends on August 26th, 2025
    description:
      "Drive safer and smarter with the Magnetic Car Phone Mount, designed with powerful magnets and a sleek, compact design. It keeps your phone securely in place while you focus on the road. Additionally, our Foldable Automobile Windshield Umbrella provides shade and protection from the sun, making your driving experience even more comfortable. Perfect for daily commutes and road trips alike.",
    images: [
      { url: "/images/vacuum-holder.webp" },
      { url: "/images/car-umbrella.webp" },
      { url: "/images/usb-c-car-charger.webp" },
    ],
    reviews: [...REVIEWS, ...REVIEWS, ...REVIEWS],
    delivery: null,
  },
  {
    id: 5,
    title: "Car Combo Essential",
    combo: true,
    overview:
      "Secure your phone while driving - hands-free, safe, and stable. Plus, stay protected from the sun with our foldable windshield umbrella.",
    slug: "car-combo-essential",
    price: "99.00",
    originalPrice: "219.50",
    featuredImage: "/images/combo.webp",
    stock: 20,
    endsIn: new Date("2025-08-26T21:29:59Z"), // Deal ends on August 26th, 2025
    description:
      "Drive safer and smarter with the Magnetic Car Phone Mount, designed with powerful magnets and a sleek, compact design. It keeps your phone securely in place while you focus on the road. Additionally, our Foldable Automobile Windshield Umbrella provides shade and protection from the sun, making your driving experience even more comfortable. Perfect for daily commutes and road trips alike.",
    images: [
      { url: "/images/vacuum-holder.webp" },
      { url: "/images/car-umbrella.webp" },
      { url: "/images/usb-c-car-charger.webp" },
    ],
    reviews: [...REVIEWS, ...REVIEWS, ...REVIEWS],
    delivery: null,
  },
  {
    id: 6,
    title: "Car Combo Essential",
    combo: true,
    overview:
      "Secure your phone while driving - hands-free, safe, and stable. Plus, stay protected from the sun with our foldable windshield umbrella.",
    slug: "car-combo-essential",
    price: "99.00",
    originalPrice: "219.50",
    featuredImage: "/images/combo.webp",
    stock: 20,
    endsIn: new Date("2025-08-26T21:29:59Z"), // Deal ends on August 26th, 2025
    description:
      "Drive safer and smarter with the Magnetic Car Phone Mount, designed with powerful magnets and a sleek, compact design. It keeps your phone securely in place while you focus on the road. Additionally, our Foldable Automobile Windshield Umbrella provides shade and protection from the sun, making your driving experience even more comfortable. Perfect for daily commutes and road trips alike.",
    images: [
      { url: "/images/vacuum-holder.webp" },
      { url: "/images/car-umbrella.webp" },
      { url: "/images/usb-c-car-charger.webp" },
    ],
    reviews: [...REVIEWS, ...REVIEWS, ...REVIEWS],
    delivery: null,
  },
];

export const LAST_MINUTE_DEALS = [
  {
    id: 1,
    title: "USB Car Charger (Fast Charger USB-C)",
    image: "/images/usb-c-car-charger.webp",
  },
  {
    id: 2,
    title: "Apple Air Pods Pro 2",
    image: "/images/vacuum-holder.webp",
  },
  {
    id: 3,
    title: "Foldable Car Windshield Sunshade",
    image: "/images/vacuum-holder.webp",
  },
];

export const FEEDBACKS = [
  {
    id: 1,
    name: "Lisa Chen",
    rating: 5,
    date: new Date("2025-08-20"),
    comment:
      "Absolutely love this phone holder! The suction is incredibly strong and it's so easy to install. I use it every day for my commute and it never fails. The phone stays perfectly in place even on rough roads. Best purchase I've made for my car!",
  },
  {
    id: 2,
    name: "Tom Wilson",
    rating: 4,
    date: new Date("2025-08-18"),
    comment:
      "Great product overall. The suction is very reliable and the phone holder is well-built. It took me a few tries to get the perfect position on my windshield, but once I found the right spot, it's been rock solid. Would definitely recommend to others.",
  },
  {
    id: 3,
    name: "Maria Rodriguez",
    rating: 5,
    date: new Date("2025-08-16"),
    comment:
      "This phone holder exceeded my expectations! I was skeptical about the suction at first, but it's incredibly strong. I've been using it for navigation on long trips and it's been perfect. The phone never moves or falls, even on bumpy roads.",
  },
  {
    id: 4,
    name: "James Thompson",
    rating: 5,
    date: new Date("2025-08-14"),
    comment:
      "Excellent quality and very easy to use. The suction mechanism is impressive - it holds my phone securely without any wobbling. Installation was straightforward and it looks professional in my car. Highly satisfied with this purchase!",
  },
  {
    id: 5,
    name: "Emily Davis",
    rating: 4,
    date: new Date("2025-08-12"),
    comment:
      "Really good phone holder with strong suction power. It holds my phone securely and the positioning is flexible. The only reason I'm giving 4 stars is that it can be a bit tricky to remove from the windshield, but that's actually a testament to how strong it is.",
  },
  {
    id: 6,
    name: "Carlos Mendez",
    rating: 5,
    date: new Date("2025-08-10"),
    comment:
      "Perfect for my daily use! The suction is incredibly strong and reliable. I've been using it for GPS navigation and hands-free calls, and it works flawlessly. The build quality is excellent and it's very easy to adjust the phone position.",
  },
  {
    id: 7,
    name: "Rachel Green",
    rating: 5,
    date: new Date("2025-08-08"),
    comment:
      "This is exactly what I needed for my car! The vacuum suction is so strong that I don't worry about my phone falling off at all. It's perfect for using maps and taking calls while driving. The installation was quick and easy.",
  },
  {
    id: 8,
    name: "Kevin Park",
    rating: 4,
    date: new Date("2025-08-06"),
    comment:
      "Very solid phone holder with excellent suction power. It holds my phone securely and the positioning is great for visibility. The only minor issue is that it can leave a small mark on the windshield when removed, but that's normal for suction mounts.",
  },
  {
    id: 9,
    name: "Sophie Anderson",
    rating: 5,
    date: new Date("2025-08-04"),
    comment:
      "I'm amazed by how well this phone holder works! The suction is incredibly strong and it's so easy to position my phone exactly where I want it. I use it every day and it's been completely reliable. Great value for the price!",
  },
  {
    id: 10,
    name: "Alex Johnson",
    rating: 5,
    date: new Date("2025-08-02"),
    comment:
      "Outstanding product! The vacuum suction is incredibly reliable and the phone holder is very well designed. I've been using it for navigation on long road trips and it's been perfect. The phone stays in place even on rough terrain.",
  },
];
