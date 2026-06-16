import { faCheck, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import clsx from 'clsx';
import React, { useState } from 'react';

export interface CheckboxFilterOption {
  label?: string;
  value: string;
}

interface CheckboxFilterGroupProps {
  name: string;
  onToggle: (value: string, checked: boolean) => void;
  options: CheckboxFilterOption[];
  selected: string[];
}

interface FilterSectionProps {
  children: React.ReactNode;
  defaultOpen?: boolean;
  title: string;
}

export const CheckboxFilterGroup: React.FC<CheckboxFilterGroupProps> = ({
  name,
  onToggle,
  options,
  selected
}) => (
  <div className="flex flex-col gap-2">
    {options.map((option) => {
      const checked = selected.includes(option.value);
      const inputId = `${name}-${option.value}`
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-');

      return (
        <label
          className="flex min-h-[44px] cursor-pointer items-center gap-3 font-montserrat text-base text-dark sm:text-lg"
          htmlFor={inputId}
          key={option.value}
        >
          <input
            checked={checked}
            className="peer sr-only"
            id={inputId}
            onChange={(e) => onToggle(option.value, e.target.checked)}
            type="checkbox"
          />
          <span
            aria-hidden="true"
            className={clsx(
              'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded border bg-white text-lg transition-colors peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-mint peer-focus-visible:ring-offset-2',
              {
                'border-dark text-mint': checked,
                'border-lightGrey text-transparent': !checked
              }
            )}
          >
            {checked && <FontAwesomeIcon icon={faCheck} />}
          </span>
          <span>{option.label || option.value}</span>
        </label>
      );
    })}
  </div>
);

const FilterSection: React.FC<FilterSectionProps> = ({
  children,
  defaultOpen = false,
  title
}) => {
  const [open, setOpen] = useState(defaultOpen);
  const contentId = `filter-section-${title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')}`;

  return (
    <section className="overflow-hidden rounded-lg border border-gold bg-filterCream">
      <button
        aria-controls={contentId}
        aria-expanded={open}
        className="flex min-h-[64px] w-full items-center justify-between gap-4 px-4 text-left font-montserrat text-xl font-semibold tracking-[0.08em] text-mainFont focus:outline-none focus-visible:ring-2 focus-visible:ring-mint focus-visible:ring-inset"
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        <span>{title}</span>
        <FontAwesomeIcon icon={open ? faChevronUp : faChevronDown} />
      </button>
      {open && (
        <div
          className="border-t border-gold px-4 py-4"
          id={contentId}
        >
          {children}
        </div>
      )}
    </section>
  );
};

export default FilterSection;
