"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { formatPrice } from "@/lib/format";

const PROPERTY_TYPES = ["Apartment", "Villa", "Commercial"];
const BUDGETS = [5000000, 10000000, 20000000, 30000000, 50000000, 75000000, 100000000];
const FILTER_KEYS = ["location", "propertyType", "minPrice", "maxPrice", "sort"];

export default function ProjectFilters({ locations }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const readValues = () => {
    const values = {};
    FILTER_KEYS.forEach((key) => {
      values[key] = searchParams.get(key) || "";
    });
    return values;
  };

  const [values, setValues] = useState(readValues);

  useEffect(() => {
    setValues(readValues());
  }, [searchParams]);

  const goTo = (params) => {
    const query = params.toString();
    startTransition(() => {
      router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
    });
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues({ ...values, [name]: value });

    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(name, value);
    } else {
      params.delete(name);
    }
    params.delete("page");
    goTo(params);
  };

  const handleClear = () => {
    setValues(Object.fromEntries(FILTER_KEYS.map((key) => [key, ""])));
    goTo(new URLSearchParams());
  };

  const hasFilters = FILTER_KEYS.some((key) => values[key]);

  return (
    <div className="border border-white/10 bg-surface/60 p-5 sm:p-6">
      <div className="grid gap-x-6 gap-y-6 sm:grid-cols-2 lg:grid-cols-5">
        <div>
          <label htmlFor="filter-location" className="field-label">
            Location
          </label>
          <select
            id="filter-location"
            name="location"
            value={values.location}
            onChange={handleChange}
            className="field-input"
          >
            <option value="">All locations</option>
            {locations.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="filter-type" className="field-label">
            Property type
          </label>
          <select
            id="filter-type"
            name="propertyType"
            value={values.propertyType}
            onChange={handleChange}
            className="field-input"
          >
            <option value="">All types</option>
            {PROPERTY_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="filter-min" className="field-label">
            Min budget
          </label>
          <select
            id="filter-min"
            name="minPrice"
            value={values.minPrice}
            onChange={handleChange}
            className="field-input"
          >
            <option value="">No minimum</option>
            {BUDGETS.map((budget) => (
              <option key={budget} value={budget}>
                {formatPrice(budget)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="filter-max" className="field-label">
            Max budget
          </label>
          <select
            id="filter-max"
            name="maxPrice"
            value={values.maxPrice}
            onChange={handleChange}
            className="field-input"
          >
            <option value="">No maximum</option>
            {BUDGETS.map((budget) => (
              <option key={budget} value={budget}>
                {formatPrice(budget)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="filter-sort" className="field-label">
            Sort by
          </label>
          <select
            id="filter-sort"
            name="sort"
            value={values.sort}
            onChange={handleChange}
            className="field-input"
          >
            <option value="">Newest first</option>
            <option value="price_asc">Price: low to high</option>
            <option value="price_desc">Price: high to low</option>
          </select>
        </div>
      </div>

      {(hasFilters || isPending) && (
        <div className="mt-6 flex items-center justify-between gap-4">
          <p className="text-[13px] text-muted" aria-live="polite">
            {isPending ? "Updating results..." : ""}
          </p>
          {hasFilters && (
            <button type="button" onClick={handleClear} className="btn btn-gray !h-10">
              Clear filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
