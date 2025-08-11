import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { profile } from "@/constants/styles";
import { COLORS } from "@/constants/theme";
import DataTab from "@/components/profile/DataTab";
import BrandDataTab from "@/components/profile/BrandDataTab";
import GymDataTab from "@/components/profile/GymDataTab";
import PostsTab from "@/components/posts/PostsTab";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import {
  isIndividualProfile,
  isGymProfile,
  isBrandProfile,
} from "@/types/schema";
import { ProfileHeader } from "@/components";

export default function UserProfile() {
  const { username } = useLocalSearchParams<{ username: string }>();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("data");

  const currentUser = useCurrentUser();
  const userData = useQuery(api.users.getUserByUsername, {
    username: username!,
  });

  // Check if this is the current user's profile
  const isOwnProfile = currentUser?.username === username;

  // Follow status
  const isFollowing = useQuery(
    api.follows.isFollowing,
    currentUser && userData && !isOwnProfile
      ? {
          followerId: currentUser._id as Id<"users">,
          followingId: userData._id,
        }
      : "skip"
  );

  // Training request status
  const trainingRequestStatus = useQuery(
    api.follows.hasTrainingRequest,
    currentUser &&
      userData &&
      !isOwnProfile &&
      userData.userType === "individual"
      ? { requesterId: currentUser._id as Id<"users">, trainerId: userData._id }
      : "skip"
  );

  // Mutations
  const followUser = useMutation(api.follows.followUser);
  const unfollowUser = useMutation(api.follows.unfollowUser);
  const sendTrainingRequest = useMutation(api.follows.sendTrainingRequest);

  const handleTrain = async () => {
    if (!currentUser || !userData) return;

    try {
      await sendTrainingRequest({
        requesterId: currentUser._id as Id<"users">,
        trainerId: userData._id,
      });
      console.log("Training request sent successfully");
    } catch (error) {
      console.error("Failed to send training request:", error);
    }
  };

  const handleFollow = async () => {
    if (!currentUser || !userData) return;

    try {
      if (isFollowing) {
        await unfollowUser({
          followerId: currentUser._id as Id<"users">,
          followingId: userData._id,
        });
        console.log("Unfollowed user");
      } else {
        await followUser({
          followerId: currentUser._id as Id<"users">,
          followingId: userData._id,
        });
        console.log("Followed user");
      }
    } catch (error) {
      console.error("Failed to follow/unfollow user:", error);
    }
  };

  const handleEdit = () => {
    router.push("/edit-profile");
  };

  const handleSettings = () => {
    // Navigate to settings
    console.log("Settings");
  };

  const renderTabContent = () => {
    if (!userData) return null;

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
        <ActivityIndicator size="large" color={COLORS.secondary} />
        <Text style={profile.contentPlaceholder}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <View style={profile.container}>
      <ProfileHeader
        onNotificationsPress={() => {}}
        onMessagesPress={() => {}}
      />
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
        <Text style={profile.userName}>@{userData.username}</Text>
        <Text style={profile.userType}>{userData.bio}</Text>
      </View>

      {/* Action Buttons - Different for own profile vs others */}
      <View style={profile.actionButtons}>
        {isOwnProfile ? (
          // Own profile buttons
          <>
            <TouchableOpacity
              style={profile.primaryButton}
              onPress={handleEdit}
            >
              <Text style={profile.primaryButtonText}>Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={profile.secondaryButton}
              onPress={handleSettings}
            >
              <Text style={profile.secondaryButtonText}>Settings</Text>
            </TouchableOpacity>
          </>
        ) : (
          // Other user's profile buttons
          <>
            {userData.userType === "individual" &&
              userData.profile &&
              isIndividualProfile(userData.profile) &&
              userData.profile.isTrainingEnabled && (
                <TouchableOpacity
                  style={profile.primaryButton}
                  onPress={handleTrain}
                >
                  <Text style={profile.primaryButtonText}>
                    {trainingRequestStatus === "pending" ? "Pending" : "Train"}
                  </Text>
                </TouchableOpacity>
              )}

            <TouchableOpacity
              style={profile.secondaryButton}
              onPress={handleFollow}
            >
              <Text style={profile.secondaryButtonText}>
                {isFollowing ? "Following" : "Follow"}
              </Text>
            </TouchableOpacity>
          </>
        )}
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
