import { formatFullAddress } from "@/lib/school/format";
import type { SchoolDetail, TrainingPackage } from "@/types";

const ELITE_SCHOOL_ID = "11111111-1111-4111-8111-111111111101";
const PRO_WHEELS_SCHOOL_ID = "11111111-1111-4111-8111-111111111102";
const SAFETY_FIRST_SCHOOL_ID = "11111111-1111-4111-8111-111111111103";

function buildSchoolDetail(input: {
  id: string;
  name: string;
  city: string;
  state: string;
  addressLine1: string;
  description: string;
  distanceKm: number;
  premium?: boolean;
  rating: number;
  reviewCount: number;
  phone: string;
  email: string;
  latitude: number;
  longitude: number;
  packages: TrainingPackage[];
  instructors: SchoolDetail["instructors"];
  vehicles: SchoolDetail["vehicles"];
}): SchoolDetail {
  const address = formatFullAddress({
    addressLine1: input.addressLine1,
    city: input.city,
    state: input.state,
    country: "Nigeria",
  });
  const startingPrice = Math.min(...input.packages.map((pkg) => pkg.price));

  return {
    id: input.id,
    name: input.name,
    location: address,
    address,
    addressLine1: input.addressLine1,
    city: input.city,
    state: input.state,
    country: "Nigeria",
    phone: input.phone,
    email: input.email,
    latitude: input.latitude,
    longitude: input.longitude,
    description: input.description,
    distanceKm: input.distanceKm,
    startingPrice,
    rating: input.rating,
    reviewCount: input.reviewCount,
    premium: input.premium,
    verificationStatus: "approved",
    instructors: input.instructors,
    vehicles: input.vehicles,
    packages: input.packages,
  };
}

