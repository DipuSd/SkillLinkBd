/**
 * HistoryMetricsCards Component
 * 
 * Displays simplified key metrics for history pages.
 * 
 * @param {Object[]} items - List of metric items {label, count, icon}
 */
function HistoryMetricsCards({ items }) {
  return (
    <>
      <div className="grid lg:grid-cols-4 md:grid-cols-2 sm:grid-cols-1 gap-4">
        {items.map((item) => (
          <div className="flex flex-row items-center justify-between shadow-sm rounded-xl border border-gray-200 py-4 px-6 transition-all duration-200">
            <div>
              {/* card title */}
              <h2 className="text-gray-400">{item.label}</h2>
              {/* card metric */}
              <p className="text-[40px]">{item.count}</p>
            </div>
            {/* logo section */}
            <div className="p-2">{item.icon}</div>
          </div>
        ))}
      </div>
    </>
  );
}
export default HistoryMetricsCards;
