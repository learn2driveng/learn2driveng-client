import { ContentEmptyState } from "@/components/common/content-empty-state";
import { DashboardPageHeader, DashboardScreen } from "@/components/dashboard";
import type { ComponentProps } from "react";
import type { MaterialCommunityIcons } from "@expo/vector-icons";

type InstructorPlaceholderScreenProps = {
  title: string;
  icon: ComponentProps<typeof MaterialCommunityIcons>["name"];
  heading: string;
  description: string;
};

export function InstructorPlaceholderScreen({
  title,
  icon,
  heading,
  description,
}: InstructorPlaceholderScreenProps) {
  return (
    <DashboardScreen>
      <DashboardPageHeader title={title} showBack={false} />
      <ContentEmptyState
        icon={icon}
        title={heading}
        description={description}
      />
    </DashboardScreen>
  );
}
