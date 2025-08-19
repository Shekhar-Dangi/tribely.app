import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery, useMutation, usePaginatedQuery } from "convex/react";
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
import ChatButton from "@/components/chat/ChatButton";
import WorkoutDisplay from "@/components/workouts/WorkoutDisplay";


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

  // Get the most recent training request between users
  const trainingRequest = useQuery(
    api.follows.getMostRecentTrainingRequest,
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
  const cancelRequest = useMutation(api.follows.cancelTrainingRequest);
  const createOrGetChat = useMutation(api.chats.createOrGetChat);

  const handleTrain = async () => {
    if (!currentUser || !userData) return;
    console.log(trainingRequest)
    if(trainingRequest?.status === "accepted"){
      Alert.alert("Already in progress!")
    }

    // If there's a pending request, cancel it
    if (trainingRequest?.status === "pending") {
      try {
        await cancelRequest({ requestId: trainingRequest._id });
        console.log("Training request cancelled successfully");
      } catch (error) {
        console.error("Failed to cancel training request:", error);
      }
    } else {
      // Send new training request
      try {
        const result = await sendTrainingRequest({
          requesterId: currentUser._id as Id<"users">,
          trainerId: userData._id,
        });
        
        if (result.autoAccepted) {
          console.log("Training request auto-accepted due to bidirectional request!");
          // Optionally navigate to chat
          if (result.chatId) {
            router.push(
              `/chat?chatId=${result.chatId}&otherUser=${JSON.stringify({
                _id: userData._id,
                username: userData.username,
                avatarUrl: userData.avatarUrl,
                isVerified: userData.isVerified,
              })}`
            );
          }
        } else {
          console.log("Training request sent successfully");
        }
      } catch (error) {
        console.error("Failed to send training request:", error);
      }
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

  const handleChat = async () => {
    if (!currentUser || !userData || isOwnProfile) return;

    try {
      const chatId = await createOrGetChat({
        otherUserId: userData._id,
        reason: "direct_message",
      });

      console.log(chatId);

      // Navigate to chat screen
      router.push(
        `/chat?chatId=${chatId}&otherUser=${JSON.stringify({
          _id: userData._id,
          username: userData.username,
          avatarUrl: userData.avatarUrl,
          isVerified: userData.isVerified,
        })}`
      );
    } catch (error) {
      console.error("Failed to create chat:", error);
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
        return userData?._id ? (
          <View style={profile.tabContent}>
            <WorkoutDisplay
              userId={userData._id as Id<"users">}
              isOwnProfile={isOwnProfile}
              username={userData.username}
            />
          </View>
        ) : (
          <View style={profile.tabContent}>
            <Text style={profile.contentPlaceholder}>Loading...</Text>
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
          {/* Chat button for other users */}
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
            <TouchableOpacity
              style={[
                profile.primaryButton,
                isFollowing && { backgroundColor: COLORS.lightGray }
              ]}
              onPress={handleFollow}
            >
              <Text style={[
                profile.primaryButtonText,
                isFollowing && { color: COLORS.text }
              ]}>
                {isFollowing ? "Following" : "Follow"}
              </Text>
            </TouchableOpacity>

            {/* Show Train button conditionally based on status */}
            {userData.userType === "individual" &&
             trainingRequest?.status !== "accepted" && (
              <TouchableOpacity
                style={[
                  profile.secondaryButton,
                  trainingRequest?.status === "pending" && {
                    backgroundColor: COLORS.lightGray,
                    borderColor: COLORS.lightGray
                  },
                  trainingRequest?.status === "completed" && {
                    backgroundColor: COLORS.secondary,
                    borderColor: COLORS.secondary
                  }
                ]}
                onPress={handleTrain}
              >
                <Text style={[
                  profile.secondaryButtonText,
                  trainingRequest?.status === "pending" && {
                    color: COLORS.black
                  },
                  trainingRequest?.status === "completed" && {
                    color: COLORS.white
                  }
                ]}>
                  {trainingRequest?.status === "pending"
                    ? "Withdraw"
                    : trainingRequest?.status === "completed"
                    ? "Train Again"
                    : trainingRequest?.status === "rejected"
                    ? "Train Again"
                    : "Train"}
                </Text>
              </TouchableOpacity>
            )}

            <ChatButton onPress={handleChat} size={20} />
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
