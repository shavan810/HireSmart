import { initials } from '../utils/format';

const SIZES = { sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-16 w-16 text-lg', xl: 'h-24 w-24 text-2xl' };

export default function Avatar({ name, src, size = 'md', square = false }) {
  const shape = square ? 'rounded-lg' : 'rounded-full';
  if (src) return <img src={src} alt={name || 'Profile'} className={`${SIZES[size]} ${shape} shrink-0 object-cover`} />;
  return (
    <span className={`${SIZES[size]} ${shape} flex shrink-0 items-center justify-center bg-navy-100 font-bold text-navy-700`} aria-hidden="true">
      {initials(name)}
    </span>
  );
}
