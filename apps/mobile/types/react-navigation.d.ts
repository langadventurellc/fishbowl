declare module "@react-navigation/native" {
  import { ComponentType } from "react";

  export const NavigationContainer: ComponentType<any>;
}

declare module "@react-navigation/bottom-tabs" {
  import { ComponentType } from "react";

  export function createBottomTabNavigator(): {
    Navigator: ComponentType<any>;
    Screen: ComponentType<any>;
  };
}
