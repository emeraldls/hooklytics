import type { ReactNode } from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Track Events Easily',

    description: (
      <>
        Use simple React hooks to track clicks, durations, visibility, and more —
        no external scripts or complicated SDKs.
      </>
    ),
  },
  {
    title: 'Element-Aware Analytics',
    description: (
      <>
        Hooklytics supports element references and CSS path tracking,
        enabling precise in-app interaction insights.
      </>
    ),
  },
  {
    title: 'Fully Typed & Extensible',
    description: (
      <>
        Written in TypeScript with full typing support. Easily extend metadata
        and use advanced tracking patterns tailored to your product.
      </>
    ),
  },
];

function Feature({ title, description }: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>

      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
