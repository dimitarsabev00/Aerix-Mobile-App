import { useState } from "react";
import { router, usePathname } from "expo-router";
import { View, TouchableOpacity, Image, TextInput, Alert } from "react-native";

import { icons } from "../constants";

type SearchInputProps = {
  initialQuery?: string;
};

const SearchInput: React.FC<SearchInputProps> = ({ initialQuery = "" }) => {
  const pathname = usePathname();
  const [query, setQuery] = useState<string>(initialQuery);

  return (
    <View className="flex flex-row items-center space-x-4 w-full h-16 px-4 bg-black-100 rounded-2xl border-2 border-black-200 focus:border-secondary">
      <TextInput
        className="text-base mt-0.5 text-white flex-1 font-pregular"
        value={query}
        placeholder="Search a video topic"
        placeholderTextColor="#CDCDE0"
        onChangeText={(text) => setQuery(text)}
      />

      <TouchableOpacity
        onPress={() => {
          if (query === "") {
            return Alert.alert(
              "Missing Query",
              "Please input something to search results across the database"
            );
          }

          if (pathname.startsWith("/search")) router.setParams({ query });
          else router.push(`/search/${query}`);
        }}
      >
        <Image
          source={icons.search}
          style={{ width: 20, height: 20 }}
          resizeMode="contain"
        />
      </TouchableOpacity>
    </View>
  );
};

export default SearchInput;