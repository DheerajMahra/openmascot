import { AppHeader } from "@/components/layout/app-header";
import { StartingPoints } from "@/features/start/components/starting-points";
import { YourMascots } from "@/features/start/components/your-mascots";

/** Landing screen: open a saved mascot or pick a starting point. */
export const StartScreen = () => (
  <>
    <AppHeader>
      <span className="ml-auto text-[13px] text-muted">Open-source pixel mascot maker</span>
    </AppHeader>

    <main className="mx-auto flex w-full max-w-[1040px] flex-col gap-8 px-6 pt-9 pb-12">
      <div className="flex flex-col gap-1.5">
        <h1 className="m-0 text-[28px] font-semibold tracking-tight">Pick a starting point</h1>
        <p className="m-0 max-w-[60ch] text-[15px] text-muted">
          Start from a sample and change what you like, or draw from scratch. Everything stays in
          this browser.
        </p>
      </div>
      <YourMascots />
      <StartingPoints />
    </main>
  </>
);
