type LockLogoProps = {
  className?: string;
};

export const LockLogo = ({ className }: LockLogoProps) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <circle cx="50" cy="50" r="44" fill="#3F2A1A" />
    <rect x="27" y="44" width="46" height="34" rx="8" fill="#FB923C" stroke="#FED7AA" strokeWidth="2.5" />
    <path
      d="M36 44V35C36 27.268 42.268 21 50 21C57.732 21 64 27.268 64 35V44"
      stroke="#FED7AA"
      strokeWidth="5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="50" cy="61" r="5.5" fill="#7C2D12" />
  </svg>
);
