import { useState } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/clerk-expo";
import { profile } from "@/constants/styles";
import { COLORS } from "@/constants/theme";
import DataTab from "@/components/profile/DataTab";

export default function Profile() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState("data");

  // Query user data from Convex
  const userData = useQuery(api.users.getUserByClerkId, {
    clerkId: user?.id || "",
  });

  const handleEdit = () => {
    // Navigate to edit profile
    console.log("Edit profile");
  };

  const handleSettings = () => {
    // Navigate to settings
    console.log("Settings");
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "data":
        return (
          <DataTab
            bio={userData?.bio}
            stats={userData?.stats}
            experiences={userData?.experiences}
            certifications={userData?.certifications}
            affiliation={userData?.affiliation}
          />
        );
      case "posts":
        return (
          <View style={profile.tabContent}>
            <Text style={profile.contentPlaceholder}>Posts coming soon!</Text>
          </View>
        );
      case "workouts":
        return (
          <View style={profile.tabContent}>
            <Text style={profile.contentPlaceholder}>
              Workouts coming soon!
            </Text>
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
    <View style={profile.container}>
      {/* Header */}
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

        <View style={profile.userInfo}>
          <Text style={profile.userName}>{user?.fullName}</Text>
          <Text style={profile.userHandle}>@{userData.username}</Text>
          <Text style={profile.userType}>{userData.bio}</Text>
        </View>
      </View>
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
  );
}
