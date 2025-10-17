export interface BrandContact {
  id: string;
  brandName: string;
  email: string;
  phone: string | null;
  website: string | null;
  productType: string;
  message: string;
  status: BrandContactStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type BrandContactStatus =
  | "PENDING"
  | "REVIEWED"
  | "CONTACTED"
  | "APPROVED"
  | "REJECTED";

// Para el frontend - mapea los estados de Prisma a los que usa tu UI
export type UIBrandStatus = "pending" | "contacted" | "approved" | "rejected";

export interface BrandRequest {
  id: string;
  brandName: string;
  email: string;
  phone: string;
  website: string;
  productType: string;
  message: string;
  date: string;
  status: UIBrandStatus;
}
