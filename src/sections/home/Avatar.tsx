export default function Avatar({ char }: { char: string }) {
  return (
    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-accent text-accent-foreground font-bold flex items-center justify-center text-sm sm:text-base shadow-sm shrink-0 select-none">
      {char || "?"}
    </div>
  );
}