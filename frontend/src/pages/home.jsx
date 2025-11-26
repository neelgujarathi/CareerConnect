import React from 'react';
import Navbar from './navbar';
import MainContent from './mainContent';
import SearchBar from './SearchBar';
import JobListingPage from './JobListingPage';


function Home() {
  return (
    <>
    <Navbar/>
    <JobListingPage/>
    </>
  );
}

export default Home;
