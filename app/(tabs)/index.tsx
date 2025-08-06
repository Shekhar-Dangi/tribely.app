import { tabs } from "@/constants/styles";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { Pressable, Text, View } from "react-native";

export default function Index() {
  const { signOut } = useAuth();
  const { user } = useUser();
  return (
    <View style={tabs.container}>
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
