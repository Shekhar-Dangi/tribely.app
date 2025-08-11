import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "convex/react";
import * as ImagePicker from "expo-image-picker";

import { api } from "@/convex/_generated/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useCloudinaryUpload } from "@/hooks/useCloudinaryUpload";
import { COLORS } from "@/constants/theme";
import { profile, union, onboard, editProfile } from "@/constants/styles";
import { AppHeader } from "@/components/common";
import { Id } from "@/convex/_generated/dataModel";

// Individual Profile Components
import PersonalStatsEditor from "@/components/editProfile/PersonalStatsEditor";
import ExperienceEditor from "@/components/editProfile/ExperienceEditor";
import TrainingSettings from "@/components/editProfile/TrainingSettings";
import CertificationsEditor from "@/components/editProfile/CertificationsEditor";

// Gym Profile Components
import BusinessInfoEditor from "@/components/editProfile/gym/BusinessInfoEditor";
import OperatingHoursEditor from "@/components/editProfile/gym/OperatingHoursEditor";
import AmenitiesEditor from "@/components/editProfile/gym/AmenitiesEditor";
import MembershipPlansEditor from "@/components/editProfile/gym/MembershipPlansEditor";
import GymStatsEditor from "@/components/editProfile/gym/GymStatsEditor";
import VerificationEditor from "@/components/editProfile/gym/VerificationEditor";

// Brand Profile Components
import BrandBusinessInfoEditor from "@/components/editProfile/brand/BrandBusinessInfoEditor";
import PartnershipsEditor from "@/components/editProfile/brand/PartnershipsEditor";
import CampaignsEditor from "@/components/editProfile/brand/CampaignsEditor";
import BrandVerificationEditor from "@/components/editProfile/brand/BrandVerificationEditor";

// Location Selector Component
import LocationSelector from "@/components/LocationSelector";

