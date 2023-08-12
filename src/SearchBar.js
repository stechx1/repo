import React, { useState } from 'react';
import { FaSearch } from 'react-icons/fa';
import axios from 'axios';

const SearchBar = ({sheet, onSearchRequested}) => { 

    const [query , setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);

    const handleSearchQuery = async (event) => {
        const value = event.target.value;
        setSearchQuery(event.target.value);
        if (value === '') {
            setSuggestions([]);
        } else if (sheet){
            const response = await axios.get(`http://localhost:8000/autocomplete?term=${value}&sheet=${encodeURIComponent(sheet)}`);
            setSuggestions(response.data);
        }
    };

    const handleSuggestionClick = (suggestions) => {
        setSearchQuery(suggestions);
        setSuggestions([]);
      };

    const handleSearchClick = (event) => {
        event.preventDefault();
        onSearchRequested(query);
    };

    return ( 
      <div class = "search"> 
        <form onSubmit={handleSearchClick} >

            <input className="search-bar"
                type="text"
                value={query}
                onChange={handleSearchQuery}
                placeholder="Search..."
            />
            <button className="search-button" type ="submit"><FaSearch/></button>
            <div>
                {setSearchQuery}
            </div>

            <div className = "suggest-box">
            <ul>
        {suggestions && suggestions.map((suggestion, index) => (
          <li key={index} onClick={() => handleSuggestionClick(suggestion)}>{suggestion}</li>
        ))}
      </ul>
      </div>
        </form> 
      </div> 
    ); 
}; 

export default SearchBar;