import { useEffect, useMemo, useState } from "react";
import { MdOutlineWarningAmber, MdClose } from "react-icons/md";

const getWarningKey = (warning) =>
  warning?._id ??
  warning?.id ??
  warning?.metadata?.id ??
  `${warning?.title ?? ""}-${warning?.timeStamp ?? ""}`;

function WarningBanner({ warnings = [], dismissible = false, onDismiss }) {
  const [dismissedKeys, setDismissedKeys] = useState([]);

  useEffect(() => {
    setDismissedKeys((prev) =>
      prev.filter((key) =>
        (warnings ?? []).some((warning) => getWarningKey(warning) === key)
      )
    );
  }, [warnings]);

  const visibleWarnings = useMemo(
    () =>
      (warnings ?? []).filter(
        (warning) => !dismissedKeys.includes(getWarningKey(warning))
      ),
    [warnings, dismissedKeys]
  );

  if (!visibleWarnings.length) {
    return null;
  }

  const handleDismiss = (warning) => {
    const key = getWarningKey(warning);
    setDismissedKeys((prev) => [...prev, key]);
    onDismiss?.(warning);
  };

  return (
    <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 md:p-6 space-y-4">
      <div className="flex items-start gap-3 text-orange-700">
        <div className="p-2 rounded-full bg-orange-100 text-orange-600">
          <MdOutlineWarningAmber size={24} />
        </div>
        <div>
          <h3 className="text-lg md:text-xl font-semibold">
            Account warnings
          </h3>
          <p className="text-base text-orange-600">
            Please review and address the following admin notices.
          </p>
        </div>
      </div>
      <div className="space-y-3">
        {visibleWarnings.map((warning) => {
          const key = getWarningKey(warning);
          return (
            <div
              key={key}
              className="rounded-2xl border border-orange-100 bg-white px-4 py-4 space-y-1 shadow-sm relative"
            >
              <p className="text-base font-semibold text-gray-800 pr-6">
                {warning.title}
              </p>
              <p className="text-sm md:text-base text-gray-600">{warning.body}</p>
              <p className="text-xs text-gray-400">
                {warning.timeStamp
                  ? new Date(warning.timeStamp).toLocaleString()
                  : ""}
              </p>
              {dismissible ? (
                <button
                  type="button"
                  onClick={() => handleDismiss(warning)}
                  className="absolute top-3 right-3 text-gray-400 hover:text-orange-500 transition-colors"
                  aria-label="Dismiss warning"
                >
                  <MdClose size={18} />
                </button>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default WarningBanner;
