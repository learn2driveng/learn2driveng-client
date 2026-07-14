# Readiness Assessment Architecture

## Product decision

Readiness assessments are school-managed learning checks, not certification
exams and not generic trivia. They complement instructor reports and practical
lesson progress by checking whether a learner can apply road knowledge to short
driving scenarios.

The product must never imply that passing an in-app quiz grants an FRSC licence
or proves practical driving competence. Certification and licensing remain with
the appropriate authority.

## Roles and ownership

- A verified school owns its assessment library and assigns checks to learners
  registered with that school.
- A learner can take an assigned assessment, see the score, and review teaching
  explanations.
- The school can see assignment status, scores, and pass/follow-up signals in
  the learner record.
- Instructor access to the same results is a later integration and must follow
  the school's affiliation and learner-data permissions.

## Readiness model

The client shows two distinct signals:

1. **Theory readiness** from completed assessment attempts.
2. **Practical readiness** from lesson progress and instructor reporting.

The current presentation fixture combines them as 40% theory and 60% practical
to avoid overvaluing quiz scores. This weighting is a product default, not a
regulatory standard, and should become server-configurable if retained.

Assessment design principles:

- use road scenarios and decision-making rather than obscure facts;
- keep checks short and focused on one competency;
- provide an explanation for every answer after submission;
- show the passing threshold before the learner starts;
- assign a due date and expose `assigned`, `in_progress`, and `completed` states;
- allow a school to follow up on weak areas rather than treating failure as a
  punishment.

Initial competency areas are road rules, road signs, hazard perception, and
vehicle safety.

## Client structure

```text
src/types/readiness-assessment.ts
  Domain types for learners, definitions, questions, assignments, and attempts

src/sample_data/readiness-assessments.ts
  Presentation fixtures for later API replacement

src/store/readiness-assessment.store.ts
  Temporary Zustand actions for assignment, start, and submission

src/app/(app)/school/(tabs)/learners/
  School learner overview, learner record, and assessment library

src/app/(app)/student/progress/assessments*
  Learner assignment list, briefing, questions, result, and answer review
```

The local store is intentionally shaped around backend resources so it can be
replaced by query/mutation hooks without changing the route responsibilities.

## Later integration contracts

Expected resources:

```text
GET    /schools/:schoolId/learners
GET    /schools/:schoolId/learners/:learnerId
GET    /schools/:schoolId/assessments
POST   /schools/:schoolId/assessment-assignments
GET    /learners/me/assessment-assignments
POST   /assessment-assignments/:assignmentId/attempts
```

The server must enforce school-to-learner registration, school ownership of an
assessment, assignment visibility, attempt immutability after submission, and
role-based access. The server should calculate the authoritative score; the
client-side calculation exists only for the current integration-free slice.

Question authoring, versioning, randomization, retake policies, audit history,
notifications, and regulatory question-bank review are intentionally later
integrations. Published assessment versions must become immutable once assigned
so historical attempts remain explainable.
