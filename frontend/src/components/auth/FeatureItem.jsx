export default function FeatureItem({ icon: Icon, label }) {
  return (
    <li className="flex items-center gap-3">
      <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-white/10">
        <Icon className="h-4 w-4 text-flow" aria-hidden="true" />
      </span>
      <span className="text-sm text-white/80">{label}</span>
    </li>
  );
}
