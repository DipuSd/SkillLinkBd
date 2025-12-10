import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import ProviderCards from "../../components/ProviderCards";
import { searchProviders } from "../../api/providers";
import {
  createDirectJob,
  getDirectJobs,
  updateDirectJobStatus,
  payForDirectJob,
} from "../../api/directJobs";
import PaymentModal from "../../components/PaymentModal";
import ReportUserModal from "../../components/ReportUserModal";
import { createReport } from "../../api/reports";
import InviteProviderModal from "../../components/InviteProviderModal";
import ReviewModal from "../../components/ReviewModal";
import { createReview } from "../../api/reviews";
const skillOptions = [
  { value: "", label: "All occupations" },
  { value: "electrician", label: "Electrician" },
  { value: "plumber", label: "Plumber" },
  { value: "tutor", label: "Tutor" },
  { value: "carpenter", label: "Carpenter" },
  { value: "tailor", label: "Tailor" },
  { value: "cleaner", label: "Cleaner" },
  { value: "cook", label: "Cook" },
  { value: "acRepairMan", label: "AC Repair Specialist" },
];

const inviteInitialState = {
  title: "",
  description: "",
  budget: "",
  location: "",
  preferredDate: "",
  notes: "",
};

export default function ClientBrowseProviders() {
  const [filters, setFilters] = useState({
    search: "",
    skill: "",
    location: "",
    minRating: "",
    maxRate: "",
    minExperience: "",
    sort: "rating",
  });
  const [inviteTarget, setInviteTarget] = useState(null);
  const [inviteForm, setInviteForm] = useState(inviteInitialState);
  const [paymentJob, setPaymentJob] = useState(null);
  const [reportTarget, setReportTarget] = useState(null);
  const [reviewTarget, setReviewTarget] = useState(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const reviewMutation = useMutation({
    mutationFn: createReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["direct-jobs", "client"] });
      setReviewTarget(null);
      alert("Review submitted successfully!");
    },
    onError: (error) => {
      alert(error.response?.data?.message || "Failed to submit review");
    },
  });

  const providersQuery = useQuery({
    queryKey: ["provider-search", filters],
    queryFn: () =>
      searchProviders({
        search: filters.search || undefined,
        skill: filters.skill || undefined,
        location: filters.location || undefined,
        minRating: filters.minRating || undefined,
        maxHourlyRate: filters.maxRate || undefined,
        minExperience: filters.minExperience || undefined,
        sort: filters.sort,
      }),
  });

  const directJobsQuery = useQuery({
    queryKey: ["direct-jobs", "client"],
    queryFn: () => getDirectJobs({ scope: "client" }),
  });

  const inviteMutation = useMutation({
    mutationFn: createDirectJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["direct-jobs", "client"] });
      setInviteForm(inviteInitialState);
      setInviteTarget(null);
    },
  });

  const cancelMutation = useMutation({
    mutationFn: updateDirectJobStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["direct-jobs", "client"] });
    },
  });

  const payMutation = useMutation({
    mutationFn: payForDirectJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["direct-jobs", "client"] });
      setPaymentJob(null);
      alert("Payment successful! Thank you.");
    },
    onError: (error) => {
      alert(error.response?.data?.message || "Payment failed.");
    },
  });

  const reportMutation = useMutation({
    mutationFn: createReport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      setReportTarget(null);
      alert("Report submitted successfully.");
    },
  });

  const providers = providersQuery.data?.providers ?? [];
  const directJobs = directJobsQuery.data?.directJobs ?? [];

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleInviteInput = (event) => {
    const { name, value } = event.target;
    setInviteForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleInviteSubmit = async (event) => {
    event.preventDefault();
    if (!inviteTarget?._id) return;
    await inviteMutation.mutateAsync({
      providerId: inviteTarget._id,
      ...inviteForm,
      budget: inviteForm.budget ? Number(inviteForm.budget) : undefined,
    });
  };

  const pendingInvites = useMemo(
    () =>
      directJobs.filter((job) =>
        ["requested", "in-progress"].includes(job.status)
      ),
    [directJobs]
  );

  const activeProviderMap = useMemo(() => {
    const map = {};
    if (!directJobs) return map;
    directJobs.forEach((job) => {
      if (
        ["requested", "in-progress"].includes(job.status) &&
        job.provider?._id
      ) {
        map[job.provider._id] = job.status;
      }
    });
    return map;
  }, [directJobs]);

  const historyInvites = useMemo(
    () =>
      directJobs.filter((job) =>
        ["completed", "declined", "cancelled"].includes(job.status)
      ),
    [directJobs]
  );

  return (
    <div className="py-2 overflow-y-auto md:px-6 lg:px-20 mt-2 space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Discover Providers</h1>
        <p className="text-gray-500">
          Search the entire provider network, chat instantly, or send a direct
          job invitation.
        </p>
      </header>

      <section className="p-4 rounded-2xl border border-gray-200 bg-white space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="text-sm font-semibold text-gray-600">
              Search
            </label>
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Name, skill, or keyword"
              className="mt-1 w-full rounded-lg bg-gray-100 px-3 py-2 outline-none focus:border focus:border-blue-400 focus:ring-2 focus:ring-blue-300"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-600">
              Occupation
            </label>
            <select
              name="skill"
              value={filters.skill}
              onChange={handleFilterChange}
              className="mt-1 w-full rounded-lg bg-gray-100 px-3 py-2 outline-none focus:border focus:border-blue-400 focus:ring-2 focus:ring-blue-300"
            >
              {skillOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <div>
            <label className="text-sm font-semibold text-gray-600">
              Min rating
            </label>
            <input
              type="number"
              min={0}
              max={5}
              step={0.5}
              name="minRating"
              value={filters.minRating}
              onChange={handleFilterChange}
              className="mt-1 w-full rounded-lg bg-gray-100 px-3 py-2 outline-none focus:border focus:border-blue-400 focus:ring-2 focus:ring-blue-300"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-600">
              Max hourly rate (৳)
            </label>
            <input
              type="number"
              min={0}
              step={100}
              name="maxRate"
              value={filters.maxRate}
              onChange={handleFilterChange}
              className="mt-1 w-full rounded-lg bg-gray-100 px-3 py-2 outline-none focus:border focus:border-blue-400 focus:ring-2 focus:ring-blue-300"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-600">
              Min experience (years)
            </label>
            <input
              type="number"
              min={0}
              max={50}
              name="minExperience"
              value={filters.minExperience}
              onChange={handleFilterChange}
              className="mt-1 w-full rounded-lg bg-gray-100 px-3 py-2 outline-none focus:border focus:border-blue-400 focus:ring-2 focus:ring-blue-300"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-600">
              Sort by
            </label>
            <select
              name="sort"
              value={filters.sort}
              onChange={handleFilterChange}
              className="mt-1 w-full rounded-lg bg-gray-100 px-3 py-2 outline-none focus:border focus:border-blue-400 focus:ring-2 focus:ring-blue-300"
            >
              <option value="rating">Top rated</option>
              <option value="experience">Experience</option>
              <option value="budget">Budget friendly</option>
              <option value="newest">Recently joined</option>
            </select>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-700">
            Providers near you
          </h2>
          <button
            type="button"
            onClick={() => setFilters((prev) => ({ ...prev, search: "", location: "", minRating: "", maxRate: "", minExperience: "", skill: "" }))}
            className="text-sm text-blue-600 font-semibold hover:underline"
          >
            Reset filters
          </button>
        </div>
        {providersQuery.isLoading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-40 rounded-2xl border border-gray-200 bg-gray-50 animate-pulse"
              />
            ))}
          </div>
        ) : providers.length === 0 ? (
          <p className="text-gray-400 text-sm">
            No providers found. Try adjusting the filters.
          </p>
        ) : (
          <div className="flex flex-col lg:flex-row flex-wrap gap-3">
            <ProviderCards
              providers={providers}
              onContact={(provider) =>
                navigate(`/client/provider/${provider._id}`)
              }
              onHire={(provider) => {
                setInviteTarget(provider);
                setInviteForm((prev) => ({
                  ...prev,
                  title: `Work request for ${provider.primarySkill || "job"}`,
                }));
              }}
              contactLabel="View Profile"
              hireLabel="Send Invite"
              activeProviders={activeProviderMap}
            />
          </div>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              Direct invitations
            </h2>
            <p className="text-sm text-gray-500">
              Track every invitation you send outside the job board.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {pendingInvites.length === 0 ? (
            <p className="text-gray-400 text-sm">
              No active invitations yet. Invite a provider to start a job
              privately.
            </p>
          ) : (
            pendingInvites.map((job) => (
              <DirectJobCard
                key={job._id}
                job={job}
                onMessage={() =>
                  navigate(`/client/chat?user=${job.provider?._id}`)
                }
                onCancel={() =>
                  cancelMutation.mutate({
                    directJobId: job._id,
                    action: "cancel",
                  })
                }
                onPay={() => setPaymentJob(job)}
                onReport={() => setReportTarget({
                  jobId: job._id,
                  providerId: job.provider?._id,
                  providerName: job.provider?.name,
                })}
                isCancelling={cancelMutation.isPending}
                showCancel
              />
            ))
          )}
        </div>

        {historyInvites.length ? (
          <div className="space-y-2">
            <h3 className="text-md font-semibold text-gray-700">History</h3>
            {historyInvites.map((job) => (
              <DirectJobCard 
                key={job._id} 
                job={job} 
                onPay={() => setPaymentJob(job)}
                onReport={() => setReportTarget({
                  jobId: job._id,
                  providerId: job.provider?._id,
                  providerName: job.provider?.name,
                })}
                onRate={!job.review ? () => setReviewTarget({
                  id: job._id,
                  title: job.title,
                  userName: job.provider?.name
                }) : undefined}
              />
            ))}
          </div>
        ) : null}
      </section>

      {inviteTarget ? (
        <InviteProviderModal
          provider={inviteTarget}
          formData={inviteForm}
          onChange={handleInviteInput}
          onClose={() => {
            if (inviteMutation.isPending) return;
            setInviteTarget(null);
          }}
          onSubmit={handleInviteSubmit}
          isSubmitting={inviteMutation.isPending}
          error={inviteMutation.error?.response?.data?.message}
        />
      ) : null}

      <PaymentModal
        isOpen={Boolean(paymentJob)}
        onClose={() => setPaymentJob(null)}
        job={paymentJob}
        onPay={(job) => payMutation.mutate({ directJobId: job.id || job._id, amount: job.budget })}
        isProcessing={payMutation.isPending}
      />

      <ReportUserModal
        isOpen={Boolean(reportTarget)}
        onClose={() => {
          if (reportMutation.isPending) return;
          setReportTarget(null);
        }}
        reportedUser={{
          id: reportTarget?.providerId,
          name: reportTarget?.providerName,
        }}
        onSubmit={(data) => {
          reportMutation.mutate({
            ...data,
            reportedUser: reportTarget?.providerId,
            jobId: reportTarget?.jobId,
          });
        }}
        isSubmitting={reportMutation.isPending}
      />

      <ReviewModal
        isOpen={Boolean(reviewTarget)}
        onClose={() => setReviewTarget(null)}
        job={reviewTarget}
        onSubmit={(data) => reviewMutation.mutate({ ...data, jobId: reviewTarget.id })}
        isSubmitting={reviewMutation.isPending}
        error={reviewMutation.error?.response?.data?.message}
      />
    </div>
  );
}

