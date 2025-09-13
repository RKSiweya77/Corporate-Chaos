import logo from '../logo.svg';
function SingleProduct(props) {
    return (
        <div className='col-12 col-md-3 mb-4'>
                <div className="card shadow">
                    <img src={logo} className="card-img-top" alt="..."/>
                    <div className="card-body">
                    <h4 className="card-title">{props.title}</h4>
                    <h5 className="card-title">Price: <span className='text-muted' >R 500</span></h5>
                    </div>
                    <div className='card-footer'>
                    <button title="Add to Cart" className='btn btn-dark btn-sm'><i className="fa-solid fa-cart-arrow-down fa-2x"></i></button>
                    <button title="Add to Wishlist" className='btn btn-danger btn-sm ms-2'><i className="fa-solid fa-heart fa-2x"></i></button>
                    </div>
        </div>
        </div>
    )
}
export default SingleProduct;