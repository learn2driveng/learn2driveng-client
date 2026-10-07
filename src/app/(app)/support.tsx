import { RoleRouteGuard } from "@/features/auth";
import { SupportRequestScreen } from "@/features/profile";

export default function AppSupportScreen() {
  return (
    <RoleRouteGuard
      allowedRoles={["learner", "instructor"]}
      fallbackReturnTo="/support"
    >
      <SupportRequestScreen />
    </RoleRouteGuard>
  );
}
