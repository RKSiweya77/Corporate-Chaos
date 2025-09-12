import {Routes,Route} from 'react-router-dom';

import logo from './logo.svg';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/js/bootstrap.js';
import Header from './components/Header';
import Home from './components/Home';
import Categories from './components/Categories';
import Footer from './components/Footer'; 


function App() {
  return (
    <>
    <Header />
     <Routes>
      <Route path='/' element={<Home />}/>
      <Route path='/categories' element={<Categories />}/>
    </Routes>
    <Footer />
    </>
  );
}

export default App;
