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
import { cloneDeep } from 'lodash';
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
  shareParams,
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

// 单个图表内部自己定制拿到的筛选条件
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
    order_code: [],
    name_en: [],
    month: [],
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

const getDashBoardsFilters = (dashBoardsFilters: Array<any>) => {
  /**
   * 有时候取数据字段名叫做name_zh 实际筛选列显示country传给后端参数是countrys
   */

  // 筛选列叫 country 实际传参给后端是 name_ens
  
  // const map:any = {
  //   name_zh: 'country',
  // };
  const dashBoardsFiltersCopy = cloneDeep(dashBoardsFilters);
  // dashBoardsFiltersCopy.forEach(item => {
  //   if(map[item.col]) {
  //     item.col = map[item.col];
  //   }
  // })


  let flag = false;
  // 带上flag标记是为了确认dashBoardFilters到底有没有这个筛选。没有就不能对原有筛选进行覆盖
  const selectFiler: any = {
    platform: {
      flag: false,
      data: [],
    },
    sku: {
      flag: false,
      data: [],
    },
    year: {
      flag: false,
      data: [],
    },
    order_code: {
      flag: false,
      data: [],
    },
    name_en: {
      flag: false,
      data: [],
    },
    month: {
      flag: false,
      data: [],
    },
  };
  const filterData: any = {};
  for (const key in selectFiler) {
    let target = dashBoardsFiltersCopy.find((item: any) => item.col === key)?.val;
    if (target) {
      selectFiler[key].flag = true;
      flag = true;
    } else {
      target = [];
    }
    selectFiler[key].data = target;
    filterData[key + 's'] = selectFiler[key];
  }
  // console.log(filterData, 'dashBoardsFilterData');
  return {
    flag,
    filterData,
  };
};

export default memo(function EchartsWaterfall(
  props: WaterfallChartTransformedProps,
) {
  const mapContainer = useRef(null);
  console.log(props, 'googleHeatMapProps-初始渲染了');

  // console.log(props, 'googleHeatMapProps');

  /**
   * 获取props数据进行更新地图处理-updateMap({map,heatmap,data,markers})
   * 联动逻辑变化了再一开始 initMap里面进行处理了。调用接口获取数据进行updateMap
   */

  // const { height, width, echartOptions, refs, onLegendStateChanged } = props;

  const adhocFilters = props.formData.adhocFilters;

  const {
    skus,
    platforms,
    years,
    latitude,
    longtitude,
    order_codes,
    name_ens,
    months,
  } = getFilterData(adhocFilters);

  // 这里直接赋值不会有引用变化
  selectedYears = years;
  selectedPlatforms = platforms;
  selectedSkus = skus;
  latitudeSave = Number(latitude);
  longtitudeSave = Number(longtitude);

  const queryData: any = {
    selectedYears,
    selectedPlatforms,
    selectedSkus,
    rowLimit: undefined,
    order_codes,
    name_ens,
    months,
  };
  const center = { lat: latitudeSave, lng: longtitudeSave };

  // DashBoardsFilters筛选栏优先级高于默认图表
  const dashBoardsFiltersMap = getDashBoardsFilters(
    props.formData.extraFormData.filters || [],
  );
  const { flag, filterData } = dashBoardsFiltersMap;
  // 有数据才会进行覆盖操作
  if (flag) {
    queryData.selectedYears = filterData.years.flag
      ? filterData.years.data
      : queryData.selectedYears;
    queryData.selectedPlatforms = filterData.platforms.flag
      ? filterData.platforms.data
      : queryData.selectedPlatforms;
    queryData.selectedSkus = filterData.skus.flag
      ? filterData.skus.data
      : queryData.selectedSkus;

    const flagList = ['order_codes', 'name_ens', 'months'];
    flagList.forEach(key => {
      if (filterData[key].flag) {
        queryData[key] = filterData[key].data;
      }
    });
  }

  const dataObj = { mapContainer, mapId, queryData, center };

  const spatial = props.formData.spatial;

  if (spatial) {
    shareParams.latitudeKey = spatial.latCol;
    shareParams.longtitudeKey = spatial.lonCol;
  }
  const rowLimit = props.formData.rowLimit;
  if (rowLimit) {
    shareParams.rowLimit = rowLimit;
    dataObj.queryData.rowLimit = rowLimit;
  }

  if (dataObj.queryData?.selectedYears?.length === 0) {
    dataObj.queryData.selectedYears = ['2024', '2025', '2026', '2027', '2028'];
  }

  const colorColumns = props.formData.groupbyColumns || [];
  if (colorColumns.length) {
    shareParams.colorColumns = colorColumns;
  }

  useEffect(() => {
    loadGoogleMapsScript(url, initMap, dataObj);
  }, []);

  return (
    <div className={`GoogleHeatMap ${styles.GoogleHeatMap}`}>
      <FilterModal idleLoadData={idleLoadData} />
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
