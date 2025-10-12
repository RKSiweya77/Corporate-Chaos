export default function EmptyState({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="w-full py-10 text-center text-gray-500">
      <p className="text-lg font-semibold">{title}</p>
      {subtitle ? <p className="mt-1 text-sm">{subtitle}</p> : null}
    </div>
  );
}
