import type { ReactNode } from "react";
import { Container } from "@/components/ui/Container";

interface PageShellProps {
  title: string;
  children?: ReactNode;
}

/** İskelet sayfalar için ortak başlık + içerik alanı. */
export function PageShell({ title, children }: PageShellProps) {
  return (
    <Container className="py-section lg:py-section-lg">
      <h1 className="text-3xl font-medium tracking-tight lg:text-5xl">{title}</h1>
      {children ? <div className="mt-10">{children}</div> : null}
    </Container>
  );
}
