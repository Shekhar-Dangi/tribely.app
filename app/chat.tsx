import React, { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { COLORS, SPACING } from "@/constants/theme";
import { ChatList, ChatScreen } from "@/components/chat";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { AppHeader } from "@/components/common";

export default function Chat() {
  const params = useLocalSearchParams<{ chatId?: string; otherUser?: string }>();
  const [selectedChat, setSelectedChat] = useState<{
    chatId: string;
    otherUser: any;
  } | null>(null);

  const currentUser = useCurrentUser();

  // Handle direct navigation to a specific chat
  useEffect(() => {
    if (params.chatId && params.otherUser) {
      try {
        const otherUser = JSON.parse(params.otherUser);
        setSelectedChat({
          chatId: params.chatId,
          otherUser,
        });
      } catch (error) {
        console.error("Failed to parse otherUser:", error);
      }
    }
  }, [params.chatId, params.otherUser]);

  const handleChatPress = (chatId: string, otherUser: any) => {
    setSelectedChat({ chatId, otherUser });
  };

  const handleBack = () => {
    setSelectedChat(null);
  };

  if (!currentUser) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          {/* Loading state */}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      {selectedChat ? (
        <ChatScreen
          chatId={selectedChat.chatId}
          otherUser={selectedChat.otherUser}
          onBack={handleBack}
        />
      ) : (
        <ChatList onChatPress={handleChatPress} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
