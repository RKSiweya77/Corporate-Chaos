import logo from '../logo.svg';
import { Link } from 'react-router-dom';
import SingleProduct from './SingleProduct';
function ProductDetail(){
    return(
       <section className="container mt-4">
         <div className="row">
                <div className="col-4">
                    <div id="productThumbnSlider" className="carousel carousel-dark slide carousel-fade" data-bs-ride="carousel">
                        <div className="carousel-indicators">
                            <button type="button" data-bs-target="#productThumbnSlider" data-bs-slide-to="0" className="active" aria-current="true" aria-label="Slide 1"></button>
                            <button type="button" data-bs-target="#productThumbnSlider" data-bs-slide-to="1" aria-label="Slide 2"></button>
                            <button type="button" data-bs-target="#productThumbnSlider" data-bs-slide-to="2" aria-label="Slide 3"></button>
                        </div>
                        <div className="carousel-inner">
                            <div className="carousel-item active">
                            <img src={logo} className="img-thumbnail mb-5" alt="..." />
                            </div>
                            <div className="carousel-item">
                            <img src={logo} className="img-thumbnail mb-5" alt="..." />
                            </div>
                            <div className="carousel-item">
                            <img src={logo} className="img-thumbnail mb-5" alt="..." />
                            </div>
                        </div>
                        <button className="carousel-control-prev" type="button" data-bs-target="#productThumbnSlider" data-bs-slide="prev">
                            <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                            <span className="visually-hidden">Previous</span>
                        </button>
                        <button className="carousel-control-next" type="button" data-bs-target="#productThumbnSlider" data-bs-slide="next">
                            <span className="carousel-control-next-icon" aria-hidden="true"></span>
                            <span className="visually-hidden">Next</span>
                        </button>
                        </div>

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
          {/*Related Products*/}
            <h3 className='mt-5 mb-3'>Related Products</h3>
            <div id="relatedProductsSlider" className="carousel carousel-dark slide " data-bs-ride="carousel">
                <div className="carousel-indicators">
                    <button type="button" data-bs-target="#relatedProductsSlider" data-bs-slide-to="0" className="active" aria-current="true" aria-label="Slide 1"></button>
                    <button type="button" data-bs-target="#relatedProductsSlider" data-bs-slide-to="1" aria-label="Slide 2"></button>
                    <button type="button" data-bs-target="#relatedProductsSlider" data-bs-slide-to="2" aria-label="Slide 3"></button>
                </div>
                <div className="carousel-inner">
                    <div className="carousel-item active">
                        <div className='row mb-5'>
                            <SingleProduct />
                            <SingleProduct />
                            <SingleProduct />
                            <SingleProduct />
                        </div>
                    </div>
                    <div className="carousel-item">
                        <div className='row mb-5'>
                            <SingleProduct />
                            <SingleProduct />
                            <SingleProduct />
                            <SingleProduct />
                        </div>
                    </div>
                    <div className="carousel-item">
                        <div className='row mb-5'>
                            <SingleProduct />
                            <SingleProduct />
                            <SingleProduct />
                            <SingleProduct />
                        </div>
                    </div>
                </div>
                {/*<button className="carousel-control-prev" type="button" data-bs-target="#relatedProductsSlider" data-bs-slide="prev">
                    <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                    <span className="visually-hidden">Previous</span>
                </button>
                <button className="carousel-control-next" type="button" data-bs-target="#relatedProductsSlider" data-bs-slide="next">
                    <span className="carousel-control-next-icon" aria-hidden="true"></span>
                    <span className="visually-hidden">Next</span>
                </button>*/}
            </div>
          {/*End Related Products*/}

       </section>

    );
}

export default ProductDetail;