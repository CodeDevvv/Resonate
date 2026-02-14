import JoinButton from "@/components/shared/JoinButton";

export default function Home() {
  return (
    <main className="pt-37 min-h-[calc(100vh-theme(spacing.17))] flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-4xl sm:text-5xl md:text-8xl font-bold tracking-tight mb-6">
        Your Voice.Your Story.<br />Your Space.
      </h1>
      <p className="text-lg sm:text-xl md:text-xl text-muted-foreground mb-9 max-w-2xl">
        <strong>Resonate</strong> is your private AI-powered voice diary — record, reflect, and rediscover yourself through sound.
      </p>
      <p className="text-base sm:text-lg md:text-lg text-muted-foreground mb-8 max-w-xl">
        Join now — let your thoughts be heard!
      </p>
      <JoinButton />
    </main>
  );
}
