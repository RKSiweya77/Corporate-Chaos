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
        <h3>Latest Products <a href = '#' className='float-end btn btn-sm btn-dark '>View All Products<i class="fa-solid fa-arrow-right-long "></i></a></h3>  
      <div className='row'>
         {/*Product Box*/}
        <div className='col-12 col-md-3 mb-4'>
          <div className="card shadow">
            <img src={logo} className="card-img-top" alt="..."/>
          <div className="card-body">
            <h4 className="card-title">Product title</h4>
            <h5 className="card-title">Price: <span className='text-muted' >R 500</span></h5>
          </div>
          <div className='card-footer'>
            <button title="Add to Cart" className='btn btn-dark btn-sm'><i className="fa-solid fa-cart-arrow-down fa-2x"></i></button>
            <button title="Add to Wishlist" className='btn btn-danger btn-sm ms-2'><i className="fa-solid fa-heart fa-2x"></i></button>
          </div>
         </div>
        </div>
        {/*Product Box End*/}
         {/*Product Box*/}
        <div className='col-12 col-md-3 mb-4'>
          <div className="card shadow">
            <img src={logo} className="card-img-top" alt="..."/>
          <div className="card-body">
            <h4 className="card-title">Product title</h4>
            <h5 className="card-title">Price: <span className='text-muted' >R 500</span></h5>
          </div>
          <div className='card-footer'>
            <button title="Add to Cart" className='btn btn-dark btn-sm'><i className="fa-solid fa-cart-arrow-down fa-2x"></i></button>
            <button title="Add to Wishlist" className='btn btn-danger btn-sm ms-2'><i className="fa-solid fa-heart fa-2x"></i></button>
          </div>
         </div>
        </div>
        {/*Product Box End*/}
         {/*Product Box*/}
        <div className='col-12 col-md-3 mb-4'>
          <div className="card shadow">
            <img src={logo} className="card-img-top" alt="..."/>
          <div className="card-body">
            <h4 className="card-title">Product title</h4>
            <h5 className="card-title">Price: <span className='text-muted' >R 500</span></h5>
          </div>
          <div className='card-footer'>
            <button title="Add to Cart" className='btn btn-dark btn-sm'><i className="fa-solid fa-cart-arrow-down fa-2x"></i></button>
            <button title="Add to Wishlist" className='btn btn-danger btn-sm ms-2'><i className="fa-solid fa-heart fa-2x"></i></button>
          </div>
         </div>
        </div>
        {/*Product Box End*/}
         {/*Product Box*/}
        <div className='col-12 col-md-3 mb-4'>
          <div className="card shadow">
            <img src={logo} className="card-img-top" alt="..."/>
          <div className="card-body">
            <h4 className="card-title">Product title</h4>
            <h5 className="card-title">Price: <span className='text-muted' >R 500</span></h5>
          </div>
          <div className='card-footer'>
            <button title="Add to Cart" className='btn btn-dark btn-sm'><i className="fa-solid fa-cart-arrow-down fa-2x"></i></button>
            <button title="Add to Wishlist" className='btn btn-danger btn-sm ms-2'><i className="fa-solid fa-heart fa-2x"></i></button>
          </div>
         </div>
        </div>
        {/*Product Box End*/}
        {/*Product Box*/}
        <div className='col-12 col-md-3 mb-4'>
          <div className="card shadow">
            <img src={logo} className="card-img-top" alt="..."/>
          <div className="card-body">
            <h4 className="card-title">Product title</h4>
            <h5 className="card-title">Price: <span className='text-muted' >R 500</span></h5>
          </div>
          <div className='card-footer'>
            <button title="Add to Cart" className='btn btn-dark btn-sm'><i className="fa-solid fa-cart-arrow-down fa-2x"></i></button>
            <button title="Add to Wishlist" className='btn btn-danger btn-sm ms-2'><i className="fa-solid fa-heart fa-2x"></i></button>
          </div>
         </div>
        </div>
        {/*Product Box End*/}
        {/*Product Box*/}
        <div className='col-12 col-md-3 mb-4'>
          <div className="card shadow">
            <img src={logo} className="card-img-top" alt="..."/>
          <div className="card-body">
            <h4 className="card-title">Product title</h4>
            <h5 className="card-title">Price: <span className='text-muted' >R 500</span></h5>
          </div>
          <div className='card-footer'>
            <button title="Add to Cart" className='btn btn-dark btn-sm'><i className="fa-solid fa-cart-arrow-down fa-2x"></i></button>
            <button title="Add to Wishlist" className='btn btn-danger btn-sm ms-2'><i className="fa-solid fa-heart fa-2x"></i></button>
          </div>
         </div>
        </div>
        {/*Product Box End*/}
        {/*Product Box*/}
        <div className='col-12 col-md-3 mb-4'>
          <div className="card shadow">
            <img src={logo} className="card-img-top" alt="..."/>
          <div className="card-body">
            <h4 className="card-title">Product title</h4>
            <h5 className="card-title">Price: <span className='text-muted' >R 500</span></h5>
          </div>
          <div className='card-footer'>
            <button title="Add to Cart" className='btn btn-dark btn-sm'><i className="fa-solid fa-cart-arrow-down fa-2x"></i></button>
            <button title="Add to Wishlist" className='btn btn-danger btn-sm ms-2'><i className="fa-solid fa-heart fa-2x"></i></button>
          </div>
         </div>
        </div>
        {/*Product Box End*/}
        {/*Product Box*/}
        <div className='col-12 col-md-3 mb-4'>
          <div className="card shadow">
            <img src={logo} className="card-img-top" alt="..."/>
          <div className="card-body">
            <h4 className="card-title">Product title</h4>
            <h5 className="card-title">Price: <span className='text-muted' >R 500</span></h5>
          </div>
          <div className='card-footer'>
            <button title="Add to Cart" className='btn btn-dark btn-sm'><i className="fa-solid fa-cart-arrow-down fa-2x"></i></button>
            <button title="Add to Wishlist" className='btn btn-danger btn-sm ms-2'><i className="fa-solid fa-heart fa-2x"></i></button>
          </div>
         </div>
        </div>
        {/*Product Box End*/}

       </div>
      </div>
    </main>
    </>
  );
}

export default App;
