import logo from './logo.svg';
import './App.css';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/js/bootstrap.js';
import Header from './components/Header';


function App() {
  return (
    <>
    <Header/>
    <main className='mt-4'>
      <div className='container'>
        {/*Latest Products*/}
        <h3>Latest Products <a href = '#' className='float-end btn btn-sm btn-dark '>View All Products<i class="fa-solid fa-arrow-right-long "></i></a></h3>  
      <div className='row mb-4'>
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
       {/*End Latest Products*/}

        {/*Popular Categories */}
        <h3>Popular Categories <a href = '#' className='float-end btn btn-sm btn-dark '>View All Categories<i class="fa-solid fa-arrow-right-long "></i></a></h3>  
      <div className='row mb-4'>
         {/*Category Box*/}
        <div className='col-12 col-md-3 mb-4'>
          <div className="card shadow">
            <img src={logo} className="card-img-top" alt="..."/>
          <div className="card-body">
            <h4 className="card-title">Category title</h4>
          </div>
         </div>
        </div>
        {/*Category Box End*/}
        {/*Category Box*/}
        <div className='col-12 col-md-3 mb-4'>
          <div className="card shadow">
            <img src={logo} className="card-img-top" alt="..."/>
          <div className="card-body">
            <h4 className="card-title">Category title</h4>
          </div>
         </div>
        </div>
        {/*Category Box End*/}
        {/*Category Box*/}
        <div className='col-12 col-md-3 mb-4'>
          <div className="card shadow">
            <img src={logo} className="card-img-top" alt="..."/>
          <div className="card-body">
            <h4 className="card-title">Category title</h4>
          </div>
         </div>
        </div>
        {/*Category Box End*/}
        {/*Category Box*/}
        <div className='col-12 col-md-3 mb-4'>
          <div className="card shadow">
            <img src={logo} className="card-img-top" alt="..."/>
          <div className="card-body">
            <h4 className="card-title">Category title</h4>
          </div>
         </div>
        </div>
        {/*Category Box End*/}

       </div>
       {/*End Popular Categories*/}

        {/*Popular Products*/}
        <h3>Popular Products <a href = '#' className='float-end btn btn-sm btn-dark '>View All Products<i class="fa-solid fa-arrow-right-long "></i></a></h3>  
      <div className='row mb-4'>
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
       {/*End Popular Products*/}

       {/*Featured Vendors */}
        <h3>Featured Vendors <a href = '#' className='float-end btn btn-sm btn-dark '>View All Vendors<i class="fa-solid fa-arrow-right-long "></i></a></h3>  
      <div className='row mb-4'>
         {/*Seller Box*/}
        <div className='col-12 col-md-3 mb-4'>
          <div className="card shadow">
            <img src={logo} className="card-img-top" alt="..."/>
             <div className="card-body">
               <h4 className="card-title">Vendor Name</h4>  
          </div>
          <div className='card-footer'>
              Categories: <a href="#">Fashion</a> ,<a href="#">Electronics</a>
           </div>
          </div>
        </div>
        {/*Seller Box End*/}
        {/*Seller Box*/}
        <div className='col-12 col-md-3 mb-4'>
          <div className="card shadow">
            <img src={logo} className="card-img-top" alt="..."/>
             <div className="card-body">
               <h4 className="card-title">Vendor Name</h4>  
          </div>
          <div className='card-footer'>
              Categories: <a href="#">Software & Digital Products</a> 
           </div>
          </div>
        </div>
        {/*Seller Box End*/}
        {/*Seller Box*/}
        <div className='col-12 col-md-3 mb-4'>
          <div className="card shadow">
            <img src={logo} className="card-img-top" alt="..."/>
             <div className="card-body">
               <h4 className="card-title">Vendor Name</h4>  
          </div>
          <div className='card-footer'>
              Categories: <a href="#">Sports</a> 
           </div>
          </div>
        </div>
        {/*Seller Box End*/}
        {/*Seller Box*/}
        <div className='col-12 col-md-3 mb-4'>
          <div className="card shadow">
            <img src={logo} className="card-img-top" alt="..."/>
             <div className="card-body">
               <h4 className="card-title">Vendor Name</h4>  
          </div>
          <div className='card-footer'>
              Categories: <a href="#">Home & Living</a>
           </div>
          </div>
        </div>
        {/*Seller Box End*/}
        

       </div>
       {/*End Featured Vendors*/}
      </div>
    </main>
    </>
  );
}

export default App;
