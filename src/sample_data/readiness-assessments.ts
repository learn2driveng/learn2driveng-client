import type {
  AssessmentAssignment,
  AssessmentAttempt,
  ReadinessAssessment,
  SchoolLearner,
} from "@/types";

export const schoolLearners: SchoolLearner[] = [
  {
    id: "learner-amara",
    name: "Amara Okeke",
    initials: "AO",
    email: "amara.okeke@example.com",
    phone: "+234 803 410 7782",
    packageName: "Road Ready Starter",
    instructorId: "instructor-grace",
    instructorName: "Grace Okafor",
    joinedAt: "2026-05-28T10:00:00.000Z",
    status: "active",
    completedLessons: 4,
    totalLessons: 6,
    practicalReadiness: 74,
  },
  {
    id: "learner-daniel",
    name: "Daniel Musa",
    initials: "DM",
    email: "daniel.musa@example.com",
    phone: "+234 806 115 9230",
    packageName: "Defensive Driving Pro",
    instructorId: "instructor-john",
    instructorName: "John Adeyemi",
    joinedAt: "2026-06-07T09:30:00.000Z",
    status: "active",
    completedLessons: 2,
    totalLessons: 10,
    practicalReadiness: 48,
  },
  {
    id: "learner-zainab",
    name: "Zainab Bello",
    initials: "ZB",
    email: "zainab.bello@example.com",
    phone: "+234 809 221 4065",
    packageName: "Automatic City Confidence",
    instructorId: "instructor-grace",
    instructorName: "Grace Okafor",
    joinedAt: "2026-04-19T12:20:00.000Z",
    status: "active",
    completedLessons: 6,
    totalLessons: 7,
    practicalReadiness: 86,
  },
  {
    id: "learner-kelvin",
    name: "Kelvin Eze",
    initials: "KE",
    email: "kelvin.eze@example.com",
    phone: "+234 701 884 3902",
    packageName: "Road Ready Starter",
    instructorId: null,
    instructorName: null,
    joinedAt: "2026-07-10T14:00:00.000Z",
    status: "on_hold",
    completedLessons: 0,
    totalLessons: 6,
    practicalReadiness: 12,
  },
];

