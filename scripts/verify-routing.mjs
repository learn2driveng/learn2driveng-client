import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import process from "node:process";

const projectRoot = process.cwd();
const failures = [];

function source(path) {
  return readFileSync(join(projectRoot, path), "utf8");
}

function requireFile(path) {
  if (!existsSync(join(projectRoot, path))) {
    failures.push(`Missing required route: ${path}`);
  }
}

function requireText(path, expected, description) {
  if (!source(path).includes(expected)) {
    failures.push(`${description}: ${path}`);
  }
}

[
  "src/app/(public)/explore/index.tsx",
  "src/app/(public)/explore/[schoolId]/index.tsx",
  "src/app/(public)/explore/[schoolId]/instructors.tsx",
  "src/app/(public)/explore/[schoolId]/vehicles.tsx",
  "src/app/(public)/explore/[schoolId]/packages.tsx",
  "src/app/(public)/track/[shareToken].tsx",
  "src/app/(app)/checkout/[schoolId]/payment.tsx",
  "src/app/(app)/checkout/[schoolId]/review.tsx",
  "src/app/(app)/checkout/[schoolId]/result.tsx",
  "src/app/(app)/support.tsx",
  "src/app/(app)/student/explore/index.tsx",
  "src/app/(app)/school/(tabs)/instructors/[instructorId].tsx",
  "src/app/(app)/unsupported-role.tsx",
].forEach(requireFile);

requireText(
  "src/app/_layout.tsx",
  '<Stack.Protected guard={!isAuthenticated}>',
  "Authentication routes must be unavailable after sign-in",
);
requireText(
  "src/features/auth/role-route-guard.tsx",
  'pathname: "/login", params: { returnTo }',
  "Protected route trees must preserve their return destination",
);
requireText(
  "src/app/(app)/checkout/_layout.tsx",
  'allowedRoles={["learner"]}',
  "Checkout must be a learner-owned sibling of student tabs",
);
requireText(
  "src/app/(app)/checkout/[schoolId]/result.tsx",
  'pathname: "/support"',
  "Payment help must open outside every tab navigator",
);
if (
  source("src/app/(app)/checkout/[schoolId]/result.tsx").includes(
    '"/student/profile/',
  )
) {
  failures.push("Checkout must not push screens owned by the Profile tab.");
}
[
  "src/app/(app)/student/_layout.tsx",
  "src/app/(app)/instructor/_layout.tsx",
  "src/app/(app)/school/_layout.tsx",
  "src/app/(app)/checkout/_layout.tsx",
  "src/app/(app)/unsupported-role.tsx",
].forEach((path) =>
  requireText(path, "<RoleRouteGuard", "Protected trees must share one guard"),
);
[
  "src/app/(app)/student/_layout.tsx",
  "src/app/(app)/instructor/_layout.tsx",
  "src/app/(app)/school/(tabs)/_layout.tsx",
].forEach((path) =>
  requireText(
    path,
    "popToTopOnBlur: true",
    "Tab navigators must clear stale nested routes after blur",
  ),
);
[
  "src/app/(app)/student/_layout.tsx",
  "src/app/(app)/instructor/_layout.tsx",
  "src/app/(app)/school/(tabs)/_layout.tsx",
].forEach((path) =>
  requireText(
    path,
    "router.replace(tabRoot)",
    "Tab presses must target canonical tab roots",
  ),
);
requireText(
  "src/features/auth/navigation.ts",
  'guardian: "/unsupported-role"',
  "Legacy guardian accounts need an explicit destination",
);
requireText(
  "src/features/auth/navigation.ts",
  'learner: ["/student", "/checkout", "/support"]',
  "Learners must be able to return to app-level support after login",
);
requireText(
  "src/features/auth/navigation.ts",
  'instructor: ["/instructor", "/support"]',
  "Instructors must be able to return to app-level support after login",
);
requireText(
  "src/features/auth/navigation.ts",
  'admin: "/unsupported-role"',
  "Admin accounts need an explicit destination",
);

const routingSources = [
  "src/features/school-discovery/screens/explore-screen.tsx",
  "src/features/school-discovery/screens/school-detail-screen.tsx",
  "src/features/school-discovery/screens/package-selection-screen.tsx",
].map(source);

if (routingSources.some((contents) => contents.includes("publicMarketplace"))) {
  failures.push(
    "Marketplace feature screens must not branch on duplicated route ownership.",
  );
}

if (routingSources.some((contents) => contents.includes('/school/instructor/'))) {
  failures.push("School instructor details must stay under /school/instructors.");
}

if (failures.length) {
  console.error(failures.map((failure) => `- ${failure}`).join("\n"));
  process.exit(1);
}

console.log("Routing invariants verified.");
