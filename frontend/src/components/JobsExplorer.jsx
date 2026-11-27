import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { FiBriefcase, FiFilter } from "react-icons/fi";
import SearchBar from "./SearchBar";
import FilterPanel from "./FilterPanel";
import JobCard from "./JobCard";
import Pagination from "./Pagination";
import EmptyState from "./EmptyState";
import ErrorState from "./ErrorState";
import { JobCardSkeleton } from "./Skeleton";
import { jobService } from "../services/jobService";
import { useFetch } from "../hooks/useFetch";

const KEYS = [
  "q",
  "location",
  "category",
  "jobType",
  "experienceLevel",
  "minSalary",
  "maxSalary",
  "sort",
  "page",
];

// Search + filters + pagination. State lives in the URL so results are shareable and survive refresh.
export default function JobsExplorer() {
  const [params, setParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);

  const filters = useMemo(
    () =>
      Object.fromEntries(
        KEYS.map((k) => [k, params.get(k) || (k === "sort" ? "newest" : "")]),
      ),
    [params],
  );
  const page = Number(filters.page) || 1;

  const update = (changes, resetPage = true) => {
    const next = new URLSearchParams(params);
    Object.entries({ ...changes, ...(resetPage ? { page: "" } : {}) }).forEach(
      ([k, v]) => (v ? next.set(k, v) : next.delete(k)),
    );
    setParams(next);
  };

  const { data, loading, error, reload } = useFetch(
    () =>
      jobService.list({
        ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)),
        page,
        limit: 9,
      }),
    [params.toString()],
  );

  
  // useEffect(() => window.scrollTo({ top: 0, behavior: 'smooth' }), [page]);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  const activeCount = [
    "category",
    "jobType",
    "experienceLevel",
    "minSalary",
    "maxSalary",
  ].filter((k) => filters[k]).length;
  const clear = () =>
    setParams(new URLSearchParams(filters.q ? { q: filters.q } : {}));

  return (
    <div className="space-y-6">
      <SearchBar
        key={`${filters.q}|${filters.location}`}
        initialQuery={filters.q}
        initialLocation={filters.location}
        onSearch={(v) => update(v)}
      />

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <div>
          <button
            className="btn btn-outline mb-3 w-full lg:hidden"
            onClick={() => setShowFilters((s) => !s)}
            aria-expanded={showFilters}
          >
            <FiFilter /> Filters{activeCount ? ` (${activeCount})` : ""}
          </button>
          <div
            className={`${showFilters ? "block" : "hidden"} lg:sticky lg:top-24 lg:block`}
          >
            <FilterPanel
              filters={filters}
              onChange={(c) => update(c)}
              onReset={clear}
            />
          </div>
        </div>

        <section aria-live="polite">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-500">
              {loading ? (
                "Searching..."
              ) : (
                <>
                  <span className="font-bold text-navy-800">
                    {data?.total ?? 0}
                  </span>{" "}
                  {data?.total === 1 ? "job" : "jobs"} found
                </>
              )}
            </p>
            <select
              className="input !w-auto"
              value={filters.sort}
              onChange={(e) =>
                update({
                  sort: e.target.value === "newest" ? "" : e.target.value,
                })
              }
              aria-label="Sort jobs"
            >
              <option value="newest">Newest first</option>
              <option value="salary">Highest salary</option>
              <option value="oldest">Oldest first</option>
            </select>
          </div>

          {error ? (
            <ErrorState message={error} onRetry={reload} />
          ) : loading ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <JobCardSkeleton key={i} />
              ))}
            </div>
          ) : data.jobs.length === 0 ? (
            <EmptyState
              icon={FiBriefcase}
              title="No jobs match your search"
              message="Try different keywords or clear some filters."
              action={
                <button
                  className="btn btn-primary"
                  onClick={() => setParams(new URLSearchParams())}
                >
                  Reset search
                </button>
              }
            />
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {data.jobs.map((j) => (
                  <JobCard key={j._id} job={j} />
                ))}
              </div>
              <Pagination
                page={data.page}
                pages={data.pages}
                onChange={(p) => update({ page: String(p) }, false)}
              />
            </>
          )}
        </section>
      </div>
    </div>
  );
}
