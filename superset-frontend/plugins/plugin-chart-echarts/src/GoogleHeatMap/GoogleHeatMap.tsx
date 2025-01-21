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
import { WaterfallChartTransformedProps } from './types';
import { useRef } from 'react';
import { initData, initMap, loadGoogleMapsScript, updateMap } from './utils';

// let map: google.maps.Map | null = null;
// let heatmap: google.maps.visualization.HeatmapLayer | null = null;
// let markers: google.maps.marker.AdvancedMarkerElement[] = [];
// let markersVisible = true;
// let AdvancedMarkerElement: any;

/* eslint-disable */

/* <script async
    src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&loading=async&libraries=visualization&callback=initMap">
</script> */

// async function fetchStreetView(latitude: number, longitude: number): Promise<string | null> {
//   const cacheKey = `${latitude},${longitude}`
//   // if (imageCache[cacheKey]) return imageCache[cacheKey]

//   try {

//     const response = await fetch(
//       `https://kerwin.org.cn/api/street-view?latitude=${latitude}&longitude=${longitude}`,
//       { method: 'GET' },
//     );

//     const blobFetch = await response.blob();
//     const data = await blobFetch;
//     console.log(data,'blobFetchData-blobFetchData');

//     console.log('marker标记点击', data)
//     const imageUrl = URL.createObjectURL(data)
//     // imageCache[cacheKey] = imageUrl
//     return imageUrl
//   } catch (error) {
//     console.error('获取Street View图像时出错:', error)
//     return null
//   }
// }

// fetchStreetView(41.747041,-87.607832)

const {
  imageCache,
  selectedSkus,
  mapId,
  YOUR_API_KEY,
  url,
  map,
  heatmap,
  markers,
} = initData();

export default function EchartsWaterfall(
  props: WaterfallChartTransformedProps,
) {
  const mapContainer = useRef(null);


  const dataObj = { mapContainer, mapId };

  // const { height, width, echartOptions, refs, onLegendStateChanged } = props;

  // const url = `https://maps.googleapis.com/maps/api/js?key=${YOUR_API_KEY}&loading=async&libraries=visualization&callback=initMap`;

  console.log(props,'props')

  loadGoogleMapsScript(url, initMap, dataObj);

  // 获取props数据进行更新地图处理

  //updateMap({map,heatmap,data,markers})

  return (
    <div className="GoogleHeatMap">
      <div
        id="map"
        ref={mapContainer}
        style={{ width: '100%', height: '100vh' }}
      ></div>
      GoogleHeatMap展示出来
    </div>
  );
}
