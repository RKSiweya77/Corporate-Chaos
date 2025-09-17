//Assets
import VendorSidebar from './VendorSidebar';
function VendorDashboard(props) {
    return (
        <div className='container mr-4 mt-3'>
            <div className='row'>
                  <div className='col-md-3 col-12 mb-2 '>
                     <VendorSidebar />
                    </div>
                  <div className='col-md-9 col-12 mb-2'>
                    <div className='row'>
                        <div className='col-md-3 mb-2'>
                            <div className='card'>
                                <div className='card-body text-center'>
                                    <h4>Total Products</h4>
                                    <h4><a href='#'>50</a></h4>
                                </div>
                            </div>
                        </div>
                         <div className='col-md-3 mb-2'>
                            <div className='card'>
                                <div className='card-body text-center'>
                                    <h4>Total Orders</h4>
                                    <h4><a href='#'>34</a></h4>
                                </div>
                            </div>
                        </div>
                         <div className='col-md-3 mb-2'>
                            <div className='card'>
                                <div className='card-body text-center'>
                                    <h4>Total Customers</h4>
                                    <h4><a href='#'>15</a></h4>
                                </div>
                            </div>
                        </div>
                    </div>
                  </div>
                </div>
       </div>
    )
}
export default VendorDashboard;