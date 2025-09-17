//Packages
import { Link } from 'react-router-dom';
//Assets
import logo from '../../logo.svg';
import Sidebar from './Sidebar';
function Orders() {
    return (
        <div className='container mr-4 mt-3'>
            <div className='row'>
                  <div className='col-md-3 col-12 mb-2 '>
                     <Sidebar />
                    </div>
                  <div className='col-md-9 col-12 mb-2'>
                    <div className='row'>
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
                            </table>
                        </div>
                    </div>
                  </div>
                </div>
       </div>
    )
}
export default Orders;