import type { ReactNode } from "react";

interface ContainerProps {
  children: ReactNode;
  className?: string;
}

/** Sitenin ortak yatay boşluklarını ve maksimum genişliğini uygular. */
export function Container({ children, className = "" }: ContainerProps) {
  return (
    <div className={`mx-auto w-full max-w-site px-gutter lg:px-gutter-lg ${className}`}>
      {children}
    </div>
  );
}
