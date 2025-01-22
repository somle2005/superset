/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import { useRef } from 'react';
import { WaterfallChartTransformedProps } from './types';
import { initData, initMap, loadGoogleMapsScript } from './utils';

/* eslint-disable */

let {
  imageCache,
  mapId,
  YOUR_API_KEY,
  url,
  map,
  heatmap,
  markers,
  selectedYear,
  selectedPlatforms,
  selectedSkus,
} = initData();

// const testData = () => {
//   selectedYear = [];
//   selectedPlatforms = [];
//   selectedSkus = ['A106001MB'];
//   const queryData = { selectedYear, selectedPlatforms, selectedSkus };
//   const center = { lat: 38.913611, lng: -77.013222 };

//   const dataObj = { mapContainer, mapId, queryData, center };
// }

const getFilterData = (adhocFilters: any) => {
  const latitude =
    adhocFilters.find((item: any) => item.subject === 'latitude')?.comparator ??
    38.913611;
  const longtitude =
    adhocFilters.find((item: any) => item.subject === 'longtitude')
      ?.comparator ?? -77.013222;

  const selectFiler: any = {
    platform: [],
    sku: [],
    year: [],
  };

  const filterData: any = {
    latitude,
    longtitude,
  };

  for (const key in selectFiler) {
    const target =
      adhocFilters.find((item: any) => item.subject === key)?.comparator || [];
    selectFiler[key] = target;
    filterData[key + 's'] = selectFiler[key];
  }
  // console.log(filterData, 'filterData');
  return filterData;
};

export default function EchartsWaterfall(
  props: WaterfallChartTransformedProps,
) {
  const mapContainer = useRef(null);

  // console.log(props, 'googleHeatMapProps');

  /**
   * 获取props数据进行更新地图处理-updateMap({map,heatmap,data,markers})
   * 联动逻辑变化了再一开始 initMap里面进行处理了。调用接口获取数据进行updateMap
   */

  const adhocFilters = props.formData.adhocFilters;

  const { skus, platforms, years, latitude, longtitude } =
    getFilterData(adhocFilters);

  // 这里直接赋值不会有引用变化
  selectedYear = years;
  selectedPlatforms = platforms;
  selectedSkus = skus;
  const queryData = { selectedYear, selectedPlatforms, selectedSkus };
  const center = { lat: Number(latitude), lng: Number(longtitude) };

  const dataObj = { mapContainer, mapId, queryData, center };

  // const { height, width, echartOptions, refs, onLegendStateChanged } = props;

  loadGoogleMapsScript(url, initMap, dataObj);

  return (
    <div className="GoogleHeatMap">
      <div
        id="map"
        ref={mapContainer}
        style={{ width: '100%', height: '100vh' }}
      ></div>
    </div>
  );
}
