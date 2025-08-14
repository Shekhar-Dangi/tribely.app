import { useState } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { Id } from "@/convex/_generated/dataModel";
import { profile } from "@/constants/styles";
import { COLORS } from "@/constants/theme";
import DataTab from "@/components/profile/DataTab";
import BrandDataTab from "@/components/profile/BrandDataTab";
import GymDataTab from "@/components/profile/GymDataTab";
import PostsTab from "@/components/posts/PostsTab";
import { AppHeader } from "@/components/common";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import {
  isIndividualProfile,
  isGymProfile,
  isBrandProfile,
} from "@/types/schema";
import WorkoutText from "@/components/workouts/WorkoutText";

export default function Profile() {
  const { user } = useUser();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("data");

  const userData = useCurrentUser();

  const handleEdit = () => {
    router.push("/edit-profile");
  };

  const handleSettings = () => {
    // Navigate to settings
    console.log("Settings");
  };

  const handleNotifications = () => {
    console.log("Notifications pressed");
  };

  const handleMessages = () => {
    router.push("/chat");
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "data":
        // Individual Profile
        if (userData?.profile && isIndividualProfile(userData.profile)) {
          return (
            <DataTab
              bio={userData?.bio}
              stats={userData.profile.stats}
              experiences={userData.profile.experiences}
              certifications={userData.profile.certifications}
              affiliation={userData.profile.affiliation}
            />
          );
        }

        // Gym Profile
        if (userData?.profile && isGymProfile(userData.profile)) {
          return (
            <GymDataTab
              bio={userData?.bio}
              businessInfo={userData.profile.businessInfo}
              membershipPlans={userData.profile.membershipPlans}
              stats={userData.profile.stats}
            />
          );
        }

        // Brand Profile
        if (userData?.profile && isBrandProfile(userData.profile)) {
          return (
            <BrandDataTab
              bio={userData?.bio}
              businessInfo={userData.profile.businessInfo}
              partnerships={userData.profile.partnerships}
            />
          );
        }

        // Default case - no profile or unknown type
        return (
          <View style={profile.tabContent}>
            <Text style={profile.contentPlaceholder}>
              No profile data available yet
            </Text>
          </View>
        );
      case "posts":
        return userData?._id ? (
          <PostsTab
            userId={userData._id as Id<"users">}
            // Remove onPostPress to use default modal behavior
          />
        ) : (
          <View style={profile.tabContent}>
            <Text style={profile.contentPlaceholder}>Loading posts...</Text>
          </View>
        );
      case "workouts":
        return (
          <View style={profile.tabContent}>
            <WorkoutText />
          </View>
        );
      default:
        return null;
    }
  };

  if (!userData) {
    return (
      <View style={profile.container}>
        <Text style={profile.contentPlaceholder}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <AppHeader
        title="Profile"
        leftIcon="notifications-outline"
        onLeftPress={handleNotifications}
        rightIcon="chatbubble-outline"
        onRightPress={handleMessages}
      />
      <View style={profile.container}>
        <View style={profile.profileHeader}>
          <View style={profile.avatarContainer}>
            <Image
              source={
                userData.avatarUrl
                  ? { uri: userData.avatarUrl }
                  : require("@/assets/images/logo.png")
              }
              style={profile.avatar}
            />
          </View>
          <View style={profile.statsContainer}>
            <TouchableOpacity style={profile.statItem}>
              <Text style={profile.statNumber}>
                {userData.followerCount || 0}
              </Text>
              <Text style={profile.statLabel}>Followers</Text>
            </TouchableOpacity>

            <TouchableOpacity style={profile.statItem}>
              <Text style={profile.statNumber}>
                {userData.followingCount || 0}
              </Text>
              <Text style={profile.statLabel}>Following</Text>
            </TouchableOpacity>
            {userData.userType === "individual" &&
              userData.profile &&
              isIndividualProfile(userData.profile) && (
                <TouchableOpacity style={profile.statItem}>
                  <Text style={profile.statNumber}>
                    {userData.profile.activityScore || 0}
                  </Text>
                  <Text style={profile.statLabel}>Eval</Text>
                </TouchableOpacity>
              )}
          </View>
        </View>
        <View style={profile.userInfo}>
          <Text style={profile.userName}>{user?.fullName}</Text>
          {/* <Text style={profile.userHandle}>@{userData.username}</Text> */}
          <Text style={profile.userType}>{userData.bio}</Text>
        </View>
        {/* Stats Section - Instagram style */}

        <View style={profile.actionButtons}>
          <TouchableOpacity style={profile.primaryButton} onPress={handleEdit}>
            <Text style={profile.primaryButtonText}>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={profile.secondaryButton}
            onPress={handleSettings}
          >
            <Text style={profile.secondaryButtonText}>Settings</Text>
          </TouchableOpacity>
        </View>
        {/* Tab Navigation */}
        <View style={profile.tabContainer}>
          <TouchableOpacity
            style={[
              profile.tab,
              activeTab === "data" && { borderBottomColor: COLORS.primary },
            ]}
            onPress={() => setActiveTab("data")}
          >
            <Text
              style={[
                profile.tabText,
                activeTab === "data" && { color: COLORS.primary },
              ]}
            >
              Data
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              profile.tab,
              activeTab === "posts" && { borderBottomColor: COLORS.primary },
            ]}
            onPress={() => setActiveTab("posts")}
          >
            <Text
              style={[
                profile.tabText,
                activeTab === "posts" && { color: COLORS.primary },
              ]}
            >
              Posts
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              profile.tab,
              activeTab === "workouts" && { borderBottomColor: COLORS.primary },
            ]}
            onPress={() => setActiveTab("workouts")}
          >
            <Text
              style={[
                profile.tabText,
                activeTab === "workouts" && { color: COLORS.primary },
              ]}
            >
              Workouts
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {renderTabContent()}
      </View>
    </View>
  );
}