/** Presentation fixtures aligned with server DrivingSchool / Package / Vehicle shapes. */
export const schoolCatalog: SchoolDetail[] = [
  buildSchoolDetail({
    id: ELITE_SCHOOL_ID,
    name: "Elite Safety Driving Academy",
    city: "Abuja",
    state: "FCT",
    addressLine1: "18 Adetokunbo Crescent, Wuse II",
    description:
      "A premium FRSC-verified academy focused on defensive driving, city confidence, and practical road-safety habits.",
    distanceKm: 1.2,
    premium: true,
    rating: 4.9,
    reviewCount: 284,
    phone: "+2348095550188",
    email: "hello@elitesafety.ng",
    latitude: 9.0765,
    longitude: 7.4896,
    instructors: [
      {
        id: "22222222-2222-4222-8222-222222222201",
        firstName: "John",
        lastName: "Adeyemi",
        name: "John Adeyemi",
        experience: "8 years experience",
        rating: 4.9,
      },
      {
        id: "22222222-2222-4222-8222-222222222202",
        firstName: "Grace",
        lastName: "Okafor",
        name: "Grace Okafor",
        experience: "6 years experience",
        rating: 4.8,
      },
    ],
    vehicles: [
      {
        id: "33333333-3333-4333-8333-333333333301",
        make: "Toyota",
        model: "Corolla",
        year: 2022,
        transmissionType: "automatic",
        name: "Toyota Corolla",
      },
      {
        id: "33333333-3333-4333-8333-333333333302",
        make: "Toyota",
        model: "Yaris",
        year: 2021,
        transmissionType: "manual",
        name: "Toyota Yaris",
      },
    ],
    packages: [
      {
        id: "44444444-4444-4444-8444-444444444401",
        schoolId: ELITE_SCHOOL_ID,
        name: "Road Ready Starter",
        description:
          "Core controls, road signs, parking, and supervised city practice.",
        price: 45000,
        currency: "NGN",
        numberOfLessons: 6,
        durationInDays: 21,
        isActive: true,
      },
      {
        id: "44444444-4444-4444-8444-444444444402",
        schoolId: ELITE_SCHOOL_ID,
        name: "Defensive Driving Pro",
        description:
          "Hazard awareness, highway confidence, and emergency manoeuvres.",
        price: 78500,
        currency: "NGN",
        numberOfLessons: 10,
        durationInDays: 35,
        isActive: true,
      },
    ],
  }),
  buildSchoolDetail({
    id: PRO_WHEELS_SCHOOL_ID,
    name: "Pro-Wheels Training",
    city: "Abuja",
    state: "FCT",
    addressLine1: "7 Aguiyi Ironsi Street, Maitama",
    description:
      "Patient, practical instruction with flexible weekday and weekend schedules for new drivers.",
    distanceKm: 3.8,
    rating: 4.7,
    reviewCount: 167,
    phone: "+2348035550142",
    email: "book@prowheels.ng",
    latitude: 9.0889,
    longitude: 7.4951,
    instructors: [
      {
        id: "22222222-2222-4222-8222-222222222211",
        firstName: "Amina",
        lastName: "Bello",
        name: "Amina Bello",
        experience: "7 years experience",
        rating: 4.8,
      },
      {
        id: "22222222-2222-4222-8222-222222222212",
        firstName: "Emeka",
        lastName: "Obi",
        name: "Emeka Obi",
        experience: "5 years experience",
        rating: 4.7,
      },
    ],
    vehicles: [
      {
        id: "33333333-3333-4333-8333-333333333311",
        make: "Honda",
        model: "Civic",
        year: 2020,
        transmissionType: "automatic",
        name: "Honda Civic",
      },
      {
        id: "33333333-3333-4333-8333-333333333312",
        make: "Hyundai",
        model: "Accent",
        year: 2019,
        transmissionType: "manual",
        name: "Hyundai Accent",
      },
    ],
    packages: [
      {
        id: "44444444-4444-4444-8444-444444444411",
        schoolId: PRO_WHEELS_SCHOOL_ID,
        name: "Driving Essentials",
        description:
          "A compact programme for road basics and test preparation.",
        price: 38500,
        currency: "NGN",
        numberOfLessons: 5,
        durationInDays: 21,
        isActive: true,
      },
      {
        id: "44444444-4444-4444-8444-444444444412",
        schoolId: PRO_WHEELS_SCHOOL_ID,
        name: "Complete Driver",
        description:
          "End-to-end instruction with extra practice and mock road tests.",
        price: 69000,
        currency: "NGN",
        numberOfLessons: 10,
        durationInDays: 35,
        isActive: true,
      },
    ],
  }),
  buildSchoolDetail({
    id: SAFETY_FIRST_SCHOOL_ID,
    name: "Safety First Motors",
    city: "Abuja",
    state: "FCT",
    addressLine1: "24 Ahmadu Bello Way, Garki",
    description:
      "FRSC-verified instruction with a strong focus on calm driving, road awareness, and test readiness.",
    distanceKm: 5.1,
    rating: 4.5,
    reviewCount: 119,
    phone: "+2348027781091",
    email: "info@safetyfirst.ng",
    latitude: 9.032,
    longitude: 7.4958,
    instructors: [
      {
        id: "22222222-2222-4222-8222-222222222221",
        firstName: "Tunde",
        lastName: "Balogun",
        name: "Tunde Balogun",
        experience: "9 years experience",
        rating: 4.7,
      },
    ],
    vehicles: [
      {
        id: "33333333-3333-4333-8333-333333333321",
        make: "Kia",
        model: "Rio",
        year: 2021,
        transmissionType: "automatic",
        name: "Kia Rio",
      },
      {
        id: "33333333-3333-4333-8333-333333333322",
        make: "Nissan",
        model: "Sunny",
        year: 2018,
        transmissionType: "manual",
        name: "Nissan Sunny",
      },
    ],
    packages: [
      {
        id: "44444444-4444-4444-8444-444444444421",
        schoolId: SAFETY_FIRST_SCHOOL_ID,
        name: "City Confidence",
        description:
          "Build everyday confidence in traffic, junctions, and parking.",
        price: 42000,
        currency: "NGN",
        numberOfLessons: 6,
        durationInDays: 28,
        isActive: true,
      },
      {
        id: "44444444-4444-4444-8444-444444444422",
        schoolId: SAFETY_FIRST_SCHOOL_ID,
        name: "Advanced Safety",
        description: "A deeper safety programme for highway and night driving.",
        price: 72000,
        currency: "NGN",
        numberOfLessons: 10,
        durationInDays: 35,
        isActive: true,
      },
    ],
  }),
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
      schoolId: school.id,
      name: "Professional Plan",
      description: "Advanced training for confident, work-ready driving.",
      price: 85000,
      currency: "NGN",
      numberOfLessons: 20,
      durationInDays: 56,
      isActive: true,
    } satisfies TrainingPackage;
  }

  return undefined;
}
