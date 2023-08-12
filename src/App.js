import React, {useState , useRef , useEffect} from "react";
import './App.css';
import image from './images/spcp.jpg';
import imagethree from "./images/logo2.png";
import imagetwo from "./images/questionmark.png"
import {FaQuestion, FaFacebook, FaYoutube, FaTwitter} from 'react-icons/fa';
import SearchBar from "./SearchBar";
import Dropdown from "./Dropdown";
import 'typeface-montserrat';
import SearchOutput from "./SearchOutput";
import Download from "./DownloadButton";
import DownloadButton from "./DownloadButton";
//pray this works

/* 
*------------------------------------*
*  Packages                          *
*                                    *
*   npm install react-icons --sav    *
*   npm install html2canvas jspdf    *
*   npm install typeface-montserrat  *
*------------------------------------*
*/

function App() {

  // All HTML elements and components as they appear

  const [selectedSheet, setSelectedSheet] = useState('');
  const [currentQuery, setCurrentQuery] = useState('');

  const popupRef = useRef(null);

  function openPopup(){
    popupRef.current.classList.add("open-popup")
  }

  function closePopup(){
    popupRef.current.classList.remove("open-popup")
  }

  const footerRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      const windowHeight = window.innerHeight;
      const bodyHeight = document.body.offsetHeight;
      const isContentLargerThanWindow = bodyHeight > windowHeight;

      if (!isContentLargerThanWindow) {
        const remainingHeight = windowHeight - bodyHeight;
        footerRef.current.style.marginTop = `${remainingHeight}px`;
      } else {
        footerRef.current.style.marginTop = "0";
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <body>
    <div className = "container">

      {/* // Title of Webpage */}
      <h1>Portraits of Peel Database Webpage</h1>

      {/* // Paragraph #1 */}
      <div className = "paragraph">
        <p>Are you looking for information about South Asians within the Peel Region, provincially, or nationally? You </p>  
        <p>are in luck; we currently have data from 2016 that helps you find the insights, information, and statistics you </p> 
        <p>need. Click the dropdown menu and choose the information you need!</p>
      </div>

      {/* // Paragraph #2 */}
      <div className="paragraphtwo">
        <h2>Dropdown Menu</h2>
        <p>The dropdown menu cycles through various datasheets that has provincial, national, and Peel-wide</p>
        <p>that appears.</p>
      </div>

      {/* // Dropdown Menu Component */}
        <Dropdown selectedSheetChanged={setSelectedSheet}/>

      {/* // Logo */}
      <img className="logo" src={image} alt="SPCP Logo" />

      {/* // Paragraph #3 */}
      <div className="paragraphthree">
        <h2>Searchbar for database and search queries </h2>
        <p>The search bar will populate suggestions based on your input. Please select one of the following suggestions</p>
        <p> for the needed table of data to be outputted.</p>
      </div>

       {/* // Help & Download Buttons */}
       <div>
       <DownloadButton/>
        {/* <button className="button"><FaDownload/></button> */}
      </div>

      {/* // Search Bar Component */}
        <SearchBar sheet={selectedSheet} onSearchRequested={setCurrentQuery}/>
        <SearchOutput sheet={selectedSheet} query={currentQuery}/>

      {/*Footer*/}
     <footer ref={footerRef} className="footer">
         <div className="row">
              {/* Column 1 */}
     <div className="col">
     <img src={imagethree} className="logoVersionTwo"/>
    </div>
    {/* Column 2 */}
     <div className="col">
      <h3>Useful Link <div className="underline"><span></span></div></h3>
      <ul>
        <li><a href="http://www.spcpeel.com/">SPCP Website</a></li>
        <li><a href="http://www.portraitsofpeel.ca/index.php">Portraits of Ontario</a></li>
      </ul>
    </div> 
    {/* Column 3 */}
     <div className="col">
     <h3>Socials<div className="underline"><span></span></div></h3>
      <div className="social-icons">
      <a href="https://www.facebook.com/profile.php?id=100069688715596"><i><FaFacebook/></i></a>
      <a href="https://twitter.com/spcpeel1"><i><FaTwitter/></i></a>
      <a href="https://www.youtube.com/channel/UC_cWBYmy1RvyN8xilqiYe-Q"><i><FaYoutube/></i></a>
        </div>
      </div> 
    </div>
    </footer>
    </div>
    </body>
  );
}

export default App;