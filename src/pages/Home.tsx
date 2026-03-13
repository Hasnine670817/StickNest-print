import React from 'react';
import Hero from '../components/Hero';
import Categories from '../components/Categories';
import Feature from '../components/Feature';
import Banner from '../components/Banner';
import Logos from '../components/Logos';

export default function Home() {
  return (
    <>
      <Hero />
      <Categories />
      <Feature />
      <Banner />
      <Logos />
    </>
  );
}
