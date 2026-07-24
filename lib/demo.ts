export function isDemoMode(): boolean {
  return process.env.DEMO_MODE === "true";
}

export const DEMO_DISABLED_MESSAGE = "Demo mode — changes aren't saved";
