import "./styles/styles.css";
import React from "react";
import Navbar from "./components/navbar/Navbar";
import Footer from "./components/footer/Footer";
import Home from "./pages/Home";
import Form from "./pages/Form";
import Text from "../src/components/send-text/Text";
import { BrowserRouter as Router, Route, Routes} from 'react-router-dom';

function App() {
  return (
    <div className="App">
      <Router>
        <Navbar />
        {/*<Home />*/}
        <Routes>
          <Route path="/" element={ <Home/>}/>
          <Route path="/form/text" element={<Form/>}/>
        </Routes>

        <Footer />
      </Router>
    </div>
  );
}

export default App;