export const readinessAssessments: ReadinessAssessment[] = [
  {
    id: "assessment-road-signs",
    schoolId: "school-elite-safety",
    title: "Road signs essentials",
    description:
      "Checks recognition of regulatory, warning, and information signs used on Nigerian roads.",
    area: "road_signs",
    durationMinutes: 6,
    passingScore: 70,
    status: "published",
    questions: [
      {
        id: "signs-q1",
        prompt: "What does a red octagonal sign require you to do?",
        scenario: null,
        options: [
          { id: "a", text: "Slow down only" },
          { id: "b", text: "Come to a complete stop" },
          { id: "c", text: "Give way without stopping" },
          { id: "d", text: "No entry for pedestrians" },
        ],
        correctOptionId: "b",
        explanation:
          "The octagonal STOP sign requires a complete stop before proceeding when safe.",
      },
      {
        id: "signs-q2",
        prompt:
          "A triangular sign with a red border usually communicates what?",
        scenario: null,
        options: [
          { id: "a", text: "A warning or hazard ahead" },
          { id: "b", text: "A mandatory instruction" },
          { id: "c", text: "A parking location" },
          { id: "d", text: "A motorway exit" },
        ],
        correctOptionId: "a",
        explanation:
          "Red-bordered triangular signs warn drivers about hazards or changing road conditions.",
      },
      {
        id: "signs-q3",
        prompt: "You see a circular sign showing 50. What does it mean?",
        scenario: "You are entering a busy built-up area.",
        options: [
          { id: "a", text: "Stay above 50 km/h" },
          { id: "b", text: "50 metres to the next junction" },
          { id: "c", text: "Maximum speed is 50 km/h" },
          { id: "d", text: "Only 50 vehicles may enter" },
        ],
        correctOptionId: "c",
        explanation:
          "A number inside a regulatory speed sign is the maximum permitted speed in km/h.",
      },
    ],
  },
  {
    id: "assessment-hazard-awareness",
    schoolId: "school-elite-safety",
    title: "Hazard awareness",
    description:
      "Uses short road scenarios to test observation, safe following distance, and early decisions.",
    area: "hazard_perception",
    durationMinutes: 7,
    passingScore: 75,
    status: "published",
    questions: [
      {
        id: "hazard-q1",
        prompt: "What is the safest first response?",
        scenario:
          "A child is standing near the kerb ahead while a ball rolls into your lane.",
        options: [
          { id: "a", text: "Accelerate past quickly" },
          { id: "b", text: "Sound the horn and maintain speed" },
          { id: "c", text: "Ease off, cover the brake, and prepare to stop" },
          { id: "d", text: "Move into the opposing lane" },
        ],
        correctOptionId: "c",
        explanation:
          "The ball is a strong clue that a child may enter the road, so reduce speed and prepare to stop.",
      },
      {
        id: "hazard-q2",
        prompt: "How should you respond when visibility drops in heavy rain?",
        scenario: null,
        options: [
          { id: "a", text: "Increase following distance and slow smoothly" },
          { id: "b", text: "Use hazard lights and maintain speed" },
          { id: "c", text: "Follow the vehicle ahead more closely" },
          { id: "d", text: "Brake sharply in the lane" },
        ],
        correctOptionId: "a",
        explanation:
          "Lower visibility and grip increase stopping distance, so create more space and reduce speed smoothly.",
      },
      {
        id: "hazard-q3",
        prompt: "Which clue suggests a parked car may pull out?",
        scenario: "You are approaching a row of parked vehicles.",
        options: [
          { id: "a", text: "Its windows are closed" },
          { id: "b", text: "Its front wheels turn toward the road" },
          { id: "c", text: "It is clean" },
          { id: "d", text: "It has a rear number plate" },
        ],
        correctOptionId: "b",
        explanation:
          "Turning front wheels are an early movement clue. Create space and be ready to respond.",
      },
      {
        id: "hazard-q4",
        prompt: "Why should you avoid another vehicle's blind spot?",
        scenario: null,
        options: [
          { id: "a", text: "They may change lanes without seeing you" },
          { id: "b", text: "Your engine will use more fuel" },
          { id: "c", text: "Road signs become harder to read" },
          { id: "d", text: "It prevents overtaking completely" },
        ],
        correctOptionId: "a",
        explanation:
          "If the other driver cannot see you, they may move into your path.",
      },
    ],
  },
  {
    id: "assessment-vehicle-safety",
    schoolId: "school-elite-safety",
    title: "Pre-drive safety check",
    description:
      "Confirms the learner can prepare the vehicle and identify basic safety concerns before moving.",
    area: "vehicle_safety",
    durationMinutes: 5,
    passingScore: 80,
    status: "published",
    questions: [
      {
        id: "safety-q1",
        prompt: "What should be adjusted before starting to drive?",
        scenario: null,
        options: [
          { id: "a", text: "Seat, mirrors, and seat belt" },
          { id: "b", text: "Only the radio volume" },
          { id: "c", text: "The number plate" },
          { id: "d", text: "The rear passenger window" },
        ],
        correctOptionId: "a",
        explanation:
          "Set a safe position, clear mirror view, and correctly worn seat belt before moving.",
      },
      {
        id: "safety-q2",
        prompt:
          "A brake warning light remains on after release. What should you do?",
        scenario: null,
        options: [
          { id: "a", text: "Ignore it for a short trip" },
          { id: "b", text: "Drive faster to clear it" },
          { id: "c", text: "Do not proceed until the cause is checked" },
          { id: "d", text: "Turn off the headlights" },
        ],
        correctOptionId: "c",
        explanation:
          "A persistent brake warning may indicate a critical fault and must be checked before driving.",
      },
      {
        id: "safety-q3",
        prompt: "Why is a walk-around check useful before a lesson?",
        scenario: null,
        options: [
          { id: "a", text: "It warms the engine" },
          { id: "b", text: "It reveals obstacles, tyre issues, or damage" },
          { id: "c", text: "It replaces mirror checks" },
          { id: "d", text: "It guarantees an empty road" },
        ],
        correctOptionId: "b",
        explanation:
          "A quick external check can reveal risks that are difficult to see once seated.",
      },
    ],
  },
];

export const assessmentAssignments: AssessmentAssignment[] = [
  {
    id: "assignment-amara-hazard",
    assessmentId: "assessment-hazard-awareness",
    learnerId: "learner-amara",
    assignedAt: "2026-07-12T09:00:00.000Z",
    dueAt: "2026-07-18T18:00:00.000Z",
    status: "assigned",
    latestAttemptId: null,
  },
  {
    id: "assignment-amara-signs",
    assessmentId: "assessment-road-signs",
    learnerId: "learner-amara",
    assignedAt: "2026-06-17T09:00:00.000Z",
    dueAt: "2026-06-22T18:00:00.000Z",
    status: "completed",
    latestAttemptId: "attempt-amara-signs",
  },
  {
    id: "assignment-daniel-signs",
    assessmentId: "assessment-road-signs",
    learnerId: "learner-daniel",
    assignedAt: "2026-07-10T09:00:00.000Z",
    dueAt: "2026-07-16T18:00:00.000Z",
    status: "in_progress",
    latestAttemptId: null,
  },
  {
    id: "assignment-zainab-safety",
    assessmentId: "assessment-vehicle-safety",
    learnerId: "learner-zainab",
    assignedAt: "2026-07-05T09:00:00.000Z",
    dueAt: "2026-07-12T18:00:00.000Z",
    status: "completed",
    latestAttemptId: "attempt-zainab-safety",
  },
];

export const assessmentAttempts: AssessmentAttempt[] = [
  {
    id: "attempt-amara-signs",
    assignmentId: "assignment-amara-signs",
    answers: { "signs-q1": "b", "signs-q2": "a", "signs-q3": "c" },
    score: 100,
    passed: true,
    completedAt: "2026-06-18T14:20:00.000Z",
  },
  {
    id: "attempt-zainab-safety",
    assignmentId: "assignment-zainab-safety",
    answers: { "safety-q1": "a", "safety-q2": "c", "safety-q3": "d" },
    score: 67,
    passed: false,
    completedAt: "2026-07-11T16:05:00.000Z",
  },
];
