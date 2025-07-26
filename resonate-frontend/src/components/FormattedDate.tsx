"use client";

import { useState, useEffect } from 'react';

interface FormattedDateProps {
  date: string | Date;
  options?: Intl.DateTimeFormatOptions;
}

const FormattedDate: React.FC<FormattedDateProps> = ({ date, options }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <span>...</span>;
  }

  const dateObj = new Date(date);
  const formattedDate = dateObj.toLocaleDateString(undefined, options);

  return <span>{formattedDate}</span>;
};

export default FormattedDate;