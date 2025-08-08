import { tabs } from "@/constants/styles";
import { useAuth } from "@clerk/clerk-expo";
import { View, Text } from "react-native";

export default function Events() {
  const { signOut } = useAuth();
  return (
    <View style={tabs.container}>
      <Text
        onPress={() => {
          signOut();
        }}
      >
        Events
      </Text>
    </View>
  );
}
