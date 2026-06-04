import type { DataPoint } from "./warming-stripes";

export const COLORS_CATNAT = [
  "#fde8d8",
  "#f6b18b",
  "#e07040",
  "#b03020",
  "#7a0c0c",
];
export const COLORS_FLOODS = [
  "#d6eaf8",
  "#85c1e9",
  "#2e86c1",
  "#1a5276",
  "#0d2b5e",
];
export const COLORS_DROUGHTS = [
  "#fef9e7",
  "#f9e79f",
  "#d4a017",
  "#a04000",
  "#6e2e00",
];
export const COLORS_RECOGNITION = [
  "#87d190",
  "#5cad6a",
  "#2e8b4a",
  "#1a5c38",
  "#0d3320",
];

const catnatData: DataPoint[] = [
  { year: 1984, value: 7 },
  { year: 1985, value: 6 },
  { year: 1986, value: 8 },
  { year: 1987, value: 12 },
  { year: 1988, value: 12 },
  { year: 1989, value: 12 },
  { year: 1990, value: 11 },
  { year: 1991, value: 9 },
  { year: 1992, value: 15 },
  { year: 1993, value: 17 },
  { year: 1994, value: 21 },
  { year: 1995, value: 14 },
  { year: 1996, value: 13 },
  { year: 1997, value: 12 },
  { year: 1998, value: 11 },
  { year: 1999, value: 13 },
  { year: 2000, value: 19 },
  { year: 2001, value: 18 },
  { year: 2002, value: 16 },
  { year: 2003, value: 17 },
  { year: 2004, value: 8 },
  { year: 2005, value: 26 },
  { year: 2006, value: 22 },
  { year: 2007, value: 19 },
  { year: 2008, value: 24 },
  { year: 2009, value: 21 },
  { year: 2010, value: 20 },
  { year: 2011, value: 26 },
  { year: 2012, value: 21 },
  { year: 2013, value: 25 },
  { year: 2014, value: 30 },
  { year: 2015, value: 18 },
  { year: 2016, value: 27 },
  { year: 2017, value: 24 },
  { year: 2018, value: 31 },
  { year: 2019, value: 27 },
  { year: 2020, value: 24 },
  { year: 2021, value: 29 },
  { year: 2022, value: 29 },
  { year: 2023, value: 30 },
  { year: 2024, value: 34 },
  { year: 2025, value: 28 },
];

const floodsData: DataPoint[] = [
  { year: 1984, value: 6 },
  { year: 1985, value: 6 },
  { year: 1986, value: 6 },
  { year: 1987, value: 10 },
  { year: 1988, value: 12 },
  { year: 1989, value: 10 },
  { year: 1990, value: 11 },
  { year: 1991, value: 8 },
  { year: 1992, value: 15 },
  { year: 1993, value: 16 },
  { year: 1994, value: 20 },
  { year: 1995, value: 14 },
  { year: 1996, value: 13 },
  { year: 1997, value: 12 },
  { year: 1998, value: 11 },
  { year: 1999, value: 13 },
  { year: 2000, value: 17 },
  { year: 2001, value: 16 },
  { year: 2002, value: 16 },
  { year: 2003, value: 13 },
  { year: 2004, value: 7 },
  { year: 2005, value: 19 },
  { year: 2006, value: 11 },
  { year: 2007, value: 13 },
  { year: 2008, value: 14 },
  { year: 2009, value: 12 },
  { year: 2010, value: 14 },
  { year: 2011, value: 15 },
  { year: 2012, value: 11 },
  { year: 2013, value: 13 },
  { year: 2014, value: 20 },
  { year: 2015, value: 12 },
  { year: 2016, value: 15 },
  { year: 2017, value: 12 },
  { year: 2018, value: 19 },
  { year: 2019, value: 15 },
  { year: 2020, value: 14 },
  { year: 2021, value: 20 },
  { year: 2022, value: 20 },
  { year: 2023, value: 17 },
  { year: 2024, value: 23 },
  { year: 2025, value: 16 },
];

