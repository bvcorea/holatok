import { prisma } from "../index";
import type { ProductCategory, Country, Prisma } from "@prisma/client";

const ITEMS_PER_PAGE = 12;

export async function getProducts(params: {
  category?: ProductCategory;
  page?: number;
  search?: string;
} = {}) {
  const { category, page = 1, search } = params;
  const skip = (page - 1) * ITEMS_PER_PAGE;

  const where: Prisma.ProductWhereInput = {
    published: true,
    ...(category && { category }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { nameEs: { contains: search, mode: "insensitive" } },
      ],
    }),
  };

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: ITEMS_PER_PAGE,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    totalPages: Math.ceil(total / ITEMS_PER_PAGE),
    hasNext: page * ITEMS_PER_PAGE < total,
  };
}

export async function getProductById(id: string) {
  return prisma.product.findUnique({ where: { id } });
}

export async function createOrder(data: {
  userId: string;
  country: Country;
  localCurrency: string;
  localAmount: number;
  usdAmount: number;
  exchangeRate: number;
  shippingAddress: Record<string, string>;
  items: Array<{ productId: string; quantity: number; priceKRW: number; priceUSD: number }>;
}) {
  const { items, ...orderData } = data;

  return prisma.order.create({
    data: {
      ...orderData,
      localAmount: orderData.localAmount,
      usdAmount: orderData.usdAmount,
      exchangeRate: orderData.exchangeRate,
      items: {
        create: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          priceKRW: item.priceKRW,
          priceUSD: item.priceUSD,
        })),
      },
    },
    include: { items: true },
  });
}

export async function createPaymentRecord(data: {
  orderId: string;
  provider: "STRIPE" | "STRIPE_PIX" | "STRIPE_OXXO" | "MERCADOPAGO";
  externalId: string;
  amount: number;
  currency: string;
}) {
  return prisma.payment.create({
    data: {
      orderId: data.orderId,
      provider: data.provider,
      status: "PENDING",
      externalId: data.externalId,
      amount: data.amount,
      currency: data.currency,
    },
  });
}

export async function updatePaymentStatus(
  externalId: string,
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "REFUNDED"
) {
  return prisma.payment.updateMany({
    where: { externalId },
    data: { status },
  });
}
