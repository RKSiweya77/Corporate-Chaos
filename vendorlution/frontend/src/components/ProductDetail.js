import logo from '../logo.svg';
import { Link } from 'react-router-dom';
function ProductDetail(){
    return(
       <section className="container mt-4">
         <div className="row">
                <div className="col-4">
                   <img src={logo} className="img-thumbnail" alt="..."/>
                 </div> 
                 <div className="col-8">
                    <h3>Product Title</h3>
                    <p>Product Description  of the Vendorlution product that the user will list so here you can just write a short paragraph describing the product and all information that may be required regarding the product </p>
                    <h5 className="card-title text-muted">Price:R 500</h5>
                    <p className="mt-3">   
                            <button title="Buy Now" className='btn btn-info btn-sm ms-1'><i className="fa-solid fa-bag-shopping"></i>  Buy Now  </button>                    
                            <button title="Add to Cart" className='btn btn-success btn-sm ms-1'><i className="fa-solid fa-cart-plus"></i>  Add to Cart  </button>
                            <button title="Add to Wishlist" className='btn btn-danger btn-sm ms-1'><i className="fa fa-heart "></i>  Wishlist  </button>
                    </p>
                    <hr/>
                    <div className='producttags mb-4'>
                        <h5>Tags</h5>
                        <p >
                            <Link to="#" className='badge bg-secondary text-white me-1'>fashion</Link>
                            <Link to="#" className='badge bg-secondary text-white me-1'>preloved</Link>
                            <Link to="#" className='badge bg-secondary text-white me-1'>second_hand</Link>
                            <Link to="#" className='badge bg-secondary text-white me-1'>clothing</Link>
                            <Link to="#" className='badge bg-secondary text-white me-1'>fashion</Link>
                            <Link to="#" className='badge bg-secondary text-white me-1'>fashion</Link>
                        </p>
                    </div>
                 </div>
          </div> 
       </section>

    );
}

export default ProductDetail;