const droughtsData: DataPoint[] = [
  { year: 1984, value: 0 },
  { year: 1985, value: 0 },
  { year: 1986, value: 0 },
  { year: 1987, value: 0 },
  { year: 1988, value: 0 },
  { year: 1989, value: 0 },
  { year: 1990, value: 0 },
  { year: 1991, value: 0 },
  { year: 1992, value: 0 },
  { year: 1993, value: 0 },
  { year: 1994, value: 0 },
  { year: 1995, value: 0 },
  { year: 1996, value: 0 },
  { year: 1997, value: 0 },
  { year: 1998, value: 0 },
  { year: 1999, value: 0 },
  { year: 2000, value: 0 },
  { year: 2001, value: 2 },
  { year: 2002, value: 0 },
  { year: 2003, value: 4 },
  { year: 2004, value: 1 },
  { year: 2005, value: 7 },
  { year: 2006, value: 11 },
  { year: 2007, value: 6 },
  { year: 2008, value: 10 },
  { year: 2009, value: 9 },
  { year: 2010, value: 5 },
  { year: 2011, value: 11 },
  { year: 2012, value: 10 },
  { year: 2013, value: 11 },
  { year: 2014, value: 10 },
  { year: 2015, value: 5 },
  { year: 2016, value: 12 },
  { year: 2017, value: 11 },
  { year: 2018, value: 12 },
  { year: 2019, value: 11 },
  { year: 2020, value: 10 },
  { year: 2021, value: 9 },
  { year: 2022, value: 9 },
  { year: 2023, value: 13 },
  { year: 2024, value: 9 },
  { year: 2025, value: 11 },
];

const recognitionData: DataPoint[] = [
  { year: 1984, value: 100 },
  { year: 1985, value: 100 },
  { year: 1986, value: 100 },
  { year: 1987, value: 100 },
  { year: 1988, value: 100 },
  { year: 1989, value: 100 },
  { year: 1990, value: 100 },
  { year: 1991, value: 100 },
  { year: 1992, value: 100 },
  { year: 1993, value: 100 },
  { year: 1994, value: 100 },
  { year: 1995, value: 100 },
  { year: 1996, value: 100 },
  { year: 1997, value: 100 },
  { year: 1998, value: 100 },
  { year: 1999, value: 100 },
  { year: 2000, value: 100 },
  { year: 2001, value: 100 },
  { year: 2002, value: 100 },
  { year: 2003, value: 100 },
  { year: 2004, value: 100 },
  { year: 2005, value: 43 },
  { year: 2006, value: 84 },
  { year: 2007, value: 78 },
  { year: 2008, value: 67 },
  { year: 2009, value: 91 },
  { year: 2010, value: 81 },
  { year: 2011, value: 56 },
  { year: 2012, value: 59 },
  { year: 2013, value: 60 },
  { year: 2014, value: 69 },
  { year: 2015, value: 70 },
  { year: 2016, value: 56 },
  { year: 2017, value: 49 },
  { year: 2018, value: 78 },
  { year: 2019, value: 70 },
  { year: 2020, value: 55 },
  { year: 2021, value: 62 },
  { year: 2022, value: 44 },
  { year: 2023, value: 74 },
  { year: 2024, value: 56 },
  { year: 2025, value: 39 },
];

const catnatAnnotation = (
  <span className="text-xs lg:text-sm text-gray-600">
    En 2024, <strong>34</strong> CatNat sont survenues
  </span>
);

const floodsAnnotation = (
  <span className="text-xs lg:text-sm text-gray-600">
    <strong>23</strong> Inondations sont survenues en 2024
  </span>
);

const droughtsAnnotation = (
  <span className="text-xs lg:text-sm text-gray-600">
    Les Sécheresses représentent <strong>56%</strong> des CatNat depuis 2010
  </span>
);

const recognitionAnnotation = (
  <span className="text-xs lg:text-sm text-gray-600">
    La <strong>reconnaissance</strong> de CatNat a atteint un taux minimum de{" "}
    <strong>39%</strong> en 2025
  </span>
);

const desktopStats = [
  {
    id: 1,
    caption: "CatNat",
    data: catnatData,
    colors: COLORS_CATNAT,
    unit: "événements",
    annotation: catnatAnnotation,
  },
  {
    id: 2,
    caption: "Dont inondations",
    data: floodsData,
    colors: COLORS_FLOODS,
    unit: "événements",
    annotation: floodsAnnotation,
  },
  {
    id: 3,
    caption: "Dont sécheresses",
    data: droughtsData,
    colors: COLORS_DROUGHTS,
    unit: "événements",
    annotation: droughtsAnnotation,
  },
  {
    id: 4,
    caption: "Taux de Reconnaissance",
    data: recognitionData,
    colors: COLORS_RECOGNITION,
    unit: "%",
    annotation: recognitionAnnotation,
  },
];

export { desktopStats };
