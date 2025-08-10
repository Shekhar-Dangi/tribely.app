// Base User type (matches Convex schema)
export type UserType = "individual" | "gym" | "brand";

export interface User {
  _id: string;
  _creationTime: number;
  clerkId: string;
  username: string;
  email: string;
  bio?: string;
  avatarUrl?: string;
  userType: UserType;
  location?: {
    city?: string;
    state?: string;
    country?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  socialLinks?: {
    instagram?: string;
    youtube?: string;
    twitter?: string;
  };
  isPremium: boolean;
  isVerified: boolean;
  followerCount: number;
  followingCount: number;
  onBoardingStatus: boolean;
  createdAt: number;
  updatedAt: number;
}

// Individual Profile type
export interface IndividualProfile {
  _id: string;
  _creationTime: number;
  userId: string;
  stats: {
    height: number;
    weight: number;
    bodyFat?: number;
    personalRecords?: {
      exerciseName: string;
      subtitle: string;
      date: number;
    }[];
  };
  experiences?: {
    title: string;
    subtitle?: string;
    description?: string;
    logoUrl?: string;
    startDate: number;
    endDate?: number;
    isCurrent: boolean;
  }[];
  certifications?: {
    title: string;
    subtitle?: string;
    description?: string;
    logoUrl?: string;
    issueDate: number;
    expiryDate?: number;
    credentialId?: string;
    isActive: boolean;
  }[];
  affiliation?: string;
  isTrainingEnabled: boolean;
  trainingPrice?: number;
  activityScore: number;
  lastActivityUpdate: number;
  createdAt: number;
  updatedAt: number;
}

// Gym Profile type
export interface GymProfile {
  _id: string;
  _creationTime: number;
  userId: string;
  businessInfo: {
    address?: string;
    phone?: string;
    website?: string;
    operatingHours?: {
      monday?: string;
      tuesday?: string;
      wednesday?: string;
      thursday?: string;
      friday?: string;
      saturday?: string;
      sunday?: string;
    };
    amenities?: string[];
  };
  membershipPlans?: {
    name: string;
    price: number;
    duration: string;
    features: string[];
  }[];
  stats?: {
    memberCount: number;
    trainerCount: number;
    equipmentCount?: number;
  };
  verification?: {
    businessLicense?: string;
    taxId?: string;
    isVerified: boolean;
    verificationDate?: number;
  };
  createdAt: number;
  updatedAt: number;
}

// Brand Profile type
export interface BrandProfile {
  _id: string;
  _creationTime: number;
  userId: string;
  businessInfo: {
    companySize?: "1-10" | "11-50" | "51-200" | "201-500" | "501+";
    industry?: string;
    website?: string;
    headquarters?: string;
    contactInfo?: {
      phone?: string;
      email?: string;
      address?: string;
    };
  };
  partnerships?: {
    partnerName: string;
    partnerType: "gym" | "individual" | "brand";
    partnership_type: string;
    startDate: number;
    endDate?: number;
    isActive: boolean;
  }[];
  campaigns?: {
    title: string;
    description?: string;
    targetAudience?: string;
    startDate: number;
    endDate?: number;
    isActive: boolean;
  }[];
  verification?: {
    businessRegistration?: string;
    taxId?: string;
    isVerified: boolean;
    verificationDate?: number;
  };
  createdAt: number;
  updatedAt: number;
}

// Combined User with Profile type
export interface UserWithProfile extends User {
  profile: IndividualProfile | GymProfile | BrandProfile | null;
}

// Post type (updated with new user structure)
export interface Post {
  _id: string;
  _creationTime: number;
  userId: string;
  content?: string;
  mediaUrl?: string;
  mediaPublicId?: string;
  mediaType?: "image" | "video";
  mediaDuration?: number;
  mediaQuality?: string;
  privacy: "public" | "friends" | "private";
  likeCount: number;
  commentCount: number;
  tags?: string[];
  createdAt: number;
  updatedAt: number;
  // Populated user data from query
  user?: {
    username: string;
    avatarUrl?: string;
    isVerified: boolean;
    isPremium: boolean;
    userType: "individual" | "gym" | "brand";
    profile: IndividualProfile | GymProfile | BrandProfile | null;
  } | null;
}

// Helper type guards
export const isIndividualProfile = (
  profile: any
): profile is IndividualProfile => {
  return profile && typeof profile.activityScore === "number";
};

export const isGymProfile = (profile: any): profile is GymProfile => {
  return (
    profile &&
    profile.businessInfo &&
    typeof profile.businessInfo.address !== "undefined"
  );
};

export const isBrandProfile = (profile: any): profile is BrandProfile => {
  return (
    profile &&
    profile.businessInfo &&
    typeof profile.businessInfo.industry !== "undefined"
  );
};

// Type guard for UserWithProfile
export const isUserWithProfile = (user: any): user is UserWithProfile => {
  return (
    user &&
    typeof user.userType === "string" &&
    ["individual", "gym", "brand"].includes(user.userType)
  );
};
