import React, { useEffect,useState } from 'react';
import axios from 'axios';
import { render } from '@testing-library/react';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

const SearchOutput = ({query, sheet}) => {

    const [data, setData] = useState([]);
    
    useEffect(() => {
        console.log(query);
        if (query.length === 0 || sheet.length === 0) {
            return;
        } 

        axios.get('http://localhost:8000/api/search', {params: {query, sheet}})
        .then((response) => response.data)
        .then((jsonData) => {
            return jsonData;
        })
        .then((jsonData) => setData(jsonData))
        .catch((error) => {
          // Handle any errors
          console.log(error);
        });

    }, [query, sheet]);

    const { indicator, area, categories, areasValues } = data;

// Uses data the user wants from the excel sheet and renders it in Table
    const renderTable = () => {
        if (Object.keys(data).length === 0) {
          return;
        }
    
        return (
          <table class="content-table">
            <thead>
              <tr>
                <th>{indicator}</th>
                <th>{area}</th>
              </tr>
            </thead>
            <tbody>
            {categories.map((category, index) => (
          <tr key={index}>
            <td>{category}</td>
            <td>{areasValues[index]}</td>
          </tr>
          ))}
            </tbody>
          </table>
        );
      };

      // Uses data the user wants from the excel sheet and renders it in Graph
      const renderChart = () => {
        if (Object.keys(data).length === 0 || !areasValues || areasValues.length === 0) {
          return null;
        }

        // check if areaValues is a percent value or not
        const isPercentage = areasValues.every((value) => {
          if (typeof value !== 'string') {
            return false; // Not a string, not a percentage
          }
          return value.endsWith('%');
        });

        const chartData = {
          labels: categories,
          datasets: [
            {
              data: areasValues.map((value) => {
                if (typeof value === 'string') {
                  return parseFloat(value.replace('%', ''));
                }
                return value;
              }),
              backgroundColor: generateColors(categories.length),
              borderWidth: 1,
            },
          ],
        };
        
        // if areaValues is a percent value it provides a pie chart
        if (isPercentage) {
      
          const options = {
            maintainAspectRatio: true,
            plugins: {
              
              title: {
                display: true,
                text: `${indicator}/${area}`,
                fontSize: 16,
                padding: {
                  top: 10,
                  bottom: 10,
                },
              },
              legend: {
                display: true,
                labels: {
                  padding: 10,
                  boxWidth: 12, // Adjust the width of the legend items
                  font: {
                    size: 10, // Adjust the font size of the legend items
                  },
                },
              },
            },
            responsive: true,
          };
      
          return (
            <div>
              <div style={{ minWidth: '500px', margin: '0 auto' , height: '500px'}}>
                <Pie data={chartData} options={options} />
              </div>
            </div>
          );


        }

        // if areaValues is not a percent value it provides a bar chart
        else{
      
          const options = {
            maintainAspectRatio: true,
            plugins: {
              title: {
                display: true,
                text: `${indicator}/${area}`,
                fontSize: 16,
                padding: {
                  top: 10,
                  bottom: 10,
                },
              },
              legend: {
                display: true,
                labels: {
                  generateLabels: (chart) => {
                    const { data } = chart;
                    if (data.labels.length && data.datasets.length) {
                      return data.labels.map((label, i) => ({
                        text: label,
                        fillStyle: data.datasets[0].backgroundColor[i],
                        hidden: isNaN(data.datasets[0].data[i]) || data.datasets[0].data[i] === 0,
                        index: i,
                      }));
                    }
                    return [];
                  },
                },
                onClick: (e, legendItem, legend) => {
                  const chart = legend.chart;
                  if (chart) {
                    const datasetIndex = legendItem.datasetIndex;
                    const meta = chart.getDatasetMeta(datasetIndex);
                    if (meta) {
                      meta.hidden = meta.hidden === null ? !meta.hidden : null;
                      chart.update();
                    }
                  }
                },
              },
            },

            scales: {
              x: {
                display: false,  // Set display to false to hide the x-axis labels
              },
              y: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: 'Number of Residents',
                  font: {
                    size: 14,
                    weight: 'bold',
                  },
                },
              },

            },
            responsive: true,
            interaction: {
              mode: 'index',
              intersect: false,
            },
          };
  
          const chartContainerStyle = {
            width: '100%',
            minWidth: '750px',
            height: '500px',
            margin: '0 auto', // Center the chart horizontally
          };
  
          return (
            <div style={chartContainerStyle}>
              <Bar data={chartData} options={options} />
            </div>
          );

        }
    
       
      };

      // generates a random colour so that each bar on a bar graph or slice  on a pie chart is different
      const generateColors = (numColors) => {
        const colors = [];
        for (let i = 0; i < numColors; i++) {
          const color = `rgba(${getRandomValue(0, 255)}, ${getRandomValue(0, 255)}, ${getRandomValue(0, 255)}, 0.6)`;
          colors.push(color);
        }
        return colors;
      };
      
      // Function to generate a random number between min and max (inclusive)
      const getRandomValue = (min, max) => {
        return Math.floor(Math.random() * (max - min + 1) + min);
      };

      return (
      <div id='render'>
        <div id = 'Table'>
        <div class="table">
          {renderTable()}
        </div>
        </div>

        <div id = 'Graph'>
        <div className="graph">
          {renderChart()}
          </div>
          </div>
      </div>

      );
};

export default SearchOutput;