import shared from '../../fonts.config.cjs';

/**
 * Learn2Drive app fonts.
 *
 * - Inter: UI body text and labels
 * - Space Grotesk: display headlines (onboarding, marketing)
 *
 * Load via useAppFonts() in the root layout before rendering screens.
 */
export const fontFamily = shared.fontFamily;

export type FontWeight = keyof typeof fontFamily;
