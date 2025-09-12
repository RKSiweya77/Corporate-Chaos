function Footer(){
    return(
     <footer class="d-flex flex-wrap justify-content-between container align-items-center py-3 my-3 border-top">
          <div class="col-md-4 d-flex align-items-center">
            <a href="/" class="mb-3 me-2 mb-md-0 text-muted text-decoration-none lh-1">
              Vendorlution
            </a>
            <span class="text-muted">© 2025 Marketplace</span>
          </div>

          <ul class="nav col-md-4 justify-content-end list-unstyled d-flex">
            <li class="ms-3"><a class="text-muted" href="#"><i className='fa-brands fa-facebook'></i></a></li>
            <li class="ms-3"><a class="text-muted" href="#"><i className='fa-brands fa-instagram'></i></a></li>
            <li class="ms-3"><a class="text-muted" href="#"><i className='fa-brands fa-whatsapp'></i></a></li>
          </ul>
</footer>   
    )
}
export default Footer;
