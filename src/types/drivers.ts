export type DocumentStatus = 'pending' | 'approved' | 'rejected';

export interface DriverDocument {
  id: string;
  driverId: string;
  type: string;
  fileUrl: string;
  status: DocumentStatus;
  createdAt: string;
  updatedAt: string;
}

export type DriverApprovalStatus =
  | "pending"
  | "under_review"
  | "approved"
  | "rejected";
export type DriverStatus = "online" | "offline" | "busy" | "suspended";

export interface Vehicle {
  make: string;
  model: string;
  year: number;
  plateNumber: string;
  type: string;
  color?: string;
  capacity?: number;
}

export interface Driver {
  id: string;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  onlineStatus: DriverStatus;
  approvalStatus: DriverApprovalStatus;
  phoneNumber?: string;
  photoUrl?: string;
  fcmToken?: string;
  vehicle?: Vehicle;
  averageRating: number;
  totalRatings: number;
  totalDeliveries: number;
  totalEarnings: number;
  stripeConnectedAccountId?: string;
  rejectionReason?: string;
  approvedAt?: string;
  approvedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DriverListParams {
  page?: number;
  limit?: number;
  approvalStatus?: DriverApprovalStatus;
  depotId?: string;
}

export interface RejectDriverRequest {
  reason?: string;
}
