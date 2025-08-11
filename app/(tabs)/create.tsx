import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from "react-native";
import { useUser } from "@clerk/clerk-expo";
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useCloudinaryUpload } from "@/hooks/useCloudinaryUpload";
import { AppHeader } from "@/components/common";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import * as ImagePicker from "expo-image-picker";

type PostType = "text" | "image" | "video";
type PrivacyType = "public" | "friends" | "private";

export default function Create() {
  const { user } = useUser();
  const userData = useCurrentUser();
  const {
    uploadImage,
    isUploading,
    progress,
    error: uploadError,
  } = useCloudinaryUpload();
  const createPost = useMutation(api.posts.createPost);

  const [activePostType, setActivePostType] = useState<PostType>("text");
  const [textContent, setTextContent] = useState("");
  const [privacy, setPrivacy] = useState<PrivacyType>("public");
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);

  const maxCharacters = 2000;
  const remainingChars = maxCharacters - textContent.length;

  const handlePost = async () => {
    if (activePostType === "text" && textContent.trim().length === 0) {
      Alert.alert("Error", "Please write something to post");
      return;
    }
    if (
      (activePostType === "image" || activePostType === "video") &&
      !selectedMedia
    ) {
      Alert.alert("Error", `Please select ${activePostType} to post`);
      return;
    }

    if (!user?.id) {
      Alert.alert("Error", "You must be logged in to create a post");
      return;
    }

    try {
      let mediaUrl = "";
      let mediaPublicId = "";

      // Step 1: Upload image to Cloudinary if needed
      if (activePostType === "image" && selectedMedia) {
        const uploadResult = await uploadImage(selectedMedia);

        if (!uploadResult.success) {
          Alert.alert(
            "Upload Error",
            uploadResult.error || "Failed to upload image"
          );
          return;
        }

        mediaUrl = uploadResult.imageUrl!;
        mediaPublicId = uploadResult.publicId!;
      }

      // Step 2: Create post in Convex
      await createPost({
        content: textContent.trim(),
        mediaUrl: mediaUrl || undefined,
        mediaPublicId: mediaPublicId || undefined,
        mediaType: activePostType === "text" ? undefined : activePostType,
        privacy,
      });

      Alert.alert("Success", "Post created successfully!");

      // Reset form
      setTextContent("");
      setSelectedMedia(null);
      setActivePostType("text");
    } catch (error) {
      console.error("Post creation error:", error);
      Alert.alert("Error", "Failed to create post. Please try again.");
    }
  };

  const handleCancel = () => {
    setTextContent("");
    setSelectedMedia(null);
    setActivePostType("text");
  };

  const handleMediaSelect = async () => {
    if (activePostType === "video") {
      Alert.alert("Coming Soon", "Video upload will be implemented later");
      return;
    }

    // Request permission to access media library
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert(
        "Permission Required",
        "You need to enable permission to access photos"
      );
      return;
    }

    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1], // Square aspect ratio like Instagram
      quality: 0.8, // Reduce file size while maintaining quality
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedMedia(result.assets[0].uri);
    }
  };

  const renderPostTypeTab = (
    type: PostType,
    icon: keyof typeof Ionicons.glyphMap,
    label: string
  ) => (
    <TouchableOpacity
      style={[
        styles.postTypeTab,
        activePostType === type && styles.activePostTypeTab,
      ]}
      onPress={() => setActivePostType(type)}
    >
      <Ionicons
        name={icon}
        size={20}
        color={
          activePostType === type ? COLORS.secondary : COLORS.textSecondary
        }
      />
      <Text
        style={[
          styles.postTypeTabText,
          activePostType === type && styles.activePostTypeTabText,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderPrivacySelector = () => (
    <View style={styles.privacyContainer}>
      <Text style={styles.privacyLabel}>Privacy:</Text>
      <View style={styles.privacyOptions}>
        {(["public", "friends", "private"] as PrivacyType[]).map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.privacyOption,
              privacy === option && styles.activePrivacyOption,
            ]}
            onPress={() => setPrivacy(option)}
          >
            <Text
              style={[
                styles.privacyOptionText,
                privacy === option && styles.activePrivacyOptionText,
              ]}
            >
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderTextPost = () => (
    <View style={styles.contentContainer}>
      <TextInput
        style={styles.textInput}
        placeholder="What's on your mind?"
        placeholderTextColor={COLORS.textMuted}
        multiline
        value={textContent}
        onChangeText={setTextContent}
        maxLength={maxCharacters}
        textAlignVertical="top"
      />
      <View style={styles.characterCount}>
        <Text
          style={[
            styles.characterCountText,
            remainingChars < 100 && styles.characterCountWarning,
            remainingChars < 0 && styles.characterCountError,
          ]}
        >
          {remainingChars} characters remaining
        </Text>
      </View>
    </View>
  );

  const renderMediaPost = () => (
    <View style={styles.contentContainer}>
      <TouchableOpacity
        style={styles.mediaSelector}
        onPress={handleMediaSelect}
      >
        {selectedMedia ? (
          <View style={styles.mediaPreviewContainer}>
            <Image
              source={{ uri: selectedMedia }}
              style={styles.mediaPreview}
            />
            <TouchableOpacity
              style={styles.removeMediaButton}
              onPress={() => setSelectedMedia(null)}
            >
              <Ionicons name="close-circle" size={24} color={COLORS.error} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.changeMediaButton}
              onPress={handleMediaSelect}
            >
              <Ionicons name="pencil" size={16} color={COLORS.white} />
              <Text style={styles.changeMediaText}>Change</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.mediaPlaceholder}>
            <Ionicons
              name={
                activePostType === "image"
                  ? "image-outline"
                  : "videocam-outline"
              }
              size={48}
              color={COLORS.textMuted}
            />
            <Text style={styles.mediaPlaceholderText}>
              Tap to select {activePostType}
            </Text>
            <Text style={styles.mediaLimitText}>
              {activePostType === "video"
                ? "Max 30s, 720p (Premium: 5min, 1080p)"
                : "HD quality available for Premium users"}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      <TextInput
        style={styles.captionInput}
        placeholder={`Add a caption for your ${activePostType}...`}
        placeholderTextColor={COLORS.textMuted}
        multiline
        value={textContent}
        onChangeText={setTextContent}
        maxLength={maxCharacters}
      />
    </View>
  );

  // Post button component for header
  const PostButton = () => (
    <TouchableOpacity
      style={[
        styles.postButton,
        (activePostType === "text" && textContent.trim().length === 0) ||
        ((activePostType === "image" || activePostType === "video") &&
          !selectedMedia) ||
        isUploading
          ? styles.postButtonDisabled
          : styles.postButtonEnabled,
      ]}
      onPress={handlePost}
      disabled={
        (activePostType === "text" && textContent.trim().length === 0) ||
        ((activePostType === "image" || activePostType === "video") &&
          !selectedMedia) ||
        isUploading
      }
    >
      <Text
        style={[
          styles.postButtonText,
          (activePostType === "text" && textContent.trim().length === 0) ||
          ((activePostType === "image" || activePostType === "video") &&
            !selectedMedia) ||
          isUploading
            ? styles.postButtonTextDisabled
            : styles.postButtonTextEnabled,
        ]}
      >
        {isUploading ? "Posting..." : "Post"}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <AppHeader
        title="Create Post"
        leftComponent={
          <TouchableOpacity
            onPress={handleCancel}
            style={{ paddingHorizontal: 12, paddingVertical: 12 }}
          >
            <Text style={styles.cancelButton}>Cancel</Text>
          </TouchableOpacity>
        }
        rightComponent={<PostButton />}
      />

      {/* Post Type Tabs */}
      <View style={styles.postTypeTabs}>
        {renderPostTypeTab("text", "document-text-outline", "Text")}
        {renderPostTypeTab("image", "image-outline", "Image")}
        {renderPostTypeTab("video", "videocam-outline", "Video")}
      </View>

      {/* Content Area */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* User Info */}
        <View style={styles.userInfo}>
          <Image
            source={
              user?.imageUrl
                ? { uri: user.imageUrl }
                : require("@/assets/images/logo.png")
            }
            style={styles.userAvatar}
          />
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{user?.fullName || "User"}</Text>
            <Text style={styles.userHandle}>
              @{userData?.username || "username"}
            </Text>
          </View>
        </View>

        {/* Privacy Selector */}
        {renderPrivacySelector()}

        {/* Content Input */}
        {activePostType === "text" ? renderTextPost() : renderMediaPost()}
      </ScrollView>
    </View>
  );
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  cancelButton: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    ...FONTS.medium,
  },
  headerTitle: {
    fontSize: FONTS.sizes.lg,
    color: COLORS.primary,
    ...FONTS.bold,
  },
  postButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
  },
  postButtonEnabled: {
    backgroundColor: COLORS.secondary,
  },
  postButtonDisabled: {
    backgroundColor: COLORS.border,
  },
  postButtonText: {
    fontSize: FONTS.sizes.sm,
    ...FONTS.medium,
  },
  postButtonTextEnabled: {
    color: COLORS.white,
  },
  postButtonTextDisabled: {
    color: COLORS.textMuted,
  },
  postTypeTabs: {
    flexDirection: "row" as const,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  postTypeTab: {
    flex: 1,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    paddingVertical: SPACING.md,
    gap: SPACING.xs,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activePostTypeTab: {
    borderBottomColor: COLORS.secondary,
  },
  postTypeTabText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    ...FONTS.medium,
  },
  activePostTypeTabText: {
    color: COLORS.secondary,
    ...FONTS.bold,
  },
  scrollView: {
    flex: 1,
  },
  userInfo: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    padding: SPACING.lg,
    backgroundColor: COLORS.white,
    marginBottom: SPACING.sm,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: SPACING.md,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: FONTS.sizes.md,
    color: COLORS.primary,
    ...FONTS.bold,
    marginBottom: 2,
  },
  userHandle: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    ...FONTS.regular,
  },
  privacyContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    marginBottom: SPACING.sm,
  },
  privacyLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text,
    ...FONTS.medium,
    marginRight: SPACING.md,
  },
  privacyOptions: {
    flexDirection: "row" as const,
    gap: SPACING.sm,
  },
  privacyOption: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  activePrivacyOption: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  privacyOptionText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
    ...FONTS.medium,
  },
  activePrivacyOptionText: {
    color: COLORS.white,
  },
  contentContainer: {
    backgroundColor: COLORS.white,
    marginBottom: SPACING.sm,
    padding: SPACING.lg,
    minHeight: 300,
  },
  textInput: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
    ...FONTS.regular,
    textAlignVertical: "top" as const,
    minHeight: 200,
    padding: 0,
  },
  characterCount: {
    alignItems: "flex-end" as const,
    marginTop: SPACING.md,
  },
  characterCountText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textMuted,
    ...FONTS.regular,
  },
  characterCountWarning: {
    color: COLORS.warning,
  },
  characterCountError: {
    color: COLORS.error,
  },
  mediaSelector: {
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: "dashed" as const,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
    overflow: "hidden" as const,
  },
  mediaPlaceholder: {
    height: 200,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    backgroundColor: COLORS.background,
  },
  mediaPlaceholderText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textMuted,
    ...FONTS.medium,
    marginTop: SPACING.sm,
  },
  mediaLimitText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textMuted,
    ...FONTS.regular,
    textAlign: "center" as const,
    marginTop: SPACING.xs,
    paddingHorizontal: SPACING.md,
  },
  mediaPreview: {
    width: "100%" as const,
    height: 200,
    resizeMode: "cover" as const,
  },
  mediaPreviewContainer: {
    position: "relative" as const,
  },
  removeMediaButton: {
    position: "absolute" as const,
    top: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 2,
  },
  changeMediaButton: {
    position: "absolute" as const,
    bottom: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    gap: 4,
  },
  changeMediaText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.xs,
    ...FONTS.medium,
  },
  captionInput: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
    ...FONTS.regular,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.md,
    minHeight: 80,
    textAlignVertical: "top" as const,
  },
};
