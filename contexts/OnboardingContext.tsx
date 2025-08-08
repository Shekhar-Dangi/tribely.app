import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from "react";
import { useMutation } from "convex/react";
import { useAuth } from "@clerk/clerk-expo";
import { api } from "@/convex/_generated/api";

const hasValidContent = (obj: any): boolean => {
  const values = Object.values(obj);
  const result = values.some((value) => {
    if (typeof value === "string") {
      return value.trim() !== "";
    }
    if (typeof value === "boolean") {
      return value === true;
    }
    return false;
  });
  console.log("hasValidContent check for:", obj);
  console.log("Object values:", values);
  console.log("Result:", result);
  return result;
};

const parseDate = (dateStr: string): number | undefined => {
  if (!dateStr || dateStr.trim() === "") return undefined;

  const trimmed = dateStr.trim();
  let date: Date;

  // Handle MM-YYYY format
  if (/^(0[1-9]|1[0-2])-\d{4}$/.test(trimmed)) {
    const [month, year] = trimmed.split("-");
    date = new Date(parseInt(year), parseInt(month) - 1, 1);
  }
  // Handle DD-MM-YYYY format
  else if (/^(0[1-9]|[12]\d|3[01])-(0[1-9]|1[0-2])-\d{4}$/.test(trimmed)) {
    const [day, month, year] = trimmed.split("-");
    date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  } else {
    console.warn("Invalid date format:", dateStr);
    return undefined;
  }

  return date.getTime();
};

const transformDataForConvex = (data: OnboardingData) => {
  const category = data.category.category;

  if (!category) {
    throw new Error("User category is required for onboarding");
  }

  // Base structure that all user types need
  const baseData = {
    userType: category,
    socialLinks: undefined, // Not collected in current onboarding flow
  };

  switch (category) {
    case "individual": {
      // Transform personal stats
      const stats =
        data.personalStats?.height && data.personalStats?.weight
          ? {
              height: parseFloat(data.personalStats.height),
              weight: parseFloat(data.personalStats.weight),
              bodyFat: data.personalStats.bodyFat
                ? parseFloat(data.personalStats.bodyFat)
                : undefined,
              personalRecords: data.personalStats.personalRecords
                .filter((pr: PersonalRecord) => hasValidContent(pr))
                .map((pr: PersonalRecord) => ({
                  exerciseName: pr.exerciseName.trim(),
                  subtitle: pr.subtitle.trim(),
                  date: parseDate(pr.date)!,
                }))
                .filter((pr: any) => pr.date !== undefined),
            }
          : undefined;

      // Transform experiences
      const experiences = data.experiences?.experiences
        ? data.experiences.experiences
            .filter((exp: Experience) => hasValidContent(exp))
            .map((exp: Experience) => ({
              title: exp.title.trim(),
              subtitle: exp.subtitle.trim() || undefined,
              description: exp.description.trim() || undefined,
              logoUrl: undefined,
              startDate: parseDate(exp.startDate)!,
              endDate: exp.isCurrent ? undefined : parseDate(exp.endDate),
              isCurrent: exp.isCurrent,
            }))
            .filter((exp: any) => exp.startDate !== undefined)
        : [];

      // Transform certifications
      const certifications = data.certifications?.certifications
        ? data.certifications.certifications
            .filter((cert: Certification) => hasValidContent(cert))
            .map((cert: Certification) => ({
              title: cert.title.trim(),
              subtitle: cert.subtitle.trim() || undefined,
              description: cert.description.trim() || undefined,
              logoUrl: undefined,
              issueDate: parseDate(cert.issueDate)!,
              expiryDate: cert.isActive
                ? undefined
                : parseDate(cert.expiryDate),
              credentialId: cert.credentialId.trim() || undefined,
              isActive: cert.isActive,
            }))
            .filter((cert: any) => cert.issueDate !== undefined)
        : [];

      return {
        ...baseData,
        stats: stats && stats.height && stats.weight ? stats : undefined,
        experiences: experiences.length > 0 ? experiences : undefined,
        certifications: certifications.length > 0 ? certifications : undefined,
        affiliation: undefined,
        isTrainingEnabled: false,
        trainingPrice: undefined,
      };
    }

    case "gym": {
      // Transform business info
      const businessInfo = data.businessInfo
        ? {
            address: data.businessInfo.address.trim() || undefined,
            phone: data.businessInfo.phone.trim() || undefined,
            website: data.businessInfo.website.trim() || undefined,
            operatingHours: {
              monday:
                data.businessInfo.operatingHours.monday.trim() || undefined,
              tuesday:
                data.businessInfo.operatingHours.tuesday.trim() || undefined,
              wednesday:
                data.businessInfo.operatingHours.wednesday.trim() || undefined,
              thursday:
                data.businessInfo.operatingHours.thursday.trim() || undefined,
              friday:
                data.businessInfo.operatingHours.friday.trim() || undefined,
              saturday:
                data.businessInfo.operatingHours.saturday.trim() || undefined,
              sunday:
                data.businessInfo.operatingHours.sunday.trim() || undefined,
            },
          }
        : undefined;

      // Transform membership plans
      const membershipPlans = data.membershipPlans?.plans
        ? data.membershipPlans.plans
            .filter((plan: MembershipPlan) => hasValidContent(plan))
            .map((plan: MembershipPlan) => ({
              name: plan.name.trim(),
              price: parseFloat(plan.price),
              duration: plan.duration,
              features: plan.features.filter(
                (feature) => feature.trim() !== ""
              ),
            }))
            .filter((plan: any) => plan.name && !isNaN(plan.price))
        : [];

      // Transform stats
      const gymStats = data.gymStats
        ? {
            memberCount: data.gymStats.memberCount
              ? parseInt(data.gymStats.memberCount)
              : 0,
            trainerCount: data.gymStats.trainerCount
              ? parseInt(data.gymStats.trainerCount)
              : 0,
          }
        : undefined;

      return {
        ...baseData,
        businessInfo: businessInfo,
        membershipPlans:
          membershipPlans.length > 0 ? membershipPlans : undefined,
        gymStats: gymStats,
      };
    }

    case "brand": {
      // Transform business info
      const brandBusinessInfo = data.brandBusinessInfo
        ? {
            industry: data.brandBusinessInfo.industry.trim() || undefined,
            website: data.brandBusinessInfo.website.trim() || undefined,
            headquarters:
              data.brandBusinessInfo.headquarters.trim() || undefined,
            contactInfo: {
              phone:
                data.brandBusinessInfo.contactInfo.phone.trim() || undefined,
              email:
                data.brandBusinessInfo.contactInfo.email.trim() || undefined,
              address:
                data.brandBusinessInfo.contactInfo.address.trim() || undefined,
            },
          }
        : undefined;

      // Transform partnerships
      const partnerships = data.partnerships?.partnerships
        ? data.partnerships.partnerships
            .filter((partnership: Partnership) => hasValidContent(partnership))
            .map((partnership: Partnership) => ({
              partnerName: partnership.partnerName.trim(),
              partnerType: partnership.partnerType,
              partnership_type: partnership.partnership_type.trim(),
              startDate: parseDate(partnership.startDate)!,
              endDate: partnership.isActive
                ? undefined
                : parseDate(partnership.endDate),
              isActive: partnership.isActive,
            }))
            .filter((partnership: any) => partnership.startDate !== undefined)
        : [];

      return {
        ...baseData,
        brandBusinessInfo: brandBusinessInfo,
        partnerships: partnerships.length > 0 ? partnerships : undefined,
      };
    }

    default:
      throw new Error(`Unsupported user category: ${category}`);
  }
};

