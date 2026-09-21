export default function UserAvatar({
  name = "",
}) {
  const words = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  let initials = "";

  if (words.length === 1) {
    initials = words[0]
      .charAt(0)
      .toUpperCase();
  } else {
    initials =
      words[0].charAt(0).toUpperCase() +
      words[words.length - 1]
        .charAt(0)
        .toUpperCase();
  }

  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-500 font-bold text-slate-950">
      {initials}
    </div>
  );
}