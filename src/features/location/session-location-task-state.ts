export type ActiveLocationTaskTarget =
  | { role: "learner"; participantId: string; sessionId: string }
  | { role: "instructor"; sessionId: string };

let activeTarget: ActiveLocationTaskTarget | null = null;

export function setActiveLocationTaskTarget(target: ActiveLocationTaskTarget) {
  activeTarget = target;
}

export function getActiveLocationTaskTarget() {
  return activeTarget;
}

export function clearActiveLocationTaskTarget() {
  activeTarget = null;
}
