import logo from './logo.svg';
import './App.css';
import 'bootstrap/dist/css/bootstrap.css';

function App() {
  return (
    <>
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarTogglerDemo01" aria-controls="navbarTogglerDemo01" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarTogglerDemo01">
          <a className="navbar-brand" href="#">Vendorlution</a>
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <a className="nav-link" aria-current="page" href="#">Home</a>
            </li>
            <li className="nav-item">
              <a className="nav-link disabled" aria-disabled="true">Categories</a>
            </li>
          </ul>
        </div>
      </div>
    </nav>

    <main className='mt-4'>
      <div className='container'>
      <div className='row'>
        <div className='col-12 col-md-3 mb-2'>
          <div className="card">
            <img src={logo} className="card-img-top" alt="..."/>
          <div className="card-body">
            <h5 className="card-title">Product title</h5>
          </div>
          <div className='card-footer'> </div>
         </div>
        </div>
       </div>
      </div>
    </main>
    </>
  );
}

export default App;