// ============== SHARED INTERFACES ==============
export type CategoryType = "individual" | "gym" | "brand" | null;

export interface CategoryForm {
  category: CategoryType;
}

// ============== INDIVIDUAL USER INTERFACES ==============
export interface PersonalRecord {
  exerciseName: string;
  subtitle: string;
  date: string;
}

export interface PersonalStatsForm {
  height: string;
  weight: string;
  bodyFat: string;
  personalRecords: PersonalRecord[];
}

export interface Experience {
  title: string;
  subtitle: string;
  description: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

export interface ExperiencesForm {
  experiences: Experience[];
}

export interface Certification {
  title: string;
  subtitle: string;
  description: string;
  issueDate: string;
  expiryDate: string;
  credentialId: string;
  isActive: boolean;
}

export interface CertificationsForm {
  certifications: Certification[];
}

// ============== GYM INTERFACES ==============
export interface BusinessInfoForm {
  address: string;
  phone: string;
  website: string;
  operatingHours: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };
}

export interface MembershipPlan {
  name: string;
  price: string;
  duration: string;
  features: string[];
}

export interface MembershipPlansForm {
  plans: MembershipPlan[];
}

export interface GymStatsForm {
  memberCount: string;
  trainerCount: string;
}

// ============== BRAND INTERFACES ==============
export interface BrandBusinessInfoForm {
  industry: string;
  website: string;
  headquarters: string;
  contactInfo: {
    phone: string;
    email: string;
    address: string;
  };
}

