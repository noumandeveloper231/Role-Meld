import { Link, useLocation } from "react-router-dom";

function formatLabel(segment) {
  // remove numbers & special chars, keep letters and spaces
  const cleaned = segment.replace(/[^a-zA-Z-]/g, "");

  // convert slug to words
  return cleaned
    .split("-")
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default function Breadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter(Boolean);

  return (
    <nav className="text-[#999999] mb-4">
      <ol className="flex flex-wrap items-center gap-2">
        <li>
          <Link to="/" className="hover:text-black text-[#999999]">Home</Link>
        </li>

        {pathnames.map((segment, index) => {
          const routeTo = "/" + pathnames.slice(0, index + 1).join("/");
          const isLast = index === pathnames.length - 1;

          return (
            <li key={routeTo} className="flex items-center gap-2">
              <span>›</span>
              {isLast ? (
                <span className="font-medium text-gray-700">
                  {formatLabel(segment)}
                </span>
              ) : (
                <Link
                  to={routeTo}
                  className="hover:text-black text-[#999999]"
                >
                  {formatLabel(segment)}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}