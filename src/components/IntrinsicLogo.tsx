type IntrinsicLogoProps = {
  className?: string;
};

export const IntrinsicLogo = ({ className }: IntrinsicLogoProps) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <circle cx="50" cy="50" r="44" fill="#0F172A" />
    <path
      d="M50 20L56.9 38.2L76 40.1L61.5 52.7L65.9 71.4L50 61.4L34.1 71.4L38.5 52.7L24 40.1L43.1 38.2L50 20Z"
      fill="#F59E0B"
      stroke="#FEF3C7"
      strokeWidth="2.5"
      strokeLinejoin="round"
    />
  </svg>
);
