import type { PixelSceneFrame } from '../components/PixelSceneAnimator';

export interface PixelSceneDefinition {
  readonly poster: string;
  readonly frames: readonly PixelSceneFrame[];
  readonly objectPosition?: string;
}

const landingOpen = '/assets/scenes/landing/frame-01.webp';

export const landingScene: PixelSceneDefinition = {
  poster: '/assets/scenes/landing/poster.webp',
  objectPosition: 'center center',
  frames: [
    { src: landingOpen, durationMs: 2_900 },
    {
      src: '/assets/scenes/landing/frame-02.webp',
      durationMs: 170,
      clipPath: 'inset(29% 72% 63% 21% round 10px)',
      transition: 'cut',
    },
    { src: landingOpen, durationMs: 2_500 },
    {
      src: '/assets/scenes/landing/frame-03.webp',
      durationMs: 170,
      clipPath: 'inset(29% 84% 63% 8% round 10px)',
      transition: 'cut',
    },
    { src: landingOpen, durationMs: 3_400 },
  ],
};

export const arequipaScene: PixelSceneDefinition = {
  poster: '/assets/scenes/cities/arequipa/poster.webp',
  objectPosition: 'center center',
  frames: [
    { src: '/assets/scenes/cities/arequipa/frame-01.webp', durationMs: 4_800 },
    {
      src: '/assets/scenes/cities/arequipa/frame-02.webp',
      durationMs: 220,
      clipPath: 'inset(64% 64% 15% 10% round 8px)',
      transition: 'cut',
    },
    { src: '/assets/scenes/cities/arequipa/frame-01.webp', durationMs: 6_200 },
    {
      src: '/assets/scenes/cities/arequipa/frame-02.webp',
      durationMs: 190,
      clipPath: 'inset(32% 22% 50% 61% round 8px)',
      transition: 'cut',
    },
    { src: '/assets/scenes/cities/arequipa/frame-01.webp', durationMs: 4_500 },
  ],
};

export const tromsoScene: PixelSceneDefinition = {
  poster: '/assets/scenes/cities/tromso/poster.webp',
  objectPosition: 'center center',
  frames: [
    { src: '/assets/scenes/cities/tromso/frame-01.webp', durationMs: 2_800 },
    {
      src: '/assets/scenes/cities/tromso/frame-02.webp',
      durationMs: 5_200,
      clipPath: 'inset(0 18% 78% 28%)',
      maskImage: 'linear-gradient(to bottom, #000 0%, #000 50%, transparent 92%)',
      transition: 'blend',
    },
    { src: '/assets/scenes/cities/tromso/frame-01.webp', durationMs: 1_400 },
  ],
};
