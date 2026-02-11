import type { JobType } from '../types';

const JOB_TYPE_LABELS: Record<JobType, string> = {
  full_time: 'Full Time',
  part_time: 'Part Time',
  contract: 'Contract',
  internship: 'Internship',
};

interface Props {
  type: JobType;
}

export default function JobTypeBadge({ type }: Props) {
  return (
    <span className="inline-block rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
      {JOB_TYPE_LABELS[type]}
    </span>
  );
}

export { JOB_TYPE_LABELS };
