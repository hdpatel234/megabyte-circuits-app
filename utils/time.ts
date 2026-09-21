/**
 * Helper utility for dynamic time-based greeting and date formatting
 */

export function getDynamicGreeting(name?: string): string {
  const hour = new Date().getHours();
  let greetingPrefix = 'Good morning';

  if (hour >= 5 && hour < 12) {
    greetingPrefix = 'Good morning';
  } else if (hour >= 12 && hour < 17) {
    greetingPrefix = 'Good afternoon';
  } else if (hour >= 17 && hour < 21) {
    greetingPrefix = 'Good evening';
  } else {
    greetingPrefix = 'Good night';
  }

  const firstName = name ? name.trim().split(' ')[0] : 'Employee';
  return `${greetingPrefix}, ${firstName}`;
}

export function getFormattedDate(): string {
  const now = new Date();
  const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

  const dayName = days[now.getDay()];
  const dateNum = now.getDate();
  const monthName = months[now.getMonth()];
  const year = now.getFullYear();

  return `${dayName} · ${dateNum} ${monthName} ${year}`;
}
