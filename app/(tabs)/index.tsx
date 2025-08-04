import { useAuth, useUser } from "@clerk/clerk-expo";
import { Link } from "expo-router";
import { Pressable, Text, View } from "react-native";

export default function Index() {
  const { signOut } = useAuth();
  const { user } = useUser();
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>{user?.fullName}</Text>
      <Pressable
        onPress={() => {
          signOut();
        }}
      >
        <Text>Sign Out</Text>
      </Pressable>
    </View>
  );
}
