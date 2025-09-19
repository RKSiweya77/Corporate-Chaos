import { Link } from "react-router-dom";

const CAT = [
  ["Electronics", "/categories"],
  ["Fashion", "/categories"],
  ["Home & Living", "/categories"],
  ["Beauty", "/categories"],
  ["Sports", "/categories"],
  ["Tech", "/categories"],
  ["Accessories", "/categories"],
  ["More", "/categories"],
];

function CategoryScroller() {
  return (
    <nav className="mb-4">
      <div className="d-flex gap-2 overflow-auto pb-2 scroller">
        {CAT.map(([name, url]) => (
          <Link key={name} to={url} className="btn btn-outline-dark btn-sm rounded-pill">
            {name}
          </Link>
        ))}
      </div>
    </nav>
  );
}
export default CategoryScroller;
