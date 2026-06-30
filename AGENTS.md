# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v56.0.0/ before writing any code.

# Development server

After UI implementation, run a temporary visual QA session and capture a rendered snapshot. Compare typography, font colors, padding, margins, alignment, and overall fidelity against the Stitch reference. Fix visible discrepancies, then stop the development server before handing off. Do not leave the server running.

# Public marketplace boundary

School discovery is public. Location consent, school search, school profiles,
instructors, vehicles, ratings, and package browsing must remain accessible
without authentication. Require login only for transactional or personal
actions such as checkout, booking, saving schools, sessions, progress, and
profile data. Public and authenticated discovery routes must reuse feature
screens rather than duplicate UI.

Checkout routes must remain under `(app)/checkout` as siblings of the learner
tabs. Never nest payment or purchase-result screens inside Explore.
