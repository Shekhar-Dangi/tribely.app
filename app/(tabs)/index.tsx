import { useAuth } from "@clerk/clerk-expo";
import { Link } from "expo-router";
import { Pressable, Text, View } from "react-native";

export default function Index() {
  const { signOut } = useAuth();
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Home Tabs</Text>
      <Pressable
        onPress={() => {
          signOut();
        }}
      >
        <Text>Sign Out</Text>
      </Pressable>
      <Link href={"/sign-in"}>sign in</Link>
    </View>
  );
}
