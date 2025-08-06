import NavigationButtons from "@/components/NavigationButtons";
import Header from "@/components/onboard/Header";
import ProgressBar from "@/components/ProgressBar";
import SelectionCard from "@/components/SelectionCard";
import { onboard, tabs } from "@/constants/styles";
import { router } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import {
  useOnboarding,
  CategoryType,
  CategoryForm,
} from "@/contexts/OnboardingContext";
import { View, ScrollView, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface CategoryOption {
  id: CategoryType;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  description: string;
}

const categories: CategoryOption[] = [
  {
    id: "individual",
    title: "Individual User",
    subtitle: "Personal fitness journey",
    icon: "person-outline",
    description:
      "Share your workouts, connect with trainers, and track your progress",
  },
  {
    id: "gym",
    title: "Gym/Fitness Center",
    subtitle: "Business profile",
    icon: "business-outline",
    description:
      "Showcase your facility, attract members, and manage training services",
  },
  {
    id: "brand",
    title: "Brand/Sponsor",
    subtitle: "Commercial profile",
    icon: "star-outline",
    description:
      "Promote products, sponsor athletes, and build brand awareness",
  },
];

export default function Category() {
  const { data, updateCategory } = useOnboarding();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CategoryForm>({
    defaultValues: data.category,
  });

  const onSubmit = (formData: CategoryForm) => {
    updateCategory(formData);
    console.log("Category saved to context:", formData);
    router.push("/(onboard)/experiences");
  };

  return (
    <View style={tabs.container}>
      <ProgressBar currentStep={2} totalSteps={4} progress={50} />

      <ScrollView
        style={onboard.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <Header
          title="User Category"
          subtitle="What best describes you? This helps us personalize your experience."
        />

        <Controller
          control={control}
          name="category"
          rules={{
            required: "Please select a category",
          }}
          render={({ field: { onChange, value } }) => (
            <>
              {categories.map((category) => (
                <SelectionCard
                  key={category.id}
                  title={category.title}
                  subtitle={category.subtitle}
                  description={category.description}
                  icon={category.icon}
                  isSelected={value === category.id}
                  onPress={() => onChange(category.id)}
                />
              ))}
            </>
          )}
        />

        {errors.category && (
          <View style={{ marginHorizontal: 32, marginTop: 8 }}>
            <Text style={{ color: "red", fontSize: 12 }}>
              {errors.category.message}
            </Text>
          </View>
        )}
      </ScrollView>

      <NavigationButtons
        onNext={handleSubmit(onSubmit)}
        showSkip={true}
        showBack={true}
        onBack={() => router.back()}
      />
    </View>
  );
}
