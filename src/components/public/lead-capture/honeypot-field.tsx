import type { UseFormRegisterReturn } from "react-hook-form";

// Off-screen (not display:none, which some bots skip) — invisible and
// unreachable by keyboard for real users, but still auto-filled by naive
// form-filling bots.
export function HoneypotField(props: UseFormRegisterReturn) {
  return (
    <input
      type="text"
      tabIndex={-1}
      autoComplete="off"
      aria-hidden="true"
      className="absolute top-auto left-[-9999px] h-px w-px overflow-hidden"
      {...props}
    />
  );
}
