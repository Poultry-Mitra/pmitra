
import { PublicHeader } from "./_components/public-header";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <PublicHeader />
      {children}
    </>
  )
}
