import { Link } from "react-router-dom";

function Pagination() {
  return (
    <nav className="mt-4">
      <ul className="pagination justify-content-center">
        <li className="page-item disabled">
          <Link className="page-link rounded-pill">Previous</Link>
        </li>
        <li className="page-item active">
          <Link className="page-link rounded-pill">1</Link>
        </li>
        <li className="page-item">
          <Link className="page-link rounded-pill">2</Link>
        </li>
        <li className="page-item">
          <Link className="page-link rounded-pill">3</Link>
        </li>
        <li className="page-item">
          <Link className="page-link rounded-pill">Next</Link>
        </li>
      </ul>
    </nav>
  );
}

export default Pagination;
