//Assets
import Sidebar from './Sidebar';
function Dashboard(props) {
    return (
        <div className='container mr-4 mt-3'>
            <div className='row'>
                  <div className='col-md-3 col-12 mb-2 '>
                     <Sidebar />
                    </div>
                  <div className='col-md-9 col-12 mb-2'>
                    <div className='row'>
                        <div className='col-md-3 mb-2'>
                            <div className='card'>
                                <div className='card-body text-center'>
                                    <h4>Total Orders</h4>
                                    <h4><a href='#'>123</a></h4>
                                </div>
                            </div>
                        </div>
                         <div className='col-md-3 mb-2'>
                            <div className='card'>
                                <div className='card-body text-center'>
                                    <h4>Total Wishlist</h4>
                                    <h4><a href='#'>123</a></h4>
                                </div>
                            </div>
                        </div>
                         <div className='col-md-3 mb-2'>
                            <div className='card'>
                                <div className='card-body text-center'>
                                    <h4>Total Addresses</h4>
                                    <h4><a href='#'>5</a></h4>
                                </div>
                            </div>
                        </div>
                    </div>
                  </div>
                </div>
       </div>
    )
}
export default Dashboard;