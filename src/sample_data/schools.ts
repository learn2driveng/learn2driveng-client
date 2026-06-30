import type { SchoolDetail, TrainingPackage } from "@/types";

/** Presentation fixtures. Replace with school catalogue API responses. */
export const schoolCatalog: SchoolDetail[] = [
  {
    id: "elite-safety",
    name: "Elite Safety Driving Academy",
    location: "Wuse II, Abuja",
    address: "18 Adetokunbo Crescent, Wuse II, Abuja",
    description:
      "A premium FRSC-verified academy focused on defensive driving, city confidence, and practical road-safety habits.",
    distanceKm: 1.2,
    startingPrice: 45000,
    rating: 4.9,
    reviewCount: 284,
    premium: true,
    instructors: [
      {
        id: "john",
        name: "John Adeyemi",
        experience: "8 years experience",
        rating: 4.9,
      },
      {
        id: "grace",
        name: "Grace Okafor",
        experience: "6 years experience",
        rating: 4.8,
      },
    ],
    vehicles: [
      { id: "corolla", name: "Toyota Corolla", transmission: "Automatic" },
      { id: "yaris", name: "Toyota Yaris", transmission: "Manual" },
    ],
    packages: [
      {
        id: "starter",
        name: "Road Ready Starter",
        description:
          "Core controls, road signs, parking, and supervised city practice.",
        price: 45000,
        sessions: 6,
        duration: "3 weeks",
      },
      {
        id: "defensive",
        name: "Defensive Driving Pro",
        description:
          "Hazard awareness, highway confidence, and emergency manoeuvres.",
        price: 78500,
        sessions: 10,
        duration: "5 weeks",
        featured: true,
      },
    ],
  },
  {
    id: "pro-wheels",
    name: "Pro-Wheels Training",
    location: "Maitama District",
    address: "7 Aguiyi Ironsi Street, Maitama, Abuja",
    description:
      "Patient, practical instruction with flexible weekday and weekend schedules for new drivers.",
    distanceKm: 3.8,
    startingPrice: 38500,
    rating: 4.7,
    reviewCount: 167,
    instructors: [
      {
        id: "amina",
        name: "Amina Bello",
        experience: "7 years experience",
        rating: 4.8,
      },
      {
        id: "emeka",
        name: "Emeka Obi",
        experience: "5 years experience",
        rating: 4.7,
      },
    ],
    vehicles: [
      { id: "civic", name: "Honda Civic", transmission: "Automatic" },
      { id: "accent", name: "Hyundai Accent", transmission: "Manual" },
    ],
    packages: [
      {
        id: "essentials",
        name: "Driving Essentials",
        description:
          "A compact programme for road basics and test preparation.",
        price: 38500,
        sessions: 5,
        duration: "3 weeks",
      },
      {
        id: "complete",
        name: "Complete Driver",
        description:
          "End-to-end instruction with extra practice and mock road tests.",
        price: 69000,
        sessions: 10,
        duration: "5 weeks",
        featured: true,
      },
    ],
  },
  {
    id: "safety-first",
    name: "Safety First Motors",
    location: "Garki Area 11",
    address: "24 Ahmadu Bello Way, Garki, Abuja",
    description:
      "FRSC-verified instruction with a strong focus on calm driving, road awareness, and test readiness.",
    distanceKm: 5.1,
    startingPrice: 42000,
    rating: 4.5,
    reviewCount: 119,
    instructors: [
      {
        id: "tunde",
        name: "Tunde Balogun",
        experience: "9 years experience",
        rating: 4.7,
      },
    ],
    vehicles: [
      { id: "rio", name: "Kia Rio", transmission: "Automatic" },
      { id: "sunny", name: "Nissan Sunny", transmission: "Manual" },
    ],
    packages: [
      {
        id: "confidence",
        name: "City Confidence",
        description:
          "Build everyday confidence in traffic, junctions, and parking.",
        price: 42000,
        sessions: 6,
        duration: "4 weeks",
      },
      {
        id: "advanced",
        name: "Advanced Safety",
        description: "A deeper safety programme for highway and night driving.",
        price: 72000,
        sessions: 10,
        duration: "5 weeks",
        featured: true,
      },
    ],
  },
];

export function getSchoolById(schoolId: string | undefined) {
  return schoolCatalog.find((school) => school.id === schoolId);
}

export function getPackageById(
  schoolId: string | undefined,
  packageId: string | undefined,
) {
  const school = getSchoolById(schoolId);
  if (!school) return undefined;

  const existingPackage = school.packages.find((item) => item.id === packageId);
  if (existingPackage) return existingPackage;

  if (packageId === `${school.id}-professional`) {
    return {
      id: packageId,
      name: "Professional Plan",
      description: "Advanced training for confident, work-ready driving.",
      price: 85000,
      sessions: 20,
      duration: "8 weeks",
      featured: true,
    } satisfies TrainingPackage;
  }

  return undefined;
}
