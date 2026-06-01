import {
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import clsx from 'clsx';
import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  additionalRequirements,
  ageRanges,
  ethnicities,
  roleGenders,
  stageRoles,
  unionOptionLabels,
  unionOptions
} from '../../utils/lookups';
import FilterSection, {
  CheckboxFilterGroup,
  CheckboxFilterOption
} from './FilterSection';
import { countAppliedFilters } from './roleFilters';
import type { RoleFilters } from './roleFilters';

interface RolesFilterDrawerProps {
  draft: RoleFilters;
  onApply: () => void;
  onChange: (next: RoleFilters) => void;
  onClear: () => void;
  onClose: () => void;
  open: boolean;
}

type MultiFilterField =
  | 'genders'
  | 'ageRanges'
  | 'ethnicities'
  | 'unions'
  | 'requirements';

const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])'
].join(',');

const toOptions = (options: readonly string[]): CheckboxFilterOption[] =>
  options.map((value) => ({ value }));

const parsePayValue = (value: string) => {
  const normalized = value.replace(/[$,]/g, '').trim();

  if (!normalized) {
    return undefined;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const getFocusableElements = (container: HTMLDivElement | null) => {
  if (!container) {
    return [];
  }

  return Array.from(container.querySelectorAll<HTMLElement>(focusableSelector))
    .filter((element) => element.offsetParent !== null);
};

const RolesFilterDrawer: React.FC<RolesFilterDrawerProps> = ({
  draft,
  onApply,
  onChange,
  onClear,
  onClose,
  open
}) => {
  const [active, setActive] = useState(false);
  const [rendered, setRendered] = useState(open);
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  const previousOverflowRef = useRef('');
  const titleId = 'roles-filter-drawer-title';

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (open) {
      setRendered(true);
      const frame = window.requestAnimationFrame(() => setActive(true));
      return () => window.cancelAnimationFrame(frame);
    }

    setActive(false);
    const timeout = window.setTimeout(() => setRendered(false), 200);
    return () => window.clearTimeout(timeout);
  }, [open]);

  useEffect(() => {
    if (!rendered) {
      return undefined;
    }

    previousOverflowRef.current = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflowRef.current;
    };
  }, [rendered]);

  useEffect(() => {
    if (!open || !rendered) {
      return undefined;
    }

    const previousFocus = document.activeElement as HTMLElement | null;
    const focusFrame = window.requestAnimationFrame(() => {
      panelRef.current?.focus();
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCloseRef.current();
        return;
      }

      if (event.key !== 'Tab') {
        return;
      }

      const focusable = getFocusableElements(panelRef.current);
      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener('keydown', handleKeyDown);

      if (previousFocus && document.contains(previousFocus)) {
        previousFocus.focus();
      }
    };
  }, [open, rendered]);

  if (!rendered) {
    return null;
  }

  const draftCount = countAppliedFilters(draft);

  const updateMultiFilter = (
    field: MultiFilterField,
    value: string,
    checked: boolean
  ) => {
    const selected = draft[field];
    const nextValues = checked
      ? [...selected, value]
      : selected.filter((selectedValue) => selectedValue !== value);

    onChange({
      ...draft,
      [field]: nextValues
    });
  };

  const updatePayFilter = (field: 'payMin' | 'payMax', value: string) => {
    onChange({
      ...draft,
      [field]: parsePayValue(value)
    });
  };

  const unionFilterOptions = unionOptions.map((option) => ({
    label: unionOptionLabels[option],
    value: option
  }));

  return createPortal(
    <div className="fixed inset-0 z-[1050]">
      <div
        aria-hidden="true"
        className={clsx(
          'absolute inset-0 bg-black/50 transition-opacity duration-200',
          {
            'opacity-0': !active,
            'opacity-100': active
          }
        )}
        onClick={() => onCloseRef.current()}
      />
      <div
        aria-labelledby={titleId}
        aria-modal="true"
        className={clsx(
          'fixed right-0 top-0 flex h-[100dvh] w-full transform flex-col bg-white shadow-2xl transition-transform duration-200 ease-out md:w-[47vw] md:min-w-[400px] md:max-w-[680px]',
          {
            'translate-x-0': active,
            'translate-x-full': !active
          }
        )}
        ref={panelRef}
        role="dialog"
        tabIndex={-1}
      >
        <div className="flex min-h-[76px] flex-shrink-0 items-center justify-between bg-cornflower px-7 text-white md:px-12">
          <h2
            className="m-0 font-montserrat text-2xl font-medium uppercase tracking-[0.08em] !text-white"
            id={titleId}
          >
            Filter Roles
          </h2>
          <button
            aria-label="Close filter roles"
            className="flex h-11 w-11 items-center justify-center rounded-full text-2xl text-white transition-colors hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-cornflower"
            onClick={() => onCloseRef.current()}
            type="button"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-8 md:px-6">
          <div className="space-y-6">
            <div>
              <label
                className="mb-2 block font-montserrat text-xl font-semibold tracking-[0.08em] text-mainFont"
                htmlFor="roles-filter-role-type"
              >
                Role Type
              </label>
              <select
                aria-label="Filter by role type"
                className="h-12 w-full rounded border border-lightGrey bg-white px-3 font-montserrat text-xl text-dark focus:border-mint focus:outline-none focus:ring-1 focus:ring-mint"
                id="roles-filter-role-type"
                onChange={(e) =>
                  onChange({
                    ...draft,
                    roleType: e.target.value
                      ? (e.target.value as RoleFilters['roleType'])
                      : undefined
                  })
                }
                value={draft.roleType || ''}
              >
                <option value="">Select..</option>
                {stageRoles.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <FilterSection
              defaultOpen={draft.genders.length > 0}
              title="Role Gender"
            >
              <CheckboxFilterGroup
                name="role-gender"
                onToggle={(value, checked) =>
                  updateMultiFilter('genders', value, checked)
                }
                options={toOptions(roleGenders)}
                selected={draft.genders}
              />
            </FilterSection>

            <FilterSection
              defaultOpen={draft.ageRanges.length > 0}
              title="Role Age Range"
            >
              <CheckboxFilterGroup
                name="role-age-range"
                onToggle={(value, checked) =>
                  updateMultiFilter('ageRanges', value, checked)
                }
                options={toOptions(ageRanges)}
                selected={draft.ageRanges}
              />
            </FilterSection>

            <FilterSection
              defaultOpen={draft.ethnicities.length > 0}
              title="Ethnicity"
            >
              <CheckboxFilterGroup
                name="role-ethnicity"
                onToggle={(value, checked) =>
                  updateMultiFilter('ethnicities', value, checked)
                }
                options={toOptions(ethnicities)}
                selected={draft.ethnicities}
              />
            </FilterSection>

            <FilterSection
              defaultOpen={draft.unions.length > 0}
              title="Union Status"
            >
              <CheckboxFilterGroup
                name="role-union-status"
                onToggle={(value, checked) =>
                  updateMultiFilter('unions', value, checked)
                }
                options={unionFilterOptions}
                selected={draft.unions}
              />
            </FilterSection>

            <FilterSection
              defaultOpen={draft.requirements.length > 0}
              title="Additional Requirements"
            >
              <CheckboxFilterGroup
                name="role-additional-requirements"
                onToggle={(value, checked) =>
                  updateMultiFilter('requirements', value, checked)
                }
                options={toOptions(additionalRequirements)}
                selected={draft.requirements}
              />
            </FilterSection>

            <div>
              <h3 className="mb-3 font-montserrat text-xl font-semibold tracking-[0.08em] text-mainFont">
                Pay Range
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    className="mb-1 block font-montserrat text-sm font-semibold tracking-[0.04em] text-dark"
                    htmlFor="roles-filter-pay-min"
                  >
                    Minimum
                  </label>
                  <input
                    className="h-12 w-full rounded border border-lightGrey bg-white px-3 font-montserrat text-lg text-dark focus:border-mint focus:outline-none focus:ring-1 focus:ring-mint"
                    id="roles-filter-pay-min"
                    inputMode="numeric"
                    min="0"
                    onChange={(e) => updatePayFilter('payMin', e.target.value)}
                    placeholder="$0"
                    type="number"
                    value={draft.payMin ?? ''}
                  />
                </div>
                <div>
                  <label
                    className="mb-1 block font-montserrat text-sm font-semibold tracking-[0.04em] text-dark"
                    htmlFor="roles-filter-pay-max"
                  >
                    Maximum
                  </label>
                  <input
                    className="h-12 w-full rounded border border-lightGrey bg-white px-3 font-montserrat text-lg text-dark focus:border-mint focus:outline-none focus:ring-1 focus:ring-mint"
                    id="roles-filter-pay-max"
                    inputMode="numeric"
                    min="0"
                    onChange={(e) => updatePayFilter('payMax', e.target.value)}
                    placeholder="$10,000"
                    type="number"
                    value={draft.payMax ?? ''}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          className="flex flex-shrink-0 flex-col items-center border-t border-lightGrey bg-white px-5 pt-8 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]"
          style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
        >
          <button
            className="min-h-[52px] w-full rounded-full bg-salmon px-8 font-montserrat text-xl font-bold uppercase tracking-[0.12em] text-white shadow-lg transition-colors hover:bg-[#cf6f56] focus:outline-none focus:ring-2 focus:ring-salmon focus:ring-offset-2"
            onClick={onApply}
            type="button"
          >
            Apply Filters
          </button>
          <button
            className="mt-4 min-h-[44px] font-montserrat text-base font-bold tracking-[0.08em] text-dark underline focus:outline-none focus:ring-2 focus:ring-mint focus:ring-offset-2"
            onClick={onClear}
            type="button"
          >
            Clear all filters{draftCount > 0 ? ` (${draftCount})` : ''}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default RolesFilterDrawer;
