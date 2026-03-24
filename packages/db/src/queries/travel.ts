import { prisma } from "../index";
import type { Country } from "@prisma/client";

export async function getTravelPackages(country?: Country) {
  return prisma.travelPackage.findMany({
    where: {
      published: true,
      ...(country && { country }),
    },
    orderBy: { priceUSD: "asc" },
    include: {
      _count: { select: { bookings: true } },
    },
  });
}

export async function getTravelPackageById(id: string) {
  return prisma.travelPackage.findUnique({
    where: { id },
    include: {
      days: {
        orderBy: { dayNumber: "asc" },
        include: { places: true },
      },
      _count: { select: { bookings: true } },
    },
  });
}
