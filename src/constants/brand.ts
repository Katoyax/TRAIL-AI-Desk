/** Existing TRAIL colors, visually consistent with the supplied USTP assets.
 * These are project UI colors, not a claim about official university hex codes.
 */
export const Brand = {
  navy: '#123553',
  blue: '#1E6484',
  gold: '#E6B95F',
  ink: '#172B3A',
  muted: '#526675',
  canvas: '#F7F8FA',
  surface: '#FFFFFF',
  line: '#DCE4EA',
  inputBorder: '#718193',
  pale: '#EAF2F6',
  goldPale: '#FFF4DB',
  success: '#16734C',
  warning: '#87631B',
  error: '#A72B3A',
  disabled: '#526675',
  onNavy: '#CBD8E4',
} as const;

export const DeskSpace = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 } as const;
export const DeskRadius = { input: 12, card: 18, pill: 999 } as const;
