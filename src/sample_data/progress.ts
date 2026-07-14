import type {
  LearnerAssessment,
  LearnerProgressLesson,
  ProgressSkill,
} from "@/types";

export const progressSkills: ProgressSkill[] = [
  {
    id: "vehicle-control",
    name: "Vehicle control",
    progress: 82,
    icon: "steering",
    note: "Smooth starts, braking, and low-speed handling are becoming consistent.",
  },
  {
    id: "road-awareness",
    name: "Road awareness",
    progress: 74,
    icon: "road-variant",
    note: "Mirror checks are improving; keep scanning earlier before turns.",
  },
  {
    id: "parking",
    name: "Parking",
    progress: 58,
    icon: "parking",
    note: "Parallel parking needs two more focused practice sessions.",
  },
];

export const learnerAssessments: LearnerAssessment[] = [
  {
    id: "road-signs",
    title: "Road signs assessment",
    category: "Theory",
    score: 86,
    status: "passed",
    completedAt: "18 June 2026",
    summary: "Strong recognition of priority, warning, and mandatory signs.",
  },
  {
    id: "hazard-awareness",
    title: "Hazard awareness",
    category: "Safety",
    score: 72,
    status: "passed",
    completedAt: "20 June 2026",
    summary: "Good responses in traffic. Keep practising pedestrian crossings.",
  },
  {
    id: "parking-control",
    title: "Parking control",
    category: "Practical",
    score: 58,
    status: "needs_practice",
    completedAt: "22 June 2026",
    summary: "Needs more confidence with reverse angle and parallel parking.",
  },
];

export const learnerProgressLessons: LearnerProgressLesson[] = [
  {
    id: "city-traffic-junctions",
    title: "City traffic and junctions",
    schoolName: "Safety First Motors",
    instructorName: "Tunde Balogun",
    completedAt: "17 June 2026",
    duration: "1 hr 20 min",
    score: 78,
    focusAreas: ["Lane discipline", "Junction approach", "Mirror checks"],
    feedback:
      "Calm vehicle control in traffic. Practise earlier mirror checks before changing lanes.",
  },
  {
    id: "parking-basics",
    title: "Parking basics",
    schoolName: "Safety First Motors",
    instructorName: "Tunde Balogun",
    completedAt: "14 June 2026",
    duration: "1 hr",
    score: 64,
    focusAreas: ["Reverse parking", "Steering control", "Observation"],
    feedback:
      "Good patience and control. Needs more repetition on reverse angle positioning.",
  },
  {
    id: "road-sign-practice",
    title: "Road signs and right of way",
    schoolName: "Safety First Motors",
    instructorName: "Tunde Balogun",
    completedAt: "12 June 2026",
    duration: "1 hr",
    score: 86,
    focusAreas: ["Road signs", "Right of way", "Hazard response"],
    feedback:
      "Strong sign recognition and safer decision-making at minor intersections.",
  },
];

export function getProgressLessonById(lessonId: string | undefined) {
  return learnerProgressLessons.find((lesson) => lesson.id === lessonId);
}
