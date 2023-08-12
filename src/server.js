/* 
*-----------------------*
* Packages              *
*                       *
* npm install axios     *
* npm install exceljs   *
* npm install cors      *
*-----------------------*
*/

// app.use(express.json());
const express = require('express');
const cors = require('cors');
const app = express();
const port = 8000
app.use(express.static('public'));

// Enable CORS for all routes
app.use(cors());

// Code to read in excel data file using ExcelJS
const path = require('path');
const ExcelJS = require('exceljs');
const chartJS = require('chart.js');
const filePath = path.join(__dirname, 'excelfiles', 'masterfile.xlsx');
const cache = {excel: {}, suggestions: {}};

// Check over for later
// Check endpoints in both server.js & Dropdown.js
// http://localhost:8000/api/sheet/Canada%20Statistics
// http://localhost:8000/api/sheet/Peel%20Region%20Statistics

app.get('/api/sheetNames', async (req, res) => {
  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    const sheetNames = workbook.worksheets.map(sheet => decodeURIComponent(sheet.name));
    res.json({ sheetNames });
  } catch(error) {
    res.sendStatus(500).json({error: 'Could not retrive sheet name from excel file. Please ensure that the correct excel file is being used.'} );;
    console.log(error);
  }
});

app.get('/api/sheet/:sheetName', async (req, res) => {
  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    const sheetName = decodeURIComponent(req.params.sheetName);
    const sheet = workbook.getWorksheet(sheetName);
    // console.log('Sheet Object:', sheet);
    const jsonData = sheet.getSheetValues();
    res.json({ sheetData: jsonData });
  } catch(error) {
    res.sendStatus(500).json({error: 'Could not retrive sheet data from sheet. Please ensure that the correct excel file is being used.'} );
    console.log(error);
  }
});

/**
 * 
 * @param {ExcelJS.Worksheet} worksheet 
 */
const getIndicators = (worksheet) => {

  const boldedText = {};
  let prevIndicatorName = null;
  let lastCell = null;

  worksheet.getColumn('A').eachCell((cell, rowNumber) => {

    if (cell.font && cell.font.bold) {
      boldedText[cell.value.trim()] = {col: cell.address[0], row: cell.row};

      if (prevIndicatorName) {
        boldedText[prevIndicatorName].endRow = cell.row - 2;
      }

      prevIndicatorName = cell.value.trim();

    }

    lastCell = cell;

  });

  if (lastCell && prevIndicatorName) {
    boldedText[prevIndicatorName].endRow = lastCell.row;
  }

  return boldedText;
};

/**
 * 
 * @param {ExcelJS.Worksheet} worksheet 
 * @param {*} indicator 
 */
const getAreas = (worksheet, indicator) => {
  const boldedAreaText = {};

  let row = worksheet.getRow(indicator.row);
  // let cells = row.getCell(2, row.actualCellCount - 1);
  row.eachCell((cell, colNum) => {
    if (colNum > 1){
      boldedAreaText[cell.value.trim()] = {col: cell.address[0], row: cell.row};
    }
  });

  return boldedAreaText;

};

/**
 * 
 * @param {ExcelJS.Worksheet} worksheet 
 * @param {*} indicatorName
 * @param {*} indicatorLocation 
 * @param {*} areaName
 * @param {*} areaLocation 
 */
const getIndicatorAreaCrossSection = (worksheet, indicatorName, indicatorLocation, areaName, areaLocation) => {

  let categories = []; 
  let areasValues = [];

  for (let row = indicatorLocation.row + 1; row <= indicatorLocation.endRow; row++) {
    let categoryCell = worksheet.getCell(`${indicatorLocation.col}${row}`);
    let areaValueCell = worksheet.getCell(`${areaLocation.col}${row}`);
    categories.push(`${categoryCell.value}`.trim());
    let areaValue = parseFloat(`${areaValueCell.toString()}`.trim());
    console.log(`${areaValue} || ${areaValueCell.toString()}`)
    if (areaValueCell.numFmt && areaValueCell.numFmt.endsWith('%')) {
      areaValue = `${areaValue * 100}%`;
    }
    areasValues.push(areaValue);
  }

  return {indicator:indicatorName, area:areaName, categories, areasValues:areasValues};
};

