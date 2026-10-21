import { useEffect, useState } from "react";
import { ImageOff, Loader2 } from "lucide-react";
import { localImageFor } from "../../lib/localMediaCache";
import { cn } from "../../lib/utils";

// Admin-side image that copes with publish delays: shows a spinner
// while loading, prefers this session's local copy of a just-uploaded
// file, and when the public URL isn't live yet (Pages build in
// progress, CDN propagation…) keeps retrying for a couple of minutes
// instead of showing a broken image.

const RETRY_EVERY_MS = 4000;
const MAX_RETRIES = 30;

interface Props {
  src: string | undefined | null;
  alt?: string;
  // Sizing / rounding of the box (the image fills it).
  className?: string;
  imgClassName?: string;
  // Extra box classes until the image is shown (gives the spinner room
  // when the box has no fixed size, e.g. images inside the editor).
  pendingClassName?: string;
}

type State = "loading" | "waiting" | "ok" | "failed";

export function RemoteImage({
  src,
  alt = "",
  className,
  imgClassName = "h-full w-full object-cover",
  pendingClassName,
}: Props) {
  const local = localImageFor(src);
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<State>("loading");

  useEffect(() => {
    setAttempt(0);
    setState("loading");
  }, [src]);

  // After a failed load, wait then retry with a cache-busting URL.
  useEffect(() => {
    if (state !== "waiting") return;
    const timer = window.setTimeout(() => {
      setAttempt((a) => a + 1);
      setState("loading");
    }, RETRY_EVERY_MS);
    return () => window.clearTimeout(timer);
  }, [state]);

  if (!src) return null;
  const url = local ?? (attempt > 0 ? `${src}${src.includes("?") ? "&" : "?"}retry=${attempt}` : src);

  return (
    <span
      className={cn(
        "relative block overflow-hidden bg-surface-100 dark:bg-surface-800",
        className,
        state !== "ok" && pendingClassName,
      )}
    >
      {state !== "failed" && state !== "waiting" && (
        <img
          key={url}
          src={url}
          alt={alt}
          className={cn(imgClassName, "transition-opacity", state === "ok" ? "opacity-100" : "opacity-0")}
          onLoad={() => setState("ok")}
          onError={() => setState(local || attempt >= MAX_RETRIES ? "failed" : "waiting")}
        />
      )}
      {(state === "loading" || state === "waiting") && (
        <span className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-surface-400" />
        </span>
      )}
      {state === "failed" && (
        <span className="absolute inset-0 flex items-center justify-center text-surface-400">
          <ImageOff className="h-5 w-5" />
        </span>
      )}
    </span>
  );
}
