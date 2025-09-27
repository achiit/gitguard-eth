import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, isValid, parseISO } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string | number | any | null | undefined): string {
  if (!date) return "N/A";
  
  let dateObj: Date;
  
  if (typeof date === 'string') {
    // Handle string date (ISO format)
    dateObj = parseISO(date);
  } else if (date instanceof Date) {
    // Already a Date object
    dateObj = date;
  } else if (typeof date === 'number') {
    // Handle timestamp as number
    dateObj = new Date(date);
  } else if (date && typeof date === 'object') {
    // Handle Firestore Timestamp object
    // Firestore timestamps have seconds and nanoseconds properties
    if (date.seconds !== undefined && date.nanoseconds !== undefined) {
      // Convert seconds to milliseconds and add nanoseconds converted to milliseconds
      const milliseconds = date.seconds * 1000 + date.nanoseconds / 1000000;
      dateObj = new Date(milliseconds);
    } else if (date.toDate && typeof date.toDate === 'function') {
      // Handle Firestore Timestamp objects that have toDate() method
      dateObj = date.toDate();
    } else {
      return "Invalid date";
    }
  } else {
    return "Invalid date";
  }
  
  // Check if the date is valid
  if (!isValid(dateObj)) {
    return "Invalid date";
  }
  
  return format(dateObj, "MMM d, yyyy");
}
export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}