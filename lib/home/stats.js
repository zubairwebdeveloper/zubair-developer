export function buildPublicStats({ projectCount, serviceCount, postCount }) {
  return [
    {
      id: "projects",
      value: projectCount,
      label: projectCount === 1 ? "Published project" : "Published projects",
    },
    {
      id: "services",
      value: serviceCount,
      label: serviceCount === 1 ? "Service" : "Services",
    },
    {
      id: "posts",
      value: postCount,
      label: postCount === 1 ? "Published article" : "Published articles",
    },
  ].filter((stat) => Number.isFinite(stat.value) && stat.value > 0);
}
