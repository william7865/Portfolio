import { Service } from '@/components/sections/Service';
import { Rallye } from '@/components/sections/Rallye';
import { Smashes } from '@/components/sections/Smashes';
import { DropShot } from '@/components/sections/DropShot';
import { MatchPoint } from '@/components/sections/MatchPoint';

export default function HomePage() {
  return (
    <>
      <Service />
      <Rallye />
      <Smashes />
      <DropShot />
      <MatchPoint />
    </>
  );
}
