import { useEffect, useState } from 'react';

function loadOptions() {
  return fetch('https://kerwin.org.cn/api/options');
}

export function useFilterSelect() {
  const [platformsSelect, setPlatformsSelect] = useState<any>([]);
  const [skusSelect, setSkusSelect] = useState<any>([]);
  const [yearsSelect, setYearsSelect] = useState<any>([]);

  const [platformsVal, setPlatformsVal] = useState<any>([]);
  const [skusVal, setSkusVal] = useState<any>([]);
  const [yearsVal, setYearsVal] = useState<any>([]);

  useEffect(() => {
    loadOptions()
      .then(response => response.json())
      .then(res => {
        const { platforms, skus, years } = res;
        setPlatformsSelect(platforms.filter((item: any) => item) || []);
        setSkusSelect(skus.filter((item: any) => item) || []);
        setYearsSelect(years.filter((item: any) => item) || []);
        console.log(res, 'loadOptions');
      })
      .catch(e => {
        console.log(e, 'loadOptions error');
      });
  }, []);

  return {
    platformsSelect,
    skusSelect,
    yearsSelect,
    platformsVal,
    setPlatformsVal,
    skusVal,
    setSkusVal,
    yearsVal,
    setYearsVal,
  };
}