function DirectJobCard({ job, onMessage, onCancel, onPay, onReport, onRate, showCancel, isCancelling }) {
  return (
    <div className="p-4 rounded-2xl border border-gray-200 bg-white flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400 uppercase tracking-wide">
            {job.provider?.name}
          </p>
          <h4 className="text-lg font-semibold text-gray-900">{job.title}</h4>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
              job.status === "completed"
                ? "bg-green-100 text-green-700"
                : job.status === "in-progress"
                ? "bg-blue-100 text-blue-700"
                : job.status === "requested"
                ? "bg-orange-100 text-orange-700"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {job.status.replace("-", " ")}
          </span>
          {job.status === "completed" && job.paymentStatus !== "paid" ? (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-600 border border-orange-200">
              Unpaid
            </span>
          ) : job.status === "completed" && job.paymentStatus === "paid" ? (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-600 border border-green-200">
              Paid
            </span>
          ) : null}
        </div>
      </div>
      <p className="text-sm text-gray-500 line-clamp-3">{job.description}</p>
      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
        {job.budget ? (
          <span className="font-semibold text-green-600">
            Budget: ৳{job.budget}
          </span>
        ) : null}
        {job.location ? <span>{job.location}</span> : null}
        {job.preferredDate ? (
          <span>
            Target date: {new Date(job.preferredDate).toLocaleDateString()}
          </span>
        ) : null}
      </div>
      <div className="flex flex-col sm:flex-row gap-2 pt-2">
        {onMessage ? (
          <button
            type="button"
            onClick={onMessage}
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 font-semibold text-gray-700 hover:bg-green-500 hover:text-white transition-colors"
          >
            Message
          </button>
        ) : null}
        {job.status === "completed" && job.paymentStatus !== "paid" && onPay ? (
          <button
            type="button"
            onClick={onPay}
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 font-semibold bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:opacity-90 transition-opacity"
          >
            Pay Now
          </button>
        ) : null}
        {showCancel ? (
          <button
            type="button"
            onClick={onCancel}
            disabled={isCancelling}
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 font-semibold text-red-600 hover:bg-red-500 hover:text-white transition-colors disabled:opacity-50"
          >
            {isCancelling ? "Cancelling..." : "Cancel invite"}
          </button>
        ) : null}
        {job.status === "completed" && onRate ? (
          <button
            type="button"
            onClick={onRate}
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 font-semibold text-amber-600 hover:bg-amber-500 hover:text-white transition-colors"
          >
            Rate
          </button>
        ) : null}
        {job.status === "completed" && onReport ? (
          <button
            type="button"
            onClick={onReport}
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 font-semibold text-gray-700 hover:bg-red-500 hover:text-white transition-colors"
          >
            Report
          </button>
        ) : null}
      </div>
    </div>
  );
}