interface EditProfileForm {
  bio: string;
  socialLinks: {
    instagram: string;
    youtube: string;
    twitter: string;
  };
  location: {
    city: string;
    state: string;
    country: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  // Individual-specific fields
  personalStats?: {
    height: string;
    weight: string;
    bodyFat: string;
    personalRecords: {
      exercise: string;
      weight: string;
      reps: string;
      date: string;
    }[];
  };
  experience?: {
    title: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    isCurrent: boolean;
    description: string;
  }[];
  trainingSettings?: {
    offerTraining: boolean;
    hourlyRate: string;
    affiliation: string;
    specialties: string;
  };
  certifications?: {
    title: string;
    subtitle: string;
    description: string;
    logoUrl: string;
    issueDate: string;
    expiryDate: string;
    credentialId: string;
    isActive: boolean;
  }[];
  // Gym-specific fields
  businessInfo?: {
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
    amenities: string[];
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

  // Brand-specific fields
  brandBusinessInfo?: {
    industry: string;
    website: string;
    headquarters: string;
    contactInfo: {
      phone: string;
      email: string;
      address: string;
    };
  };
  brandPartnerships?: {
    partnerName: string;
    partnerType: "individual" | "gym" | "brand";
    partnership_type: string;
    startDate: string;
    endDate?: string;
    isActive: boolean;
  }[];
  brandCampaigns?: {
    title: string;
    description?: string;
    targetAudience?: string;
    startDate: string;
    endDate?: string;
    isActive: boolean;
  }[];
}

export default function EditProfile() {
  const router = useRouter();
  const userData = useCurrentUser();
  const [isAvatarUploading, setIsAvatarUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const updateUser = useMutation(api.users.updateUser);
  const updateUserLocation = useMutation(api.users.updateUserLocation);
  const updateIndividualProfile = useMutation(
    api.individuals.updateIndividualProfile
  );
  const updateGymProfile = useMutation(api.gyms.updateGymProfile);
  const updateBrandProfile = useMutation(api.brands.updateBrandProfile);
  const { uploadImage } = useCloudinaryUpload();

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isDirty },
  } = useForm<EditProfileForm>({
    defaultValues: {
      bio: userData?.bio || "",
      socialLinks: {
        instagram: userData?.socialLinks?.instagram || "",
        youtube: userData?.socialLinks?.youtube || "",
        twitter: userData?.socialLinks?.twitter || "",
      },
      location: {
        city: userData?.location?.city || "",
        state: userData?.location?.state || "",
        country: userData?.location?.country || "",
        coordinates: userData?.location?.coordinates
          ? {
              latitude: userData.location.coordinates.latitude,
              longitude: userData.location.coordinates.longitude,
            }
          : undefined,
      },
      // Individual-specific defaults
      ...(userData?.userType === "individual" && {
        personalStats: {
          height: (userData?.profile as any)?.stats?.height?.toString() || "",
          weight: (userData?.profile as any)?.stats?.weight?.toString() || "",
          bodyFat: (userData?.profile as any)?.stats?.bodyFat?.toString() || "",
          personalRecords:
            (userData?.profile as any)?.stats?.personalRecords?.map(
              (pr: any) => ({
                exercise: pr.exerciseName || "",
                weight: pr.subtitle || "",
                reps: "",
                date: new Date(pr.date).toISOString().split("T")[0] || "",
              })
            ) || [],
        },
        experience:
          (userData?.profile as any)?.experiences?.map((exp: any) => ({
            title: exp.title || "",
            company: exp.subtitle || "",
            location: exp.description || "",
            startDate:
              new Date(exp.startDate).toISOString().split("T")[0] || "",
            endDate: exp.endDate
              ? new Date(exp.endDate).toISOString().split("T")[0]
              : "",
            isCurrent: exp.isCurrent || false,
            description: exp.description || "",
          })) || [],
        trainingSettings: {
          offerTraining: (userData?.profile as any)?.isTrainingEnabled || false,
          hourlyRate:
            (userData?.profile as any)?.trainingPrice?.toString() || "",
          affiliation: (userData?.profile as any)?.affiliation || "",
          specialties: "",
        },
        certifications:
          (userData?.profile as any)?.certifications?.map((cert: any) => ({
            title: cert.title || "",
            subtitle: cert.subtitle || "",
            description: cert.description || "",
            logoUrl: cert.logoUrl || "",
            issueDate:
              new Date(cert.issueDate).toISOString().split("T")[0] || "",
            expiryDate: cert.expiryDate
              ? new Date(cert.expiryDate).toISOString().split("T")[0]
              : "",
            credentialId: cert.credentialId || "",
            isActive: cert.isActive || true,
          })) || [],
      }),
      // Gym-specific defaults
      ...(userData?.userType === "gym" && {
        businessInfo: {
          address: (userData?.profile as any)?.businessInfo?.address || "",
          phone: (userData?.profile as any)?.businessInfo?.phone || "",
          website: (userData?.profile as any)?.businessInfo?.website || "",
          operatingHours: {
            monday:
              (userData?.profile as any)?.businessInfo?.operatingHours
                ?.monday || "",
            tuesday:
              (userData?.profile as any)?.businessInfo?.operatingHours
                ?.tuesday || "",
            wednesday:
              (userData?.profile as any)?.businessInfo?.operatingHours
                ?.wednesday || "",
            thursday:
              (userData?.profile as any)?.businessInfo?.operatingHours
                ?.thursday || "",
            friday:
              (userData?.profile as any)?.businessInfo?.operatingHours
                ?.friday || "",
            saturday:
              (userData?.profile as any)?.businessInfo?.operatingHours
                ?.saturday || "",
            sunday:
              (userData?.profile as any)?.businessInfo?.operatingHours
                ?.sunday || "",
          },
          amenities: (userData?.profile as any)?.businessInfo?.amenities || [
            "",
          ],
        },
        membershipPlans: (userData?.profile as any)?.membershipPlans?.map(
          (plan: any) => ({
            name: plan.name || "",
            price: plan.price || 0,
            duration: plan.duration || "",
            features: plan.features || [""],
          })
        ) || [
          {
            name: "",
            price: 0,
            duration: "",
            features: [""],
          },
        ],
        stats: {
          memberCount: (userData?.profile as any)?.stats?.memberCount || 0,
          trainerCount: (userData?.profile as any)?.stats?.trainerCount || 0,
          equipmentCount:
            (userData?.profile as any)?.stats?.equipmentCount || undefined,
        },
      }),
      // Brand-specific defaults
      ...(userData?.userType === "brand" && {
        brandBusinessInfo: {
          industry: (userData?.profile as any)?.businessInfo?.industry || "",
          website: (userData?.profile as any)?.businessInfo?.website || "",
          headquarters:
            (userData?.profile as any)?.businessInfo?.headquarters || "",
          contactInfo: {
            phone:
              (userData?.profile as any)?.businessInfo?.contactInfo?.phone ||
              "",
            email:
              (userData?.profile as any)?.businessInfo?.contactInfo?.email ||
              "",
            address:
              (userData?.profile as any)?.businessInfo?.contactInfo?.address ||
              "",
          },
        },
        brandPartnerships: (userData?.profile as any)?.partnerships?.map(
          (partnership: any) => ({
            partnerName: partnership.partnerName || "",
            partnerType: partnership.partnerType || "individual",
            partnership_type: partnership.partnership_type || "",
            startDate:
              new Date(partnership.startDate).toISOString().split("T")[0] || "",
            endDate: partnership.endDate
              ? new Date(partnership.endDate).toISOString().split("T")[0]
              : "",
            isActive: partnership.isActive || true,
          })
        ) || [
          {
            partnerName: "",
            partnerType: "individual" as const,
            partnership_type: "",
            startDate: "",
            endDate: "",
            isActive: true,
          },
        ],
        brandCampaigns: (userData?.profile as any)?.campaigns?.map(
          (campaign: any) => ({
            title: campaign.title || "",
            description: campaign.description || "",
            targetAudience: campaign.targetAudience || "",
            startDate:
              new Date(campaign.startDate).toISOString().split("T")[0] || "",
            endDate: campaign.endDate
              ? new Date(campaign.endDate).toISOString().split("T")[0]
              : "",
            isActive: campaign.isActive || true,
          })
        ) || [
          {
            title: "",
            description: "",
            targetAudience: "",
            startDate: "",
            endDate: "",
            isActive: true,
          },
        ],
      }),
    },
  });

  const [currentAvatar, setCurrentAvatar] = useState(
    userData?.avatarUrl || null
  );

  // Check if there are any changes (form changes or avatar changes)
  const hasAnyChanges = isDirty || currentAvatar !== userData?.avatarUrl;

  // Debug form state changes
  useEffect(() => {
    console.log("=== FORM STATE DEBUG ===");
    console.log("isDirty:", isDirty);
    console.log("hasAnyChanges:", hasAnyChanges);
    console.log(
      "currentAvatar !== userData?.avatarUrl:",
      currentAvatar !== userData?.avatarUrl
    );
  }, [isDirty, hasAnyChanges, currentAvatar, userData?.avatarUrl]);

  const handleGoBack = () => {
    if (hasAnyChanges) {
      Alert.alert(
        "Unsaved Changes",
        "You have unsaved changes. Are you sure you want to go back?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Discard",
            style: "destructive",
            onPress: () => router.back(),
          },
        ]
      );
    } else {
      router.back();
    }
  };

  const handleAvatarPress = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert(
        "Permission Required",
        "Please allow access to your photo library to change your avatar."
      );
      return;
    }

    Alert.alert(
      "Change Avatar",
      "How would you like to update your profile picture?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Photo Library", onPress: () => pickImage("library") },
        { text: "Camera", onPress: () => pickImage("camera") },
      ]
    );
  };

  const pickImage = async (source: "library" | "camera") => {
    try {
      const options: ImagePicker.ImagePickerOptions = {
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      };

      const result =
        source === "camera"
          ? await ImagePicker.launchCameraAsync(options)
          : await ImagePicker.launchImageLibraryAsync(options);

      if (!result.canceled && result.assets[0]) {
        setIsAvatarUploading(true);
        const uploadResult = await uploadImage(result.assets[0].uri);

        if (uploadResult.success && uploadResult.imageUrl) {
          setCurrentAvatar(uploadResult.imageUrl);
        } else {
          Alert.alert(
            "Upload Failed",
            uploadResult.error || "Failed to upload image"
          );
        }
        setIsAvatarUploading(false);
      }
    } catch {
      setIsAvatarUploading(false);
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const onSubmit = async (formData: EditProfileForm) => {
    console.log(userData);
    if (!userData?._id) return;

    console.log("=== SAVE DEBUG START ===");
    console.log("User Type:", userData.userType);
    console.log("Form Data:", formData);

    setIsSaving(true);

    try {
      // Update basic user info
      const updates: any = {
        userId: userData._id as Id<"users">,
      };

      // Add bio if changed
      if (formData.bio !== userData.bio) {
        updates.bio = formData.bio || undefined;
      }

      // Add avatar if changed
      if (currentAvatar !== userData.avatarUrl) {
        updates.avatarUrl = currentAvatar || undefined;
      }

      // Add social links if changed
      const currentSocialLinks = userData.socialLinks || {};
      const newSocialLinks = formData.socialLinks;
      const socialLinksChanged =
        newSocialLinks.instagram !== (currentSocialLinks.instagram || "") ||
        newSocialLinks.youtube !== (currentSocialLinks.youtube || "") ||
        newSocialLinks.twitter !== (currentSocialLinks.twitter || "");

      if (socialLinksChanged) {
        updates.socialLinks = {
          instagram: newSocialLinks.instagram || undefined,
          youtube: newSocialLinks.youtube || undefined,
          twitter: newSocialLinks.twitter || undefined,
        };
      }

      // Update user info if there are changes
      if (Object.keys(updates).length > 1) {
        // More than just userId
        await updateUser(updates);
      }

      // Update location if changed
      const currentLocation = userData.location || {};
      const newLocation = formData.location;
      const locationChanged =
        newLocation.city !== (currentLocation.city || "") ||
        newLocation.state !== (currentLocation.state || "") ||
        newLocation.country !== (currentLocation.country || "") ||
        newLocation.coordinates?.latitude !==
          currentLocation.coordinates?.latitude ||
        newLocation.coordinates?.longitude !==
          currentLocation.coordinates?.longitude;

      if (locationChanged) {
        await updateUserLocation({
          userId: userData._id as Id<"users">,
          location: {
            city: newLocation.city || undefined,
            state: newLocation.state || undefined,
            country: newLocation.country || undefined,
            ...(newLocation.coordinates && {
              coordinates: {
                latitude: newLocation.coordinates.latitude,
                longitude: newLocation.coordinates.longitude,
              },
            }),
          },
        });
      }

      // Update individual-specific fields if user is an individual
      if (userData.userType === "individual") {
        const individualUpdates: any = {};

        // Check for personalStats changes
        if (formData.personalStats) {
          const currentStats = (userData.profile as any)?.stats || {};
          const newStats = formData.personalStats;

          const statsChanged =
            newStats.height !== (currentStats.height?.toString() || "") ||
            newStats.weight !== (currentStats.weight?.toString() || "") ||
            newStats.bodyFat !== (currentStats.bodyFat?.toString() || "") ||
            JSON.stringify(newStats.personalRecords || []) !==
              JSON.stringify(currentStats.personalRecords || []);

          if (statsChanged) {
            // Build stats object - preserve existing values if new ones are empty
            const statsUpdate: any = {};

            // Handle height
            if (newStats.height && newStats.height.trim() !== "") {
              statsUpdate.height = parseFloat(newStats.height);
            } else if (currentStats.height) {
              statsUpdate.height = currentStats.height;
            }

            // Handle weight
            if (newStats.weight && newStats.weight.trim() !== "") {
              statsUpdate.weight = parseFloat(newStats.weight);
            } else if (currentStats.weight) {
              statsUpdate.weight = currentStats.weight;
            }

            // Handle body fat (optional)
            if (newStats.bodyFat && newStats.bodyFat.trim() !== "") {
              statsUpdate.bodyFat = parseFloat(newStats.bodyFat);
            } else if (currentStats.bodyFat) {
              statsUpdate.bodyFat = currentStats.bodyFat;
            }

            // Handle personal records
            statsUpdate.personalRecords =
              newStats.personalRecords?.map((pr: any) => ({
                exerciseName: pr.exercise || "",
                subtitle: pr.weight || "",
                date: pr.date ? new Date(pr.date).getTime() : Date.now(),
              })) ||
              currentStats.personalRecords ||
              [];

            // Only update if we have at least height and weight
            if (statsUpdate.height && statsUpdate.weight) {
              individualUpdates.stats = statsUpdate;
            }
          }
        }

        // Check for experience changes
        if (formData.experience) {
          const currentExp = (userData.profile as any)?.experiences || [];
          const newExperiences = formData.experience.map((exp: any) => ({
            title: exp.title,
            subtitle: exp.company,
            description: exp.description,
            startDate: new Date(exp.startDate).getTime(),
            endDate:
              exp.endDate && exp.endDate !== ""
                ? new Date(exp.endDate).getTime()
                : undefined,
            isCurrent: exp.isCurrent,
          }));

          if (JSON.stringify(newExperiences) !== JSON.stringify(currentExp)) {
            individualUpdates.experiences = newExperiences;
          }
        }

        // Check for certifications changes
        if (formData.certifications) {
          const currentCerts = (userData.profile as any)?.certifications || [];
          const newCertifications = formData.certifications.map(
            (cert: any) => ({
              title: cert.title,
              subtitle: cert.subtitle,
              description: cert.description,
              logoUrl: cert.logoUrl,
              issueDate: new Date(cert.issueDate).getTime(),
              expiryDate:
                cert.expiryDate && cert.expiryDate !== ""
                  ? new Date(cert.expiryDate).getTime()
                  : undefined,
              credentialId: cert.credentialId,
              isActive: cert.isActive,
            })
          );

          if (
            JSON.stringify(newCertifications) !== JSON.stringify(currentCerts)
          ) {
            individualUpdates.certifications = newCertifications;
          }
        }

        // Check for training settings changes
        if (formData.trainingSettings) {
          const currentSettings = (userData.profile as any) || {};
          const newSettings = formData.trainingSettings;

          const settingsChanged =
            newSettings.offerTraining !==
              (currentSettings.isTrainingEnabled || false) ||
            newSettings.hourlyRate !==
              (currentSettings.trainingPrice?.toString() || "") ||
            newSettings.affiliation !== (currentSettings.affiliation || "");

          if (settingsChanged) {
            individualUpdates.isTrainingEnabled = newSettings.offerTraining;
            if (
              newSettings.hourlyRate &&
              newSettings.hourlyRate.trim() !== ""
            ) {
              individualUpdates.trainingPrice = parseFloat(
                newSettings.hourlyRate
              );
            }
            if (
              newSettings.affiliation &&
              newSettings.affiliation.trim() !== ""
            ) {
              individualUpdates.affiliation = newSettings.affiliation;
            }
          }
        }

        // Update individual-specific fields if there are changes
        if (Object.keys(individualUpdates).length > 0) {
          await updateIndividualProfile({
            userId: userData._id as Id<"users">,
            ...individualUpdates,
          });
        }
      } else if (userData.userType === "gym") {
        // Handle gym-specific profile updates
        const gymUpdates: any = {};

        // Check for business info changes
        if (formData.businessInfo) {
          const currentBusinessInfo =
            (userData.profile as any)?.businessInfo || {};
          const newBusinessInfo = {
            address: formData.businessInfo.address,
            phone: formData.businessInfo.phone,
            website: formData.businessInfo.website,
            operatingHours: formData.businessInfo.operatingHours,
            amenities: formData.businessInfo.amenities.filter(
              (amenity) => amenity && amenity.trim() !== ""
            ),
          };

          if (
            JSON.stringify(newBusinessInfo) !==
            JSON.stringify(currentBusinessInfo)
          ) {
            gymUpdates.businessInfo = newBusinessInfo;
          }
        }

        // Check for membership plans changes
        if (formData.membershipPlans) {
          const currentPlans = (userData.profile as any)?.membershipPlans || [];
          const newPlans = formData.membershipPlans
            .filter((plan) => plan.name && plan.name.trim() !== "")
            .map((plan: any) => ({
              name: plan.name,
              price: plan.price,
              duration: plan.duration,
              features: plan.features.filter(
                (feature: string) => feature && feature.trim() !== ""
              ),
            }));

          if (JSON.stringify(newPlans) !== JSON.stringify(currentPlans)) {
            gymUpdates.membershipPlans = newPlans;
          }
        }

        // Check for stats changes
        if (formData.stats) {
          const currentStats = (userData.profile as any)?.stats || {};
          const newStats = {
            memberCount: formData.stats.memberCount,
            trainerCount: formData.stats.trainerCount,
            ...(formData.stats.equipmentCount !== undefined && {
              equipmentCount: formData.stats.equipmentCount,
            }),
          };

          if (JSON.stringify(newStats) !== JSON.stringify(currentStats)) {
            gymUpdates.stats = newStats;
          }
        }

        // Update gym-specific fields if there are changes
        if (Object.keys(gymUpdates).length > 0) {
          await updateGymProfile({
            userId: userData._id as Id<"users">,
            ...gymUpdates,
          });
        }
      } else if (userData.userType === "brand") {
        console.log("=== BRAND PROFILE UPDATE START ===");
        console.log("Current Profile:", userData.profile);
        console.log("Brand Business Info:", formData.brandBusinessInfo);
        console.log("Brand Partnerships:", formData.brandPartnerships);
        console.log("Brand Campaigns:", formData.brandCampaigns);

        // Handle brand-specific profile updates
        const brandUpdates: any = {};

        // Check for business info changes
        if (formData.brandBusinessInfo) {
          console.log("Processing business info...");
          const currentBusinessInfo =
            (userData.profile as any)?.businessInfo || {};
          const newBusinessInfo = {
            industry: formData.brandBusinessInfo.industry,
            website: formData.brandBusinessInfo.website,
            headquarters: formData.brandBusinessInfo.headquarters,
            contactInfo: {
              phone: formData.brandBusinessInfo.contactInfo.phone,
              email: formData.brandBusinessInfo.contactInfo.email,
              address: formData.brandBusinessInfo.contactInfo.address,
            },
          };

          console.log("Current Business Info:", currentBusinessInfo);
          console.log("New Business Info:", newBusinessInfo);

          if (
            JSON.stringify(newBusinessInfo) !==
            JSON.stringify(currentBusinessInfo)
          ) {
            console.log("Business info changed - adding to updates");
            brandUpdates.businessInfo = newBusinessInfo;
          } else {
            console.log("Business info unchanged");
          }
        } else {
          console.log("No brand business info in form data");
        }

        // Check for partnerships changes
        if (formData.brandPartnerships) {
          console.log("Processing partnerships...");
          const currentPartnerships =
            (userData.profile as any)?.partnerships || [];
          const newPartnerships = formData.brandPartnerships
            .filter(
              (partnership: any) =>
                partnership.partnerName && partnership.partnerName.trim() !== ""
            )
            .map((partnership: any) => ({
              partnerName: partnership.partnerName,
              partnerType: partnership.partnerType,
              partnership_type: partnership.partnership_type,
              startDate: new Date(partnership.startDate).getTime(),
              endDate:
                partnership.endDate && partnership.endDate.trim() !== ""
                  ? new Date(partnership.endDate).getTime()
                  : undefined,
              isActive: partnership.isActive,
            }));

          console.log("Current Partnerships:", currentPartnerships);
          console.log("New Partnerships:", newPartnerships);

          if (
            JSON.stringify(newPartnerships) !==
            JSON.stringify(currentPartnerships)
          ) {
            console.log("Partnerships changed - adding to updates");
            brandUpdates.partnerships = newPartnerships;
          } else {
            console.log("Partnerships unchanged");
          }
        } else {
          console.log("No brand partnerships in form data");
        }

        // Check for campaigns changes
        if (formData.brandCampaigns) {
          console.log("Processing campaigns...");
          const currentCampaigns = (userData.profile as any)?.campaigns || [];
          const newCampaigns = formData.brandCampaigns
            .filter(
              (campaign: any) => campaign.title && campaign.title.trim() !== ""
            )
            .map((campaign: any) => ({
              title: campaign.title,
              description: campaign.description,
              targetAudience: campaign.targetAudience,
              startDate: new Date(campaign.startDate).getTime(),
              endDate:
                campaign.endDate && campaign.endDate.trim() !== ""
                  ? new Date(campaign.endDate).getTime()
                  : undefined,
              isActive: campaign.isActive,
            }));

          console.log("Current Campaigns:", currentCampaigns);
          console.log("New Campaigns:", newCampaigns);

          if (
            JSON.stringify(newCampaigns) !== JSON.stringify(currentCampaigns)
          ) {
            console.log("Campaigns changed - adding to updates");
            brandUpdates.campaigns = newCampaigns;
          } else {
            console.log("Campaigns unchanged");
          }
        } else {
          console.log("No brand campaigns in form data");
        }

        console.log("=== FINAL BRAND UPDATES ===");
        console.log("Brand Updates Object:", brandUpdates);
        console.log("Updates Count:", Object.keys(brandUpdates).length);

        // Update brand-specific fields if there are changes
        if (Object.keys(brandUpdates).length > 0) {
          console.log("Calling updateBrandProfile mutation...");
          await updateBrandProfile({
            userId: userData._id as Id<"users">,
            ...brandUpdates,
          });
          console.log("updateBrandProfile completed successfully");
        } else {
          console.log("No brand updates to save");
        }
      }

      console.log("=== SAVE PROCESS COMPLETED SUCCESSFULLY ===");
      Alert.alert("Success", "Profile updated successfully!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error("=== SAVE ERROR ===");
      console.error("Error details:", error);
      console.error("User type:", userData?.userType);
      Alert.alert("Error", "Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!userData) {
    return (
      <SafeAreaView style={profile.container}>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color={COLORS.secondary} />
          <Text style={profile.contentPlaceholder}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Save button component for header
  const SaveButton = () => (
    <TouchableOpacity
      onPress={handleSubmit(onSubmit, (errors) => {
        console.log(errors);
      })}
      disabled={isSaving || !hasAnyChanges}
      style={[
        editProfile.iconButton,
        (!hasAnyChanges || isSaving) && editProfile.saveButtonDisabled,
      ]}
      activeOpacity={0.6}
    >
      {isSaving ? (
        <ActivityIndicator size="small" color={COLORS.text} />
      ) : (
        <Text
          style={[
            editProfile.saveButtonText,
            (!hasAnyChanges || isSaving) && editProfile.saveButtonTextDisabled,
          ]}
        >
          Save
        </Text>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={profile.container}>
      <AppHeader
        title="Edit Profile"
        showBackButton={true}
        onBackPress={handleGoBack}
        rightComponent={<SaveButton />}
      />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Avatar Section */}
        <View style={onboard.wideCard}>
          <Text style={onboard.cardTitle}>Profile Picture</Text>
          <View style={editProfile.avatarSection}>
            <TouchableOpacity
              onPress={handleAvatarPress}
              style={editProfile.avatarContainer}
              disabled={isAvatarUploading}
            >
              {isAvatarUploading ? (
                <View
                  style={[
                    profile.avatarPlaceholder,
                    { width: 120, height: 120 },
                  ]}
                >
                  <ActivityIndicator size="large" color={COLORS.secondary} />
                </View>
              ) : currentAvatar ? (
                <Image
                  source={{ uri: currentAvatar }}
                  style={editProfile.avatar}
                />
              ) : (
                <View
                  style={[
                    profile.avatarPlaceholder,
                    { width: 120, height: 120 },
                  ]}
                >
                  <Ionicons
                    name="person"
                    size={48}
                    color={COLORS.textSecondary}
                  />
                </View>
              )}
              <View style={editProfile.avatarOverlay}>
                <Ionicons name="camera" size={20} color={COLORS.white} />
              </View>
            </TouchableOpacity>
            <Text style={editProfile.avatarHint}>
              Tap to change your profile picture
            </Text>
          </View>
        </View>

        {/* Basic Information */}
        <View style={onboard.wideCard}>
          <Text style={onboard.cardTitle}>Basic Information</Text>

          {/* Username (Read-only) */}
          <View style={union.textInputContainer}>
            <Text style={union.textInputLabel}>Username</Text>
            <View style={[union.textInput, editProfile.readOnlyInput]}>
              <Text style={editProfile.readOnlyText}>@{userData.username}</Text>
            </View>
            <Text style={editProfile.helpText}>Username cannot be changed</Text>
          </View>

          {/* Bio */}
          <View style={union.textInputContainer}>
            <Text style={union.textInputLabel}>Bio</Text>
            <Controller
              control={control}
              name="bio"
              rules={{
                maxLength: {
                  value: 200,
                  message: "Bio must be less than 200 characters",
                },
              }}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={[union.textInput, editProfile.bioInput]}
                  value={value}
                  onChangeText={onChange}
                  placeholder="Tell us about yourself..."
                  placeholderTextColor={COLORS.textMuted}
                  multiline
                  numberOfLines={3}
                  maxLength={200}
                />
              )}
            />
            <Text style={editProfile.characterCount}>
              {watch("bio")?.length || 0}/200 characters
            </Text>
            {errors.bio && (
              <Text style={editProfile.errorText}>{errors.bio.message}</Text>
            )}
          </View>
        </View>

        {/* Location */}
        <View style={onboard.wideCard}>
          <Controller
            control={control}
            name="location"
            render={({ field: { onChange, value } }) => (
              <LocationSelector
                value={value}
                onChange={onChange}
                placeholder="Search for your location..."
              />
            )}
          />
        </View>

        {/* Social Links */}
        <View style={onboard.wideCard}>
          <Text style={onboard.cardTitle}>Social Links</Text>

          <View style={union.textInputContainer}>
            <View style={editProfile.socialInputHeader}>
              <Ionicons name="logo-instagram" size={20} color="#E4405F" />
              <Text style={union.textInputLabel}>Instagram</Text>
            </View>
            <Controller
              control={control}
              name="socialLinks.instagram"
              rules={{
                pattern: {
                  value: /^[a-zA-Z0-9._]+$/,
                  message: "Please enter a valid Instagram username",
                },
              }}
              render={({ field: { onChange, value } }) => (
                <View style={editProfile.socialInputContainer}>
                  <Text style={editProfile.socialPrefix}>@</Text>
                  <TextInput
                    style={[union.textInput, editProfile.socialInput]}
                    value={value}
                    onChangeText={(text) => onChange(text.toLowerCase())}
                    placeholder="username"
                    placeholderTextColor={COLORS.textMuted}
                    autoCapitalize="none"
                  />
                </View>
              )}
            />
            {errors.socialLinks?.instagram && (
              <Text style={editProfile.errorText}>
                {errors.socialLinks.instagram.message}
              </Text>
            )}
          </View>

          <View style={union.textInputContainer}>
            <View style={editProfile.socialInputHeader}>
              <Ionicons name="logo-youtube" size={20} color="#FF0000" />
              <Text style={union.textInputLabel}>YouTube</Text>
            </View>
            <Controller
              control={control}
              name="socialLinks.youtube"
              rules={{
                pattern: {
                  value: /^[a-zA-Z0-9._@-]+$/,
                  message: "Please enter a valid YouTube username or handle",
                },
              }}
              render={({ field: { onChange, value } }) => (
                <View style={editProfile.socialInputContainer}>
                  <Text style={editProfile.socialPrefix}>@</Text>
                  <TextInput
                    style={[union.textInput, editProfile.socialInput]}
                    value={value}
                    onChangeText={onChange}
                    placeholder="username"
                    placeholderTextColor={COLORS.textMuted}
                    autoCapitalize="none"
                  />
                </View>
              )}
            />
            {errors.socialLinks?.youtube && (
              <Text style={editProfile.errorText}>
                {errors.socialLinks.youtube.message}
              </Text>
            )}
          </View>

          <View style={union.textInputContainer}>
            <View style={editProfile.socialInputHeader}>
              <Ionicons name="logo-twitter" size={20} color="#1DA1F2" />
              <Text style={union.textInputLabel}>Twitter/X</Text>
            </View>
            <Controller
              control={control}
              name="socialLinks.twitter"
              rules={{
                pattern: {
                  value: /^[a-zA-Z0-9._]+$/,
                  message: "Please enter a valid Twitter username",
                },
              }}
              render={({ field: { onChange, value } }) => (
                <View style={editProfile.socialInputContainer}>
                  <Text style={editProfile.socialPrefix}>@</Text>
                  <TextInput
                    style={[union.textInput, editProfile.socialInput]}
                    value={value}
                    onChangeText={(text) => onChange(text.toLowerCase())}
                    placeholder="username"
                    placeholderTextColor={COLORS.textMuted}
                    autoCapitalize="none"
                  />
                </View>
              )}
            />
            {errors.socialLinks?.twitter && (
              <Text style={editProfile.errorText}>
                {errors.socialLinks.twitter.message}
              </Text>
            )}
          </View>
        </View>

        {/* Individual-Specific Sections */}
        {userData?.userType === "individual" && (
          <>
            <PersonalStatsEditor control={control} errors={errors} />
            <ExperienceEditor control={control} errors={errors} />
            <CertificationsEditor control={control} errors={errors} />
            <TrainingSettings control={control} errors={errors} watch={watch} />
          </>
        )}

        {/* Gym-Specific Sections */}
        {userData?.userType === "gym" && (
          <>
            <BusinessInfoEditor control={control} errors={errors} />
            <OperatingHoursEditor control={control} errors={errors} />
            <AmenitiesEditor control={control} errors={errors} />
            <MembershipPlansEditor control={control} errors={errors} />
            <GymStatsEditor control={control} errors={errors} />
          </>
        )}

        {/* Brand-Specific Sections */}
        {userData?.userType === "brand" && (
          <>
            <BrandBusinessInfoEditor control={control} errors={errors} />
            <PartnershipsEditor control={control} errors={errors} />
            <CampaignsEditor control={control} errors={errors} />
          </>
        )}

        {/* Bottom Spacing */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = {
  scrollView: {
    flex: 1,
  },
};
