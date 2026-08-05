import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

import { fontFamily } from "@/constants/fonts";
import { useAppTheme } from "@/hooks/use-app-theme";
import { searchSchoolAddresses } from "@/lib/api";
import type { AddressSuggestion, ApiError } from "@/types";

type AddressAutocompleteFieldProps = {
  value: string;
  selectedAddress: AddressSuggestion | null;
  onChangeText: (value: string) => void;
  onSelectAddress: (address: AddressSuggestion) => void;
  error?: string | null;
};

export function AddressAutocompleteField({
  value,
  selectedAddress,
  onChangeText,
  onSelectAddress,
  error,
}: AddressAutocompleteFieldProps) {
  const { colors } = useAppTheme();
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const query = value.trim();
  const hasCurrentSelection =
    selectedAddress?.formattedAddress === value.trim();

  useEffect(() => {
    if (query.length < 3 || hasCurrentSelection) {
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => {
      setSearchQuery(query);
      setIsSearching(true);
      setHasSearched(false);
      setSearchError(null);

      searchSchoolAddresses(query, controller.signal)
        .then((results) => {
          if (controller.signal.aborted) return;
          setSuggestions(results);
          setHasSearched(true);
        })
        .catch((caught: ApiError) => {
          if (controller.signal.aborted) return;
          setSuggestions([]);
          setHasSearched(true);
          setSearchError(
            caught.message || "We could not search addresses right now.",
          );
        })
        .finally(() => {
          if (!controller.signal.aborted) setIsSearching(false);
        });
    }, 350);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [hasCurrentSelection, query]);

  const isCurrentSearch = searchQuery === query;
  const currentSuggestions = isCurrentSearch ? suggestions : [];
  const currentIsSearching = isCurrentSearch && isSearching;
  const currentHasSearched = isCurrentSearch && hasSearched;
  const currentSearchError = isCurrentSearch ? searchError : null;
  const showResults =
    !hasCurrentSelection &&
    query.length >= 3 &&
    (currentIsSearching ||
      currentHasSearched ||
      Boolean(currentSearchError));

  return (
    <View>
      <Text
        className="mb-2 text-[10px] uppercase tracking-[1.2px]"
        style={{ color: colors.textMuted, fontFamily: fontFamily.figtreeBold }}
      >
        Registered address
      </Text>
      <View
        className="h-14 flex-row items-center rounded-2xl border px-4"
        style={{
          backgroundColor: colors.surface,
          borderColor: error ? colors.error : colors.border,
        }}
      >
        <MaterialCommunityIcons
          name="map-marker-outline"
          size={20}
          color={hasCurrentSelection ? colors.success : colors.textSubtle}
        />
        <TextInput
          accessibilityLabel="Registered address"
          autoCapitalize="words"
          autoComplete="street-address"
          onChangeText={onChangeText}
          placeholder="Start typing the school address"
          placeholderTextColor={colors.textFaint}
          returnKeyType="search"
          value={value}
          className="ml-3 flex-1 text-[14px]"
          style={{ color: colors.text, fontFamily: fontFamily.figtreeMedium }}
        />
        {currentIsSearching ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : hasCurrentSelection ? (
          <MaterialCommunityIcons
            name="check-circle"
            size={20}
            color={colors.success}
          />
        ) : null}
      </View>

      {showResults ? (
        <View
          className="mt-2 overflow-hidden rounded-lg border"
          style={{
            backgroundColor: colors.surface,
            borderColor: currentSearchError ? colors.error : colors.border,
          }}
        >
          {currentIsSearching ? (
            <View className="flex-row items-center gap-3 px-4 py-4">
              <ActivityIndicator size="small" color={colors.primary} />
              <Text
                className="text-[12px]"
                style={{
                  color: colors.textMuted,
                  fontFamily: fontFamily.figtreeMedium,
                }}
              >
                Searching addresses...
              </Text>
            </View>
          ) : currentSearchError ? (
            <Text
              accessibilityRole="alert"
              className="px-4 py-3 text-[12px] leading-5"
              style={{ color: colors.error, fontFamily: fontFamily.figtreeBold }}
            >
              {currentSearchError}
            </Text>
          ) : currentSuggestions.length === 0 ? (
            <Text
              className="px-4 py-3 text-[12px]"
              style={{
                color: colors.textMuted,
                fontFamily: fontFamily.figtreeMedium,
              }}
            >
              No matching Nigerian address found.
            </Text>
          ) : (
            currentSuggestions.map((suggestion, index) => (
              <Pressable
                key={suggestion.id}
                accessibilityRole="button"
                accessibilityLabel={`Use ${suggestion.formattedAddress}`}
                onPress={() => {
                  onSelectAddress(suggestion);
                  Keyboard.dismiss();
                }}
                className="flex-row items-start gap-3 px-4 py-3 active:opacity-70"
                style={{
                  borderTopWidth: index === 0 ? 0 : 1,
                  borderTopColor: colors.border,
                }}
              >
                <MaterialCommunityIcons
                  name="map-marker"
                  size={18}
                  color={colors.primary}
                />
                <View className="flex-1">
                  <Text
                    numberOfLines={1}
                    className="text-[13px]"
                    style={{
                      color: colors.text,
                      fontFamily: fontFamily.figtreeBold,
                    }}
                  >
                    {suggestion.addressLine1}
                  </Text>
                  <Text
                    numberOfLines={2}
                    className="mt-1 text-[11px] leading-4"
                    style={{
                      color: colors.textMuted,
                      fontFamily: fontFamily.figtreeMedium,
                    }}
                  >
                    {suggestion.formattedAddress}
                  </Text>
                </View>
              </Pressable>
            ))
          )}
          <Text
            className="px-4 pb-2 pt-1 text-right text-[9px]"
            style={{ color: colors.textFaint, fontFamily: fontFamily.figtree }}
          >
            Powered by Google
          </Text>
        </View>
      ) : null}

      {error ? (
        <Text
          accessibilityRole="alert"
          className="mt-2 text-[12px]"
          style={{ color: colors.error, fontFamily: fontFamily.figtreeBold }}
        >
          {error}
        </Text>
      ) : hasCurrentSelection ? (
        <Text
          className="mt-2 text-[11px]"
          style={{ color: colors.success, fontFamily: fontFamily.figtreeBold }}
        >
          {selectedAddress.city}, {selectedAddress.state}
        </Text>
      ) : null}
    </View>
  );
}
