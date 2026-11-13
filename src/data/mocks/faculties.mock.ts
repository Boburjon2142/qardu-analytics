export interface FacultyMeta {
  id: string;
  name: string;
  shortName: string;
  establishedYear: number;
}

export const FACULTIES_LIST: FacultyMeta[] = [
  { id: "mat-comp", name: "Matematika va kompyuter ilmlari fakulteti", shortName: "Matematika va KI", establishedYear: 1992 },
  { id: "phys-tech", name: "Fizika va texnologik ta'lim fakulteti", shortName: "Fizika va TT", establishedYear: 1992 },
  { id: "chem-bio", name: "Kimyo va biologiya fakulteti", shortName: "Kimyo-biologiya", establishedYear: 1993 },
  { id: "geo-agro", name: "Geografiya va agronomiya fakulteti", shortName: "Geografiya", establishedYear: 1995 },
  { id: "hist-phil", name: "Tarix va falsafa fakulteti", shortName: "Tarix", establishedYear: 1992 },
  { id: "uzb-phil", name: "O'zbek filologiyasi fakulteti", shortName: "O'zbek filologiyasi", establishedYear: 1992 },
  { id: "for-lang", name: "Xorijiy tillar fakulteti", shortName: "Xorijiy tillar", establishedYear: 1994 },
  { id: "pedagogy", name: "Pedagogika fakulteti", shortName: "Pedagogika", establishedYear: 2001 },
  { id: "arts", name: "San'atshunoslik fakulteti", shortName: "San'atshunoslik", establishedYear: 2005 },
  { id: "phys-cult", name: "Jismoniy madaniyat fakulteti", shortName: "Jismoniy madaniyat", establishedYear: 1998 },
  { id: "econ-tour", name: "Iqtisodiyot va turizm fakulteti", shortName: "Iqtisodiyot", establishedYear: 2018 },
  { id: "law", name: "Huquqshunoslik fakulteti", shortName: "Huquqshunoslik", establishedYear: 2021 },
];
