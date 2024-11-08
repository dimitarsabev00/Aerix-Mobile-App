import { Link } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Text, View } from "react-native";

export default function App() {
  return (
    <View className="flex-1 justify-center items-center bg-gray-300">
      <Text className="font-black">Aerix Mobile App</Text>
      <Link href={"/home"}>Open Home Screen</Link>
      <StatusBar style="auto" />
    </View>
  );
}
