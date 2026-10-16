import { useState } from "react";

const letterNumberFilter = /[a-zA-Z0-9]/;
const filterCode = (c: string) => letterNumberFilter.test(c);

export const Splash = () => {
  const [code, setCode] = useState("");
  const [warning, setWarning] = useState("");

  const handleConnect = () => {
    if (code.length === 0) {
      setWarning("Enter a code.");
    } else {
      window.location.href = `/client#${code}`;
    }
  };

  return (
    <div className="mx-auto flex h-screen max-w-90 flex-col items-center justify-center gap-5">
      <div className="flex flex-col items-center gap-4 rounded bg-blue-900 p-4">
        <div className="text-xl">Join a game</div>
        <input
          type="text"
          className="rounded bg-slate-50 p-2 text-center text-black"
          value={code}
          onChange={(e) =>
            setCode(
              e.currentTarget.value
                .split("")
                .slice(0, 10)
                .filter(filterCode)
                .join("")
                .toUpperCase(),
            )
          }
        />
        {warning && (
          <div className="animate-pulse self-stretch bg-red-950 text-center">
            {warning}
          </div>
        )}
        <button
          className="cursor-pointer self-stretch rounded-sm bg-amber-300 p-2 text-black"
          onClick={handleConnect}
        >
          Connect
        </button>
      </div>
      <a href="/host">Host a game</a>
    </div>
  );
};
