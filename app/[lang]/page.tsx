import { getTranslations } from 'next-intl/server';
import { Hero } from '@/components/sections/Hero';
import { Works } from '@/components/sections/Works';
import { Skills } from '@/components/sections/Skills';
import { Now } from '@/components/sections/Now';
import { Gate } from '@/components/sections/Gate';
import { Correspondance } from '@/components/sections/Correspondance';
import { ActCurtain } from '@/components/system/ActCurtain';

export default async function HomePage() {
  const [tWorks, tSkills, tNow] = await Promise.all([
    getTranslations('works'),
    getTranslations('skills'),
    getTranslations('now')
  ]);

  return (
    <>
      <Hero />
      <ActCurtain
        hanzi="第一幕"
        label={tWorks('kicker')}
        subtitle={tWorks('subtitle')}
      />
      <Works />
      <ActCurtain
        hanzi="第二幕"
        label={tSkills('kicker')}
        subtitle={tSkills('subtitle')}
      />
      <Skills />
      <ActCurtain
        hanzi="第三幕"
        label={tNow('kicker')}
        subtitle={tNow('subtitle')}
      />
      <Now />
      <Gate />
      <Correspondance />
    </>
  );
}
