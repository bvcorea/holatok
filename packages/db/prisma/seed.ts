import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ─── Contents (K-Culture sample) ─────────────────────────────
  const contents = [
    {
      sourceType: "YOUTUBE" as const,
      sourceId: "YT_KPOP_001",
      title: "NewJeans 'Supernatural' M/V",
      titleEs: "NewJeans 'Supernatural' Video Musical",
      description: "Official Music Video",
      thumbnailUrl: "https://i.ytimg.com/vi/sample1/hqdefault.jpg",
      category: "KPOP" as const,
      viewCount: 150000,
      published: true,
      publishedAt: new Date("2024-06-21"),
    },
    {
      sourceType: "YOUTUBE" as const,
      sourceId: "YT_KPOP_002",
      title: "aespa 'Whiplash' Performance Video",
      titleEs: "aespa 'Whiplash' Video de Performance",
      description: "Official Performance Video",
      thumbnailUrl: "https://i.ytimg.com/vi/sample2/hqdefault.jpg",
      category: "KPOP" as const,
      viewCount: 89000,
      published: true,
      publishedAt: new Date("2024-10-10"),
    },
    {
      sourceType: "YOUTUBE" as const,
      sourceId: "YT_KDRAMA_001",
      title: "Queen of Tears — Trailer Oficial",
      titleEs: "Reina de Lágrimas — Tráiler Oficial",
      description: "K-Drama Netflix 2024",
      thumbnailUrl: "https://i.ytimg.com/vi/sample3/hqdefault.jpg",
      category: "KDRAMA" as const,
      viewCount: 320000,
      published: true,
      publishedAt: new Date("2024-03-09"),
    },
    {
      sourceType: "YOUTUBE" as const,
      sourceId: "YT_KDRAMA_002",
      title: "When The Stars Gossip — Teaser",
      titleEs: "Cuando las Estrellas Chismean — Teaser",
      description: "K-Drama 2025",
      thumbnailUrl: "https://i.ytimg.com/vi/sample4/hqdefault.jpg",
      category: "KDRAMA" as const,
      viewCount: 45000,
      published: true,
      publishedAt: new Date("2025-01-01"),
    },
    {
      sourceType: "YOUTUBE" as const,
      sourceId: "YT_KBEAUTY_001",
      title: "Rutina Skincare Coreana 10 Pasos",
      titleEs: "Rutina Skincare Coreana 10 Pasos",
      description: "Tutorial completo de K-Beauty",
      thumbnailUrl: "https://i.ytimg.com/vi/sample5/hqdefault.jpg",
      category: "KBEAUTY" as const,
      viewCount: 210000,
      published: true,
      publishedAt: new Date("2024-08-15"),
    },
    {
      sourceType: "YOUTUBE" as const,
      sourceId: "YT_KBEAUTY_002",
      title: "COSRX vs INNISFREE: ¿Cuál Hidratante Elegir?",
      titleEs: "COSRX vs INNISFREE: ¿Cuál Hidratante Elegir?",
      description: "Comparativa de productos K-Beauty populares",
      thumbnailUrl: "https://i.ytimg.com/vi/sample6/hqdefault.jpg",
      category: "KBEAUTY" as const,
      viewCount: 67000,
      published: true,
      publishedAt: new Date("2024-09-20"),
    },
    {
      sourceType: "YOUTUBE" as const,
      sourceId: "YT_KFOOD_001",
      title: "Cómo hacer Tteokbokki en Casa",
      titleEs: "Cómo hacer Tteokbokki en Casa",
      description: "Receta fácil de comida callejera coreana",
      thumbnailUrl: "https://i.ytimg.com/vi/sample7/hqdefault.jpg",
      category: "KFOOD" as const,
      viewCount: 178000,
      published: true,
      publishedAt: new Date("2024-07-04"),
    },
    {
      sourceType: "YOUTUBE" as const,
      sourceId: "YT_KFOOD_002",
      title: "Tour Gastronómico por Myeongdong, Seúl",
      titleEs: "Tour Gastronómico por Myeongdong, Seúl",
      description: "Los mejores snacks coreanos en Myeongdong",
      thumbnailUrl: "https://i.ytimg.com/vi/sample8/hqdefault.jpg",
      category: "KFOOD" as const,
      viewCount: 93000,
      published: true,
      publishedAt: new Date("2024-06-01"),
    },
    {
      sourceType: "YOUTUBE" as const,
      sourceId: "YT_KTRAVEL_001",
      title: "Guía Completa: Seúl por Primera Vez",
      titleEs: "Guía Completa: Seúl por Primera Vez",
      description: "Todo lo que necesitas saber para viajar a Corea",
      thumbnailUrl: "https://i.ytimg.com/vi/sample9/hqdefault.jpg",
      category: "KTRAVEL" as const,
      viewCount: 425000,
      published: true,
      publishedAt: new Date("2024-04-01"),
    },
    {
      sourceType: "YOUTUBE" as const,
      sourceId: "YT_KTRAVEL_002",
      title: "Jeju Island Vlog — Paraíso Coreano",
      titleEs: "Jeju Island Vlog — Paraíso Coreano",
      description: "5 días en la isla de Jeju",
      thumbnailUrl: "https://i.ytimg.com/vi/sample10/hqdefault.jpg",
      category: "KTRAVEL" as const,
      viewCount: 156000,
      published: true,
      publishedAt: new Date("2024-05-20"),
    },
  ];

  for (const content of contents) {
    await prisma.content.upsert({
      where: { sourceType_sourceId: { sourceType: content.sourceType, sourceId: content.sourceId } },
      update: {},
      create: content,
    });
  }
  console.log(`✅ Seeded ${contents.length} contents`);

  // ─── Travel Packages ──────────────────────────────────────────
  const packages = [
    {
      title: "Seoul Highlights 7D/6N",
      titleEs: "Lo Mejor de Seúl 7D/6N",
      description: "Complete Seoul experience with Gyeongbokgung, Myeongdong, Hongdae",
      descriptionEs: "Experiencia completa en Seúl: Gyeongbokgung, Myeongdong, Hongdae y más",
      country: "MX" as const,
      daysCount: 7,
      nights: 6,
      priceKRW: 1800000,
      priceUSD: 1380,
      imageUrls: [],
      maxGroupSize: 12,
      published: true,
    },
    {
      title: "Jeju Island Escape 5D/4N",
      titleEs: "Escapada a Isla Jeju 5D/4N",
      description: "Nature, beaches and volcanic landscapes of Jeju Island",
      descriptionEs: "Naturaleza, playas y paisajes volcánicos de la Isla Jeju",
      country: "CO" as const,
      daysCount: 5,
      nights: 4,
      priceKRW: 1200000,
      priceUSD: 920,
      imageUrls: [],
      maxGroupSize: 10,
      published: true,
    },
    {
      title: "K-Pop Fan Tour Seoul 4D/3N",
      titleEs: "Tour Fan de K-Pop en Seúl 4D/3N",
      description: "SM Town, HYBE Insight, K-Pop Music Show tickets included",
      descriptionEs: "SM Town, HYBE Insight y entradas a show musical de K-Pop incluidas",
      country: "BR" as const,
      daysCount: 4,
      nights: 3,
      priceKRW: 950000,
      priceUSD: 730,
      imageUrls: [],
      maxGroupSize: 8,
      published: true,
    },
  ];

  for (const pkg of packages) {
    await prisma.travelPackage.upsert({
      where: { id: pkg.titleEs.slice(0, 10).toLowerCase().replace(/ /g, "-") + "-seed" },
      update: {},
      create: { ...pkg, id: pkg.titleEs.slice(0, 10).toLowerCase().replace(/ /g, "-") + "-seed" },
    });
  }
  console.log(`✅ Seeded ${packages.length} travel packages`);

  // ─── Places ───────────────────────────────────────────────────
  const places = [
    {
      name: "Gyeongbokgung Palace",
      nameEs: "Palacio Gyeongbokgung",
      category: "LANDMARK" as const,
      city: "Seoul",
      address: "161 Sajik-ro, Jongno-gu, Seoul",
      lat: 37.5796,
      lng: 126.9770,
      rating: 4.8,
    },
    {
      name: "Myeongdong Street",
      nameEs: "Calle Myeongdong",
      category: "SHOPPING" as const,
      city: "Seoul",
      address: "Myeongdong-gil, Jung-gu, Seoul",
      lat: 37.5635,
      lng: 126.9820,
      rating: 4.5,
    },
    {
      name: "Hongdae Free Market",
      nameEs: "Mercado Libre de Hongdae",
      category: "ENTERTAINMENT" as const,
      city: "Seoul",
      address: "Hongik-ro, Mapo-gu, Seoul",
      lat: 37.5563,
      lng: 126.9226,
      rating: 4.6,
    },
    {
      name: "Insadong Ssamziegil",
      nameEs: "Ssamziegil de Insadong",
      category: "SHOPPING" as const,
      city: "Seoul",
      address: "38 Insadong-gil, Jongno-gu, Seoul",
      lat: 37.5744,
      lng: 126.9856,
      rating: 4.4,
    },
  ];

  for (const place of places) {
    const existing = await prisma.place.findFirst({ where: { name: place.name } });
    if (!existing) {
      await prisma.place.create({ data: place });
    }
  }
  console.log(`✅ Seeded ${places.length} places`);

  // ─── Products ─────────────────────────────────────────────────
  const products = [
    {
      name: "BTS - MOTS: ON Weverse Album",
      nameEs: "BTS - Álbum Coleccionable MOTS: ON",
      description: "Official BTS Weverse Album",
      descriptionEs: "Álbum oficial de BTS con tarjeta photocard incluida",
      category: "KPOP_MERCHANDISE" as const,
      priceKRW: 25000,
      priceUSD: 19.99,
      stock: 50,
      imageUrls: [],
      published: true,
    },
    {
      name: "COSRX Advanced Snail 96 Mucin Power Essence",
      nameEs: "COSRX Esencia de Baba de Caracol 96%",
      description: "COSRX Snail Mucin Essence 100ml",
      descriptionEs: "Esencia facial hidratante con 96% de mucina de caracol, 100ml",
      category: "KBEAUTY" as const,
      priceKRW: 18000,
      priceUSD: 13.90,
      stock: 100,
      imageUrls: [],
      published: true,
    },
    {
      name: "Laneige Lip Sleeping Mask Berry",
      nameEs: "Laneige Mascarilla de Labios Noche - Fresa",
      description: "Laneige Lip Sleeping Mask Berry 20g",
      descriptionEs: "Mascarilla hidratante de labios para usar de noche, sabor fresa, 20g",
      category: "KBEAUTY" as const,
      priceKRW: 22000,
      priceUSD: 16.50,
      stock: 80,
      imageUrls: [],
      published: true,
    },
    {
      name: "Ottogi Cheese Ramyeon",
      nameEs: "Ramyeon de Queso Ottogi",
      description: "Ottogi Cheese Ramyeon x 5 packs",
      descriptionEs: "Pack de 5 ramen instantáneo sabor queso, marca Ottogi",
      category: "FOOD" as const,
      priceKRW: 6500,
      priceUSD: 4.99,
      stock: 200,
      imageUrls: [],
      published: true,
    },
    {
      name: "Hanbok T-Shirt (Unisex)",
      nameEs: "Camiseta Inspirada en Hanbok (Unisex)",
      description: "Modern Hanbok-inspired T-Shirt",
      descriptionEs: "Camiseta unisex con diseño moderno inspirado en el Hanbok tradicional",
      category: "CLOTHING" as const,
      priceKRW: 35000,
      priceUSD: 26.99,
      stock: 30,
      imageUrls: [],
      published: true,
    },
    {
      name: "K-Pop Lightstick Bag Charm",
      nameEs: "Llavero Lightstick K-Pop",
      description: "Mini lightstick bag charm keychain",
      descriptionEs: "Llavero mini lightstick de K-Pop, varios colores disponibles",
      category: "ACCESSORIES" as const,
      priceKRW: 8000,
      priceUSD: 6.50,
      stock: 150,
      imageUrls: [],
      published: true,
    },
  ];

  for (const product of products) {
    const existing = await prisma.product.findFirst({ where: { name: product.name } });
    if (!existing) {
      await prisma.product.create({ data: product });
    }
  }
  console.log(`✅ Seeded ${products.length} products`);

  console.log("🎉 Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
