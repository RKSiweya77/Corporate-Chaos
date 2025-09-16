import logo from '../logo.svg'
import SingleProduct from './SingleProduct';
function AllProducts(){
    return (
      <section className='container mt-4'> 
        <h3> All Products </h3>  
          <div className='row mb-4'>
           <SingleProduct title="Fashion_item1"/>
           <SingleProduct title="Fashion_item2"/>
           <SingleProduct title="Fashion_item3"/>
           <SingleProduct title="Fashion_item4"/>
           <SingleProduct title="Fashion_item5"/>
           <SingleProduct title="Fashion_item6"/>
           <SingleProduct title="Fashion_item7"/>
           <SingleProduct title="Fashion_item8"/>
           </div>


            <nav aria-label="Page navigation example">
                    <ul className="pagination">
                        <li className="page-item">
                             <a className="page-link" href="#" aria-label="Previous">
                                <span aria-hidden="true">&laquo;</span>
                             </a>
                        </li>       
                        <li className="page-item"><a className="page-link" href="#">1</a></li>
                        <li className="page-item"><a className="page-link" href="#">2</a></li>
                        <li className="page-item"><a className="page-link" href="#">3</a></li>
                        <li className="page-item">
                             <a className="page-link" href="#" aria-label="Next">
                                <span aria-hidden="true">&raquo;</span>
                             </a>
                        </li>
                    </ul>
                </nav>
        </section>  
    )
}

export default AllProducts;