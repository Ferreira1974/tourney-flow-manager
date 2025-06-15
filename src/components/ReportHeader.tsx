
import React from "react";

interface ReportHeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

const ReportHeader = ({ title, subtitle, children }: ReportHeaderProps) => (
  <header className="mb-6 text-center">
    <h1 className="text-3xl font-bold text-blue-700 mb-1">{title}</h1>
    {subtitle && (
      <h2 className="text-xl text-blue-500 font-semibold mb-1">{subtitle}</h2>
    )}
    {children}
  </header>
);

export default ReportHeader;
