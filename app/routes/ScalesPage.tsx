'use client';

import { useState } from 'react';
import { IconDice } from '@tabler/icons-react';
import { Card, CardContent } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Checkbox } from '~/components/ui/checkbox';
import { Label } from '~/components/ui/label';

interface KeySignature {
  major: string;
  minor: string;
  sharps: number;
  flats: number;
}

interface ScaleOptions {
  oneHand: boolean;
  twoHands: boolean;
  fourOctaves: boolean;
  twoFiveOne: boolean;
  natural: boolean;
  harmonic: boolean;
  melodic: boolean;
}

const scaleOptionsLabels = [
  { key: 'oneHand', label: 'Одна рука' },
  { key: 'twoHands', label: '2ві руки' },
  { key: 'fourOctaves', label: '4 октави' },
  { key: 'twoFiveOne', label: '2-5-1 кругова' },
  { key: 'natural', label: 'Натуральна' },
  { key: 'harmonic', label: 'Гармонійна(#7)' },
  { key: 'melodic', label: 'Мелодійна(+#6,#7, -6,7)' },
] as const;

const circleOfFifths: KeySignature[] = [
  { major: 'C', minor: 'Am', sharps: 0, flats: 0 },
  { major: 'G', minor: 'Em', sharps: 1, flats: 0 },
  { major: 'D', minor: 'Bm', sharps: 2, flats: 0 },
  { major: 'A', minor: 'F#m', sharps: 3, flats: 0 },
  { major: 'E', minor: 'C#m', sharps: 4, flats: 0 },
  { major: 'B/Cb', minor: 'G#m/Abm', sharps: 5, flats: 0 },
  { major: 'F#/Gb', minor: 'D#m/Ebm', sharps: 6, flats: 0 },
  { major: 'C#/Db', minor: 'A#m/Bbm', sharps: 7, flats: 0 },
  { major: 'F', minor: 'Dm', sharps: 0, flats: 1 },
  { major: 'Bb', minor: 'Gm', sharps: 0, flats: 2 },
  { major: 'Eb', minor: 'Cm', sharps: 0, flats: 3 },
  { major: 'Ab', minor: 'Fm', sharps: 0, flats: 4 },
  { major: 'Db', minor: 'Bbm', sharps: 0, flats: 5 },
  { major: 'Gb', minor: 'Ebm', sharps: 0, flats: 6 },
  { major: 'Cb', minor: 'Abm', sharps: 0, flats: 7 },
];

function ScalesPage() {
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [scaleOptions, setScaleOptions] = useState<Record<string, ScaleOptions>>(
    {},
  );

  function handleRandomKey() {
    const randomIndex = Math.floor(Math.random() * circleOfFifths.length);
    const randomKey = circleOfFifths[randomIndex];
    setSelectedKey(randomKey.major);
  }

  function handleOptionChange(
    keyMajor: string,
    optionKey: keyof ScaleOptions,
    checked: boolean,
  ) {
    setScaleOptions((prev) => {
      const currentOptions: ScaleOptions = {
        oneHand: prev[keyMajor]?.oneHand ?? false,
        twoHands: prev[keyMajor]?.twoHands ?? false,
        fourOctaves: prev[keyMajor]?.fourOctaves ?? false,
        twoFiveOne: prev[keyMajor]?.twoFiveOne ?? false,
        natural: prev[keyMajor]?.natural ?? false,
        harmonic: prev[keyMajor]?.harmonic ?? false,
        melodic: prev[keyMajor]?.melodic ?? false,
      };
      return {
        ...prev,
        [keyMajor]: {
          ...currentOptions,
          [optionKey]: checked,
        },
      };
    });
  }

  function getOptionValue(
    keyMajor: string,
    optionKey: keyof ScaleOptions,
  ): boolean {
    return scaleOptions[keyMajor]?.[optionKey] ?? false;
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Гами</h1>
          <p className="text-muted-foreground">
            Квінто-квартовий круг тональностей
          </p>
        </div>
        <Button onClick={handleRandomKey} className="gap-2">
          <IconDice className="size-4" />
          Випадкова тональність
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {circleOfFifths.map((key) => {
          const isSelected = selectedKey === key.major;
          return (
            <Card
              key={key.major}
              className={
                isSelected
                  ? 'bg-green-50/50 dark:bg-green-950/20 border-green-200 dark:border-green-900 min-w-[280px]'
                  : 'min-w-[280px]'
              }
            >
              <CardContent className="pt-6 pb-4">
                <div className="flex items-center gap-4">
                  <div className="shrink-0 w-20 flex flex-col items-center justify-center">
                    <div className="text-2xl font-bold text-center">{key.major}</div>
                    <div className="text-sm text-blue-600 dark:text-blue-400 font-medium text-center">
                      {key.minor}
                    </div>
                    <div className="flex gap-2 text-xs mt-1 justify-center">
                      {key.sharps > 0 && (
                        <div className="flex items-center gap-1">
                          <span className="text-sm">♯</span>
                          <span>{key.sharps}</span>
                        </div>
                      )}
                      {key.flats > 0 && (
                        <div className="flex items-center gap-1">
                          <span className="text-sm">♭</span>
                          <span>{key.flats}</span>
                        </div>
                      )}
                      {key.sharps === 0 && key.flats === 0 && (
                        <div className="text-muted-foreground">—</div>
                      )}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col gap-1.5">
                      {scaleOptionsLabels.map((option) => (
                        <div
                          key={option.key}
                          className="flex items-center gap-2 text-xs"
                        >
                          <Checkbox
                            id={`${key.major}-${option.key}`}
                            checked={getOptionValue(
                              key.major,
                              option.key as keyof ScaleOptions,
                            )}
                            onCheckedChange={(checked) =>
                              handleOptionChange(
                                key.major,
                                option.key as keyof ScaleOptions,
                                checked === true,
                              )
                            }
                          />
                          <Label
                            htmlFor={`${key.major}-${option.key}`}
                            className="text-xs cursor-pointer leading-tight"
                          >
                            {option.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export default ScalesPage;
