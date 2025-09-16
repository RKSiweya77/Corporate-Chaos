//Packages
import { Link } from 'react-router-dom';
//Assets
import logo from '../logo.svg';
function Checkout(props) {
    return (
        <div className='container mr-4'>
            <h3 className='mb-4'>All items (4)</h3>
            <div className='row'>
                <div className='col-md-8 col-12'>
                        <div className='table-responsive'>
                        <table className='table table-bordered'>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Product</th>
                                    <th>Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>1</td>
                                    <td>
                                        <Link><img src={logo} className="img-thumbnail" width='80' alt="..."/></Link> 
                                        <Link><p>Phone</p></Link> 
                                    </td>
                                    <td>R 500</td>
                                </tr>
                                <tr>
                                    <td>2</td>
                                    <td>
                                        <Link><img src={logo} className="img-thumbnail" width='80' alt="..."/></Link> 
                                        <Link><p>Speaker</p></Link> 
                                    </td>
                                    <td>R 500</td>
                                </tr>
                                <tr>
                                    <td>3</td>
                                    <td>
                                        <Link><img src={logo} className="img-thumbnail" width='80' alt="..."/></Link> 
                                        <Link><p>Earbuds</p></Link> 
                                    </td>
                                    <td>R 500</td>
                                </tr>
                                <tr>
                                    <td>4</td>
                                    <td>
                                        <Link><img src={logo} className="img-thumbnail" width='80' alt="..."/></Link> 
                                        <Link><p>Trouser</p></Link> 
                                    </td>
                                    <td>R 500</td>
                                </tr>
                            </tbody> 
                            <tfoot>
                                <tr>
                                    <th></th>
                                    <th>Total</th>
                                    <th>R 2000</th>

                                </tr>
                                <tr>
                                    <td colSpan='3' align='center'>
                                        <Link to='/categories' className='btn btn-secondary'>Continue Shopping</Link>
                                        <Link className='btn btn-success ms-1'>Proceed to ayment</Link>
                                    </td>

                                    
                                </tr>
                            </tfoot>
                        </table>
                        </div>
                </div>
            </div>
        </div>
    )
}
export default Checkout;