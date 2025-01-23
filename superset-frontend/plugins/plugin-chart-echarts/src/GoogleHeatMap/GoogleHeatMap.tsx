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

import { useRef, memo, useEffect } from 'react';
// @ts-ignore
import styles from './style/index.module.less';
// import './style/index.css';
import { WaterfallChartTransformedProps } from './types';
import { initData, initMap, loadGoogleMapsScript, idleLoadData } from './utils';
import FilterModal from './component/FilterModal';
import GoogleMap from './component/GoogleMap';

/* eslint-disable */

let {
  imageCache,
  mapId,
  YOUR_API_KEY,
  url,
  map,
  heatmap,
  markers,
  selectedYears,
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

let latitudeSave = 38.913611;
let longtitudeSave = -77.013222;

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

const getDashBoardsFilters = (dashBoardsFilters: any) => {
  let flag = false
  // 带上flag标记是为了确认dashBoardFilters到底有没有这个筛选。没有就不能对原有筛选进行覆盖
  const selectFiler: any = {
    platform: {
      flag: false,
      data:[]
    },
    sku: {
      flag: false,
      data:[]
    },
    year: {
      flag: false,
      data:[]
    },
  };
  const filterData: any = {};
  for (const key in selectFiler) {
    let target =  dashBoardsFilters.find((item: any) => item.col === key)?.val
    if(target){
      selectFiler[key].flag = true;
      flag = true
    } else {
      target = []
    }
    selectFiler[key].data = target;
    filterData[key + 's'] = selectFiler[key];
  }
  console.log(filterData, 'filterData');
  return {
    flag,
    filterData,
  };

}

export default memo(function EchartsWaterfall(
  props: WaterfallChartTransformedProps,
) {

 

  const mapContainer = useRef(null);
  console.log(props, 'googleHeatMapProps-重复渲染了');

  // console.log(props, 'googleHeatMapProps');

  /**
   * 获取props数据进行更新地图处理-updateMap({map,heatmap,data,markers})
   * 联动逻辑变化了再一开始 initMap里面进行处理了。调用接口获取数据进行updateMap
   */

  // const { height, width, echartOptions, refs, onLegendStateChanged } = props;

  const adhocFilters = props.formData.adhocFilters;

  const { skus, platforms, years, latitude, longtitude } =
    getFilterData(adhocFilters);

  // 这里直接赋值不会有引用变化
  selectedYears = years;
  selectedPlatforms = platforms;
  selectedSkus = skus;
  latitudeSave = Number(latitude);
  longtitudeSave = Number(longtitude);

  const queryData = { selectedYears, selectedPlatforms, selectedSkus };
  const center = { lat: latitudeSave, lng: longtitudeSave };

 


  // Filters筛选栏优先级高于默认图表
  const dashBoardsFiltersMap =  getDashBoardsFilters(props.formData.extraFormData.filters || [])
  const {flag, filterData} = dashBoardsFiltersMap
  // 有数据才会进行覆盖操作
  if(flag){
    queryData.selectedYears = filterData.years.flag ? filterData.years.data : queryData.selectedYears
    queryData.selectedPlatforms = filterData.platforms.flag? filterData.platforms.data : queryData.selectedPlatforms
    queryData.selectedSkus = filterData.skus.flag ? filterData.skus.data : queryData.selectedSkus
  }
 
  const dataObj = { mapContainer, mapId, queryData, center };

   useEffect(() => {
    loadGoogleMapsScript(url, initMap, dataObj);
   },[])


  return (
    <div className={`GoogleHeatMap ${styles.GoogleHeatMap}`}>
      <FilterModal idleLoadData={idleLoadData}  />
      <GoogleMap ref={mapContainer} />
      {/* <div
        id="map"
        ref={mapContainer}
        style={{ width: '100%', height: '100%' }}
        // style={{ width: '100%', height: 'calc(100vh - 40px)' }}
      ></div> */}
      {/* 筛选项 */}
    </div>
  );
});
