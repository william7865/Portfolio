import { Hero } from '@/components/sections/Hero';
import { Works } from '@/components/sections/Works';
import { Skills } from '@/components/sections/Skills';
import { Path } from '@/components/sections/Path';
import { Gate } from '@/components/sections/Gate';
import { Correspondance } from '@/components/sections/Correspondance';

export default function HomePage() {
  return (
    <>
      <Hero />
      <Works />
      <Skills />
      <Path />
      <Gate />
      <Correspondance />
    </>
  );
}
