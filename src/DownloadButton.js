import html2canvas from 'html2canvas';
import React, { useRef } from "react";
import jsPDF from 'jspdf';
import {FaDownload,FaQuestion} from 'react-icons/fa';
import imagetwo from "./images/questionmark.png"

const DownloadButton = () => {
  
    const handleCaptureScreenshot = () => {

      try {
        // Get the target HTML element to capture (e.g., a specific div with a ref)
        const targetElement = document.getElementById('render');

        // Use html2canvas to capture the screenshot of the target element
        html2canvas(targetElement).then((canvas) => {

        // Create a new jsPDF instance
        const pdf = new jsPDF('p', 'mm', 'a4');
        const mmConversionRate = 0.264583;

        // Calculate the aspect ratio to fit the screenshot in the PDF page
        const elemRect = canvas.getBoundingClientRect();
        const imgWidth = Math.floor(canvas.width * mmConversionRate); // Width of the PDF page (in mm)
        const imgHeight = Math.floor(elemRect.height * mmConversionRate); // Calculate the height based on the aspect ratio
        // console.log(imgHeight);
        // console.log(elemRect.height);
        // console.log(canvas.width);
        const horizontalOffset = (pdf.internal.pageSize.getWidth() - imgWidth) / 2;

        // Convert the captured canvas to an image and add it to the PDF
        const screenshotData = canvas.toDataURL('image/png', 1.0);
        if (screenshotData.trim() === 'data:,') return;
        // console.log(screenshotData);
        pdf.deletePage(1);
        pdf.addPage(imgWidth, imgHeight);
        pdf.addImage(screenshotData, 'PNG',  horizontalOffset, 0);

        // Save the PDF and trigger the download
        pdf.save('dataoutput.pdf');
        });
      } 
      catch(error){
        console.log(error);
      }
    };

    const popupRef = useRef(null);

    function openPopup(){
      popupRef.current.classList.add("open-popup")
    }
  
    function closePopup(){
      popupRef.current.classList.remove("open-popup")
    }

    return (
        <div>
          {/* Place the target element you want to capture */}
          <div>
            {/* Content you want to capture */}
          </div>
    
          {/* Button to trigger the screenshot and PDF generation */}
          <div className="mainbuttons">
        <button className="button" type ="submit" onClick={openPopup}><FaQuestion/></button>
        <button className="button" onClick={handleCaptureScreenshot}><FaDownload/></button>
        </div>
        <div className="popup" ref={popupRef} id="popup">
          <img src={imagetwo} alt="imageTwo" />
          <h2>Help</h2>
          <p>Step 1: Select a region from the dropdown menu above</p>
          <p>Step 2: Please type in the indicator you are looking for, followed by a '/' and the area you require</p>
          <p>Step 3: An example of a correctly formatted search request can be 'Gender/Brampton'</p>
          <a href="https://acrobat.adobe.com/id/urn:aaid:sc:US:1da2bc6c-6219-41b6-9820-e35b294e924f">List of indicators</a>
          <br></br>
          <br></br>
          <br></br>
          <button className='okButton' type="button" onClick={closePopup}>OK</button>
        </div>
        </div>
      );
};

export default DownloadButton;