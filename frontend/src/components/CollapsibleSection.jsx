import { useEffect, useState } from 'react'

export default function CollapsibleSection({
  title,
  children,
  defaultOpen = true,
}) {
  const [open, setOpen] = useState(defaultOpen)

  useEffect(() => {
    setOpen(defaultOpen)
  }, [defaultOpen, title])

  return (
    <div className="rounded-2xl bg-white shadow-lg">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between px-6 py-5 text-left"
      >
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        <span className="text-sm font-medium text-gray-500">
          {open ? 'Hide' : 'Show'}
        </span>
      </button>

      {open && <div className="px-6 pb-6">{children}</div>}
    </div>
  )
}