/**
 * 
 * @param {*} searchString 
 * @returns 
 */
const readExcel = async (excelSheet) => {

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const worksheet = workbook.getWorksheet(excelSheet); // Replace with the name of your sheet

  let indicators = getIndicators(worksheet);
  
  const result = {};
  Object.keys(indicators).forEach((indicatorName) => {
    let indicator = indicators[indicatorName];
    let areas = getAreas(worksheet, indicator); 
    Object.keys(areas).forEach((areaName) => {
      const crossSection = getIndicatorAreaCrossSection(worksheet, indicatorName, indicator, areaName, areas[areaName]);
      result[`${indicatorName}/${areaName}`] = crossSection;
    });
  });

  return result;

};

/**
 * 
 * @param {*} excelSheet 
 * @returns 
 */
const readExcelCache = async (excelSheet) => {
  if (cache['excel'][excelSheet]) {
    return cache['excel'][excelSheet];
  };

  cache['excel'][excelSheet] = readExcel(excelSheet);
  return cache['excel'][excelSheet];
};

/**
 * 
 * @param {*} excelSheet 
 * @returns 
 */
const readSuggestionCache = async (excelSheet) => {
  if (cache['suggestions'][excelSheet]) {
    return cache['suggestions'][excelSheet];
  };

  cache['suggestions'][excelSheet] = readSuggestion(excelSheet);
  return cache['suggestions'][excelSheet];
};

/**
 * 
 * @returns 
 */
const readSuggestion = async (excelSheet) => {

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const worksheet = workbook.getWorksheet(excelSheet); // Replace with the name of your sheet

  const indicatorboldedText = []; //an array of the indicator names
  const areaboldedText = []; //an array of the area location

  //grabs indicator names from column A and stores in the indicator array
  worksheet.getColumn('A').eachCell((cell, rowNumber) => {
    if (cell.font && cell.font.bold) {
      indicatorboldedText.push(cell.value);
    }
  });

  //grabs area location from column A and stores in the area array
  worksheet.getRow(1).eachCell((cell, columnNumber) => {
    if (columnNumber > 1 && cell.font && cell.font.bold) {
      areaboldedText.push(cell.value);
    }
  });

  const boldedText = [];

  //combines the area and indicator array into one array
  // and stores each value as indicatorName/areaLocation
  indicatorboldedText.forEach((indicator) => {
    areaboldedText.forEach((area) => {
      boldedText.push(`${indicator}/${area}`);
    });
  });

  return boldedText;
}

let suggestionData = null;

/**
 * 
 * @param {*} excelSheet 
 */
const loadSuggestionData = async (excelSheet) => {
  suggestionData = await readSuggestion(excelSheet);
}

app.get('/autocomplete', async (req, res) => {
  try{

    const term = req.query.term; // Takes whatever term is being typed
    const sheet = req.query.sheet;
  
    let newSuggestionData = await readSuggestionCache(sheet);
  
    // filters through the array and matches with term
    const filteredSuggestions = newSuggestionData.filter((text) =>
    text.toLowerCase().includes(term.toLowerCase()));
    res.json(filteredSuggestions);

  } catch(error){
    res.status(500).json({error: 'Could not retrieve suggestions. Please ensure that the correct excel file is being used.'} );
    console.log(error);
  }
});

app.get('/api/search', async (req, res) => {
  try{
    const query = req.query.query.trim();
    const sheet = req.query.sheet.trim();
    const result = await readExcelCache(sheet);
    const data = result[query];
    res.json(data);
    // res.json(result[query]);
    console.log(data);
  } catch(error){
    res.sendStatus(500).json({error: 'Could not retrieve search query'} );
    console.log(error);
  }

});

app.listen(port, () => {
  console.log('Server is running on port 8000');
});