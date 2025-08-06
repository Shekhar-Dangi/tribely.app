import { tabs } from "@/constants/styles";
import useOnBoardingStatus from "@/hooks/useOnBoardingStatus";
import { View, Text } from "react-native";

export default function Create() {
  const { status } = useOnBoardingStatus();
  return (
    <View style={tabs.container}>
      <Text>Create</Text>
      <Text>{status ? "true" : "false"}</Text>
    </View>
  );
}
