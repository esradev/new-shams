import React from "react";
import { View, StyleSheet, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColorScheme } from "nativewind";
import TabBarButton from "./TabBarButton";

type TabBarProps = {
  state: any;
  descriptors: any;
  navigation: any;
};

const TabBar = ({ state, descriptors, navigation }: TabBarProps) => {
  const { bottom } = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();

  const primaryColor = "#059669";
  const greyColor = "#737373";

  const containerBg =
    colorScheme === "dark" ? "rgba(28,25,23,0.92)" : "rgba(255,255,255,0.92)";
  const borderColor = colorScheme === "dark" ? "#44403c" : "#e7e5e4";

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.wrapper,
        {
          bottom: Math.max(12, bottom + 8),
        },
      ]}
    >
      <View
        style={[
          styles.container,
          {
            backgroundColor: containerBg,
            borderColor,
            shadowColor: "#000",
          },
        ]}
        // @ts-ignore - className supported by nativewind
        className="flex-row-reverse items-center justify-between"
      >
        {state.routes.map((route: any, index: number) => {
          const descriptor = descriptors[route.key];
          const options = descriptor?.options ?? {};

          // Hide internal/system routes from the tab bar
          if (["_sitemap", "+not-found"].includes(route.name)) return null;

          // Label resolution (support string labels; if provided as function, fallback to title/name)
          let label =
            typeof options.tabBarLabel === "string"
              ? options.tabBarLabel
              : (options.title ?? route.name);

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: "tabLongPress",
              target: route.key,
            });
          };

          // Modern addition: pass optional badge down to the button
          const badge =
            options.tabBarBadge ??
            options.badge ??
            route.params?.badge ??
            undefined;

          return (
            <TabBarButton
              key={route.key ?? route.name}
              onPress={onPress}
              onLongPress={onLongPress}
              isFocused={isFocused}
              routeName={route.name}
              color={isFocused ? primaryColor : greyColor}
              label={label}
              // new prop for modernized TabBarButton
              badge={badge}
              accessibilityRole="tab"
              accessibilityState={{ selected: isFocused }}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
            />
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 16,
    right: 16,
    zIndex: 50,
  },
  container: {
    borderWidth: 1,
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 8,
    // shadows
    ...Platform.select({
      ios: {
        shadowOpacity: 0.12,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
      },
      android: {
        elevation: 12,
      },
      default: {},
    }),
  },
});

export default TabBar;
