
import { PublicHeader } from "./_components/public-header";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />
      {children}
    </div>
  )
}
