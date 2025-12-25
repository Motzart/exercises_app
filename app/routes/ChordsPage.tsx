import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';

interface ChordProgression {
  key: string;
  ii: string;
  V: string;
  I: string;
}

const majorChordProgressions: ChordProgression[] = [
  { key: 'C', ii: 'Dm7', V: 'G7', I: 'Cmaj7' },
  { key: 'Bb', ii: 'Cm7', V: 'F7', I: 'Bbmaj7' },
  { key: 'B', ii: 'C#m7', V: 'F#7', I: 'Bmaj7' },
  { key: 'A', ii: 'Bm7', V: 'E7', I: 'Amaj7' },
  { key: 'Ab', ii: 'Bbm7', V: 'Eb7', I: 'Abmaj7' },
  { key: 'G', ii: 'Am7', V: 'D7', I: 'Gmaj7' },
  { key: 'Gb', ii: 'Abm7', V: 'Db7', I: 'Gbmaj7' },
  { key: 'F', ii: 'Gm7', V: 'C7', I: 'Fmaj7' },
  { key: 'E', ii: 'F#m7', V: 'B7', I: 'Emaj7' },
  { key: 'Eb', ii: 'Fm7', V: 'Bb7', I: 'Ebmaj7' },
  { key: 'D', ii: 'Em7', V: 'A7', I: 'Dmaj7' },
  { key: 'Db', ii: 'Ebm7', V: 'Ab7', I: 'Dbmaj7' },
];

const minorChordProgressions: ChordProgression[] = [
  { key: 'Cm', ii: 'Dm7b5', V: 'G7', I: 'Cm7' },
  { key: 'Bbm', ii: 'Cm7b5', V: 'F7', I: 'Bbm7' },
  { key: 'Bm', ii: 'C#m7b5', V: 'F#7', I: 'Bm7' },
  { key: 'Am', ii: 'Bm7b5', V: 'E7', I: 'Am7' },
  { key: 'Abm', ii: 'Bbm7b5', V: 'Eb7', I: 'Abm7' },
  { key: 'Gm', ii: 'Am7b5', V: 'D7', I: 'Gm7' },
  { key: 'Gbm', ii: 'Abm7b5', V: 'Db7', I: 'Gbm7' },
  { key: 'Fm', ii: 'Gm7b5', V: 'C7', I: 'Fm7' },
  { key: 'Em', ii: 'F#m7b5', V: 'B7', I: 'Em7' },
  { key: 'Ebm', ii: 'Fm7b5', V: 'Bb7', I: 'Ebm7' },
  { key: 'Dm', ii: 'Em7b5', V: 'A7', I: 'Dm7' },
  { key: 'Dbm', ii: 'Ebm7b5', V: 'Ab7', I: 'Dbm7' },
];

function ChordsPage() {
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Таблиця акордів 2-5-1</h1>
        <p className="text-muted-foreground">
          Прогресія 2-5-1 у всіх тональностях
        </p>
      </div>

      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Мажорні тональності</h2>
          <div className="rounded-lg border">
            <Table>
              <TableHeader className="bg-muted">
                <TableRow>
                  <TableHead className="font-semibold">Тональність</TableHead>
                  <TableHead className="font-semibold">
                    ii (minor 7th)
                  </TableHead>
                  <TableHead className="font-semibold">
                    V (dominant 7th)
                  </TableHead>
                  <TableHead className="font-semibold">
                    I (major 7th)
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {majorChordProgressions.map((progression) => (
                  <TableRow key={progression.key}>
                    <TableCell className="font-medium text-lg">
                      {progression.key}
                    </TableCell>
                    <TableCell className="text-base">{progression.ii}</TableCell>
                    <TableCell className="text-base">{progression.V}</TableCell>
                    <TableCell className="text-base">{progression.I}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4">Мінорні тональності</h2>
          <div className="rounded-lg border">
            <Table>
              <TableHeader className="bg-muted">
                <TableRow>
                  <TableHead className="font-semibold">Тональність</TableHead>
                  <TableHead className="font-semibold">
                    ii (m7b5)
                  </TableHead>
                  <TableHead className="font-semibold">
                    V (dominant 7th)
                  </TableHead>
                  <TableHead className="font-semibold">
                    i (minor 7th)
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {minorChordProgressions.map((progression) => (
                  <TableRow key={progression.key}>
                    <TableCell className="font-medium text-lg">
                      {progression.key}
                    </TableCell>
                    <TableCell className="text-base">{progression.ii}</TableCell>
                    <TableCell className="text-base">{progression.V}</TableCell>
                    <TableCell className="text-base">{progression.I}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChordsPage;