import type { NoteCard } from "@/lib/lovora.functions";

export function PhoneHome({
  note,
  caption,
  empty,
}: {
  note: NoteCard | null;
  caption: string;
  empty: string;
}) {
  return (
    <div className="mx-auto w-full max-w-[320px]">
      <p className="mb-3 text-center text-sm font-medium text-muted">{caption}</p>
      <div className="rounded-[2.4rem] bg-phone p-2.5 shadow-[0_24px_50px_rgb(26_46_42/0.22)]">
        <div className="wallpaper relative aspect-[9/17] overflow-hidden rounded-[1.9rem]">
          <div className="absolute inset-x-0 top-2 flex justify-center">
            <div className="h-5 w-24 rounded-full bg-phone/80" />
          </div>
          <div className="absolute inset-x-4 top-12">
            {note ? (
              <div className="note-paper rotate-[-2deg] rounded-sm px-4 pb-5 pt-3">
                <img src={note.image} alt="A note they sent you" className="h-auto w-full" />
              </div>
            ) : (
              <div className="note-paper rotate-[-2deg] rounded-sm px-5 py-8 text-center">
                <p className="font-hand text-3xl leading-tight text-ink/80">{empty}</p>
              </div>
            )}
          </div>
          <div className="absolute inset-x-4 bottom-5 grid grid-cols-4 gap-3">
            {["Photos", "Camera", "Mail", "Maps"].map((label) => (
              <div key={label} className="flex flex-col items-center gap-1">
                <div className="h-11 w-11 rounded-2xl bg-surface/85 shadow-sm" />
                <span className="text-[10px] font-medium text-ink/70">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
