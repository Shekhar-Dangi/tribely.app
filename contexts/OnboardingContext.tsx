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

// Helper functions moved outside component to prevent recreation
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
  // Transform personal stats
  const stats =
    data.personalStats.height && data.personalStats.weight
      ? {
          height: parseFloat(data.personalStats.height),
          weight: parseFloat(data.personalStats.weight),
          bodyFat: data.personalStats.bodyFat
            ? parseFloat(data.personalStats.bodyFat)
            : undefined,
          personalRecords: data.personalStats.personalRecords
            .filter((pr) => hasValidContent(pr))
            .map((pr) => ({
              exerciseName: pr.exerciseName.trim(),
              subtitle: pr.subtitle.trim(),
              date: parseDate(pr.date)!,
            }))
            .filter((pr) => pr.date !== undefined),
        }
      : undefined;

  // Transform experiences
  console.log("Raw experiences data:", data.experiences.experiences);
  const experiences = data.experiences.experiences
    .filter((exp) => {
      const hasContent = hasValidContent(exp);
      console.log("Experience hasContent check:", exp, "result:", hasContent);
      return hasContent;
    })
    .map((exp) => ({
      title: exp.title.trim(),
      subtitle: exp.subtitle.trim() || undefined,
      description: exp.description.trim() || undefined,
      logoUrl: undefined, // Not collected in onboarding
      startDate: parseDate(exp.startDate)!,
      endDate: exp.isCurrent ? undefined : parseDate(exp.endDate),
      isCurrent: exp.isCurrent,
    }))
    .filter((exp) => {
      const hasValidDate = exp.startDate !== undefined;
      console.log(
        "Experience after date parsing:",
        exp,
        "hasValidDate:",
        hasValidDate
      );
      return hasValidDate;
    });

  console.log("Final processed experiences:", experiences);

  // Transform certifications
  console.log("Raw certifications data:", data.certifications.certifications);
  console.log(
    "Number of raw certifications:",
    data.certifications.certifications.length
  );

  const certifications = data.certifications.certifications
    .filter((cert) => {
      const hasContent = hasValidContent(cert);
      console.log(
        "Certification hasContent check:",
        cert,
        "result:",
        hasContent
      );
      return hasContent;
    })
    .map((cert) => {
      console.log("Processing certification:", cert);
      const parsed = {
        title: cert.title.trim(),
        subtitle: cert.subtitle.trim() || undefined,
        description: cert.description.trim() || undefined,
        logoUrl: undefined, // Not collected in onboarding
        issueDate: parseDate(cert.issueDate)!,
        expiryDate: cert.isActive ? undefined : parseDate(cert.expiryDate),
        credentialId: cert.credentialId.trim() || undefined,
        isActive: cert.isActive,
      };
      console.log("Parsed certification:", parsed);
      return parsed;
    })
    .filter((cert) => {
      const hasValidDate = cert.issueDate !== undefined;
      console.log(
        "Certification after date parsing:",
        cert,
        "hasValidDate:",
        hasValidDate
      );
      return hasValidDate;
    });

  console.log("Final processed certifications:", certifications);
  console.log("Final certifications count:", certifications.length);

  return {
    userType: data.category.category || undefined,
    stats: stats && stats.height && stats.weight ? stats : undefined,
    experiences: experiences.length > 0 ? experiences : undefined,
    certifications: certifications.length > 0 ? certifications : undefined,
    socialLinks: undefined, // Not collected in current onboarding flow
    affiliation: undefined, // Not collected in current onboarding flow
  };
};

// Type definitions for each form section
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

export type CategoryType = "individual" | "gym" | "brand" | null;

export interface CategoryForm {
  category: CategoryType;
}

// Complete onboarding data structure
export interface OnboardingData {
  personalStats: PersonalStatsForm;
  category: CategoryForm;
  experiences: ExperiencesForm;
  certifications: CertificationsForm;
}

// Context interface
interface OnboardingContextType {
  data: OnboardingData;
  updatePersonalStats: (data: PersonalStatsForm) => void;
  updateCategory: (data: CategoryForm) => void;
  updateExperiences: (data: ExperiencesForm) => void;
  updateCertifications: (data: CertificationsForm) => void;
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

const defaultOnboardingData: OnboardingData = {
  personalStats: defaultPersonalStats,
  category: defaultCategory,
  experiences: defaultExperiences,
  certifications: defaultCertifications,
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
    const { personalStats, category, experiences, certifications } = data;

    // Check if required fields are filled
    const hasPersonalStats = !!(personalStats.height && personalStats.weight);
    const hasCategory = category.category !== null;

    // Experiences: Can be empty (skip) OR all started experiences must be complete
    const experiencesValid = (() => {
      const nonEmptyExperiences = experiences.experiences.filter(
        (exp) =>
          exp.title ||
          exp.subtitle ||
          exp.description ||
          exp.startDate ||
          exp.endDate ||
          exp.isCurrent
      );

      // If no experiences started, that's valid (skip)
      if (nonEmptyExperiences.length === 0) return true;

      // If any experience started, all must have required fields
      return nonEmptyExperiences.every(
        (exp) =>
          exp.title &&
          exp.subtitle &&
          exp.startDate &&
          (exp.isCurrent || exp.endDate)
      );
    })();

    // Certifications: Can be empty (skip) OR all started certifications must be complete
    const certificationsValid = (() => {
      const nonEmptyCertifications = certifications.certifications.filter(
        (cert) =>
          cert.title ||
          cert.subtitle ||
          cert.description ||
          cert.issueDate ||
          cert.expiryDate ||
          cert.credentialId ||
          cert.isActive
      );

      // If no certifications started, that's valid (skip)
      if (nonEmptyCertifications.length === 0) return true;

      // If any certification started, all must have required fields
      return nonEmptyCertifications.every(
        (cert) =>
          cert.title &&
          cert.subtitle &&
          cert.issueDate &&
          (cert.isActive || cert.expiryDate)
      );
    })();

    return (
      hasPersonalStats && hasCategory && experiencesValid && certificationsValid
    );
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

        // Submit to Convex database
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

  const value = {
    data,
    updatePersonalStats,
    updateCategory,
    updateExperiences,
    updateCertifications,
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
