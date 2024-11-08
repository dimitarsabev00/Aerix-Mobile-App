import { StatusBar } from "expo-status-bar";
import { Text, View } from "react-native";

export default function App() {
  return (
    <View className="flex-1 justify-center items-center bg-gray-300">
      <Text>Aerix Mobile App</Text>
      <StatusBar style="auto" />
    </View>
  );
}
