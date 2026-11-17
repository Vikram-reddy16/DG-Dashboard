export const NAV = [
  { href: "/", label: "Overview", icon: "overview" },
  { href: "/jobs", label: "Jobs", icon: "jobs" },
  { href: "/applicants", label: "Applicants", icon: "applicants" },
  { href: "/categories", label: "Categories", icon: "categories" },
  { href: "/team", label: "Team", icon: "team" },
];

export function activeNav(pathname) {
  // longest matching prefix wins ("/" only matches exactly)
  let best = NAV[0];
  for (const item of NAV) {
    if (item.href === "/") continue;
    if (pathname === item.href || pathname.startsWith(item.href + "/")) best = item;
  }
  if (pathname === "/") return NAV[0];
  return best;
}
