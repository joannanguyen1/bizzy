import { useState } from "react";

export function useSafari(): boolean {
  const [isSafari] = useState(() => {
    if (typeof window === 'undefined') return false;
    const userAgent = navigator.userAgent;
    return /^((?!chrome|android).)*safari/i.test(userAgent);
  });

  return isSafari;
}

