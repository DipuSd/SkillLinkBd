export default function InviteProviderModal({
  provider,
  formData,
  onChange,
  onClose,
  onSubmit,
  isSubmitting,
  error,
}) {
  if (!provider) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl p-6 space-y-4 relative overflow-y-auto max-h-full">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          ×
        </button>
        <div>
          <p className="text-sm text-gray-500">Invite</p>
          <h2 className="text-2xl font-semibold text-gray-900">
            {provider.name}
          </h2>
          <p className="text-gray-500 text-sm">
            This request goes straight to the provider. It won't appear on the
            public job board.
          </p>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-gray-700">
                Job title
              </span>
              <input
                name="title"
                value={formData.title}
                onChange={onChange}
                required
                placeholder="e.g., Fix kitchen wiring"
                className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-gray-700">
                Budget (BDT)
              </span>
              <input
                type="number"
                min={0}
                name="budget"
                value={formData.budget}
                onChange={onChange}
                placeholder="Optional"
                className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </label>
          </div>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-semibold text-gray-700">
              Description
            </span>
            <textarea
              name="description"
              value={formData.description}
              onChange={onChange}
              rows={4}
              required
              placeholder="Describe the scope, materials, schedule expectations..."
              className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white resize-y"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-semibold text-gray-700">
              Preferred date
            </span>
            <input
              type="date"
              name="preferredDate"
              value={formData.preferredDate}
              onChange={onChange}
              className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-semibold text-gray-700">
              Notes (optional)
            </span>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={onChange}
              rows={3}
              placeholder="Any extra requirements or helpful context"
              className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white resize-y"
            />
          </label>
          {error ? (
            <p className="text-sm text-red-500 font-semibold">{error}</p>
          ) : null}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-teal-500 text-white font-semibold hover:opacity-90 disabled:opacity-60"
            >
              {isSubmitting ? "Sending..." : "Send invite"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