export interface Partnership {
  partnerName: string;
  partnerType: "gym" | "individual" | "brand";
  partnership_type: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface PartnershipsForm {
  partnerships: Partnership[];
}

// ============== UNIFIED ONBOARDING DATA ==============
export interface OnboardingData {
  category: CategoryForm;
  // Individual fields - optional for other user types
  personalStats?: PersonalStatsForm;
  experiences?: ExperiencesForm;
  certifications?: CertificationsForm;
  // Gym fields - optional for other user types
  businessInfo?: BusinessInfoForm;
  membershipPlans?: MembershipPlansForm;
  gymStats?: GymStatsForm;
  // Brand fields - optional for other user types
  brandBusinessInfo?: BrandBusinessInfoForm;
  partnerships?: PartnershipsForm;
}

// Context interface - supporting all user types
interface OnboardingContextType {
  data: OnboardingData;
  userType: CategoryType;
  // Individual methods
  updatePersonalStats: (data: PersonalStatsForm) => void;
  updateExperiences: (data: ExperiencesForm) => void;
  updateCertifications: (data: CertificationsForm) => void;
  // Gym methods
  updateBusinessInfo: (data: BusinessInfoForm) => void;
  updateMembershipPlans: (data: MembershipPlansForm) => void;
  updateGymStats: (data: GymStatsForm) => void;
  // Brand methods
  updateBrandBusinessInfo: (data: BrandBusinessInfoForm) => void;
  updatePartnerships: (data: PartnershipsForm) => void;
  // Shared methods
  updateCategory: (data: CategoryForm) => void;
  resetData: () => void;
  isComplete: () => boolean;
  submitToDatabase: (
    overrideCertifications?: CertificationsForm
  ) => Promise<void>;
}

// Default values
const defaultPersonalStats: PersonalStatsForm = {
  height: "",
  weight: "",
  bodyFat: "",
  personalRecords: [{ exerciseName: "", subtitle: "", date: "" }],
};

const defaultCategory: CategoryForm = {
  category: null,
};

const defaultExperiences: ExperiencesForm = {
  experiences: [
    {
      title: "",
      subtitle: "",
      description: "",
      startDate: "",
      endDate: "",
      isCurrent: false,
    },
  ],
};

const defaultCertifications: CertificationsForm = {
  certifications: [
    {
      title: "",
      subtitle: "",
      description: "",
      issueDate: "",
      expiryDate: "",
      credentialId: "",
      isActive: false,
    },
  ],
};

const defaultBusinessInfo: BusinessInfoForm = {
  address: "",
  phone: "",
  website: "",
  operatingHours: {
    monday: "",
    tuesday: "",
    wednesday: "",
    thursday: "",
    friday: "",
    saturday: "",
    sunday: "",
  },
};

const defaultMembershipPlans: MembershipPlansForm = {
  plans: [
    {
      name: "",
      price: "",
      duration: "",
      features: [""],
    },
  ],
};

const defaultGymStats: GymStatsForm = {
  memberCount: "",
  trainerCount: "",
};

const defaultBrandBusinessInfo: BrandBusinessInfoForm = {
  industry: "",
  website: "",
  headquarters: "",
  contactInfo: {
    phone: "",
    email: "",
    address: "",
  },
};

const defaultPartnerships: PartnershipsForm = {
  partnerships: [
    {
      partnerName: "",
      partnerType: "individual",
      partnership_type: "",
      startDate: "",
      endDate: "",
      isActive: false,
    },
  ],
};

const defaultOnboardingData: OnboardingData = {
  category: defaultCategory,
  // Individual fields (optional)
  personalStats: defaultPersonalStats,
  experiences: defaultExperiences,
  certifications: defaultCertifications,
  // Gym fields (optional)
  businessInfo: defaultBusinessInfo,
  membershipPlans: defaultMembershipPlans,
  gymStats: defaultGymStats,
  // Brand fields (optional)
  brandBusinessInfo: defaultBrandBusinessInfo,
  partnerships: defaultPartnerships,
};

// Create context
const OnboardingContext = createContext<OnboardingContextType | undefined>(
  undefined
);

// Provider component
interface OnboardingProviderProps {
  children: ReactNode;
}

export function OnboardingProvider({ children }: OnboardingProviderProps) {
  const [data, setData] = useState<OnboardingData>(defaultOnboardingData);
  const { userId } = useAuth();
  const completeOnboardingMutation = useMutation(api.users.completeOnboarding);

  const updatePersonalStats = useCallback(
    (personalStats: PersonalStatsForm) => {
      setData((prev) => ({ ...prev, personalStats }));
    },
    []
  );

  const updateCategory = useCallback((category: CategoryForm) => {
    setData((prev) => ({ ...prev, category }));
  }, []);

  const updateExperiences = useCallback((experiences: ExperiencesForm) => {
    setData((prev) => ({ ...prev, experiences }));
  }, []);

  const updateCertifications = useCallback(
    (certifications: CertificationsForm) => {
      setData((prev) => ({ ...prev, certifications }));
    },
    []
  );

  const resetData = useCallback(() => {
    setData(defaultOnboardingData);
  }, []);

  const isComplete = useCallback((): boolean => {
    const {
      personalStats,
      category,
      experiences,
      certifications,
      businessInfo,
      membershipPlans,
      gymStats,
      brandBusinessInfo,
      partnerships,
    } = data;

    if (!category.category) return false;

    switch (category.category) {
      case "individual": {
        const hasPersonalStats = !!(
          personalStats?.height && personalStats?.weight
        );

        // Check for non-empty experiences
        const experiencesValid = (() => {
          if (!experiences?.experiences) return true;
          const nonEmptyExperiences = experiences.experiences.filter(
            (exp: Experience) =>
              exp.title ||
              exp.subtitle ||
              exp.description ||
              exp.startDate ||
              exp.endDate ||
              exp.isCurrent
          );

          if (nonEmptyExperiences.length === 0) return true;

          return nonEmptyExperiences.every(
            (exp: Experience) =>
              exp.title &&
              exp.subtitle &&
              exp.startDate &&
              (exp.isCurrent || exp.endDate)
          );
        })();

        // Check for non-empty certifications
        const certificationsValid = (() => {
          if (!certifications?.certifications) return true;
          const nonEmptyCertifications = certifications.certifications.filter(
            (cert: Certification) =>
              cert.title ||
              cert.subtitle ||
              cert.description ||
              cert.issueDate ||
              cert.expiryDate ||
              cert.credentialId ||
              cert.isActive
          );

          if (nonEmptyCertifications.length === 0) return true;

          return nonEmptyCertifications.every(
            (cert: Certification) =>
              cert.title &&
              cert.subtitle &&
              cert.issueDate &&
              (cert.isActive || cert.expiryDate)
          );
        })();

        return hasPersonalStats && experiencesValid && certificationsValid;
      }

      case "gym": {
        const hasBusinessInfo = !!(
          businessInfo?.address ||
          businessInfo?.phone ||
          businessInfo?.website
        );
        const hasMembershipPlans = (membershipPlans?.plans.length || 0) > 0;
        const hasGymStats = !!(gymStats?.memberCount || gymStats?.trainerCount);

        return hasBusinessInfo && hasMembershipPlans && hasGymStats;
      }

      case "brand": {
        const hasBrandBusinessInfo = !!(
          brandBusinessInfo?.industry ||
          brandBusinessInfo?.website ||
          brandBusinessInfo?.headquarters
        );
        const hasPartnerships = (partnerships?.partnerships.length || 0) > 0;

        return hasBrandBusinessInfo && hasPartnerships;
      }

      default:
        return false;
    }
  }, [data]);

  const submitToDatabase = useCallback(
    async (overrideCertifications?: CertificationsForm): Promise<void> => {
      try {
        if (!userId) {
          throw new Error("User not authenticated");
        }

        // Use override certifications if provided, otherwise use context data
        const dataToSubmit = overrideCertifications
          ? { ...data, certifications: overrideCertifications }
          : data;

        console.log(
          "Submitting complete onboarding data to database:",
          dataToSubmit
        );

        // Transform and filter data for Convex
        const transformedData = transformDataForConvex(dataToSubmit);
        console.log("Transformed data for Convex:", transformedData);

        // Submit to Convex database using completeOnboarding mutation
        const result = await completeOnboardingMutation({
          clerkId: userId,
          ...transformedData,
        });

        console.log("Onboarding data submitted successfully:", result);

        // Reset the form data after successful submission
        resetData();
      } catch (error) {
        console.error("Failed to submit onboarding data:", error);
        throw error;
      }
    },
    [userId, data, completeOnboardingMutation, resetData]
  );

  // Gym-specific update functions
  const updateBusinessInfo = useCallback((businessInfo: BusinessInfoForm) => {
    setData((prev) => ({ ...prev, businessInfo }));
  }, []);

  const updateMembershipPlans = useCallback(
    (membershipPlans: MembershipPlansForm) => {
      setData((prev) => ({ ...prev, membershipPlans }));
    },
    []
  );

  const updateGymStats = useCallback((gymStats: GymStatsForm) => {
    setData((prev) => ({ ...prev, gymStats }));
  }, []);

  // Brand-specific update functions
  const updateBrandBusinessInfo = useCallback(
    (brandBusinessInfo: BrandBusinessInfoForm) => {
      setData((prev) => ({ ...prev, brandBusinessInfo }));
    },
    []
  );

  const updatePartnerships = useCallback((partnerships: PartnershipsForm) => {
    setData((prev) => ({ ...prev, partnerships }));
  }, []);

  const value = {
    data,
    userType: data.category.category,
    updatePersonalStats,
    updateCategory,
    updateExperiences,
    updateCertifications,
    updateBusinessInfo,
    updateMembershipPlans,
    updateGymStats,
    updateBrandBusinessInfo,
    updatePartnerships,
    resetData,
    isComplete,
    submitToDatabase,
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

// Custom hook to use the context
export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error("useOnboarding must be used within an OnboardingProvider");
  }
  return context;
}
