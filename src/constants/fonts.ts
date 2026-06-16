import shared from '../../fonts.config.cjs';

/**
 * Learn2Drive app font — Inter.
 *
 * Inter is optimized for UI screens and small sizes. Used by many modern
 * mobile and web products for clarity and a neutral, professional feel.
 *
 * Load via useAppFonts() in the root layout before rendering screens.
 */
export const fontFamily = shared.fontFamily;

export type FontWeight = keyof typeof fontFamily;
