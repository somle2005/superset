/**
 * 传参要显示
 * 请求改造成fetch请求
 * 尽可能不使用第三方库 防止无法打包起来就算要用，也需要下到本地源码进行集成
 * 
1-初始化地图-拿接口数据配置
loadGoogleMapsScript(url,key,initMap)
new Map(zoom,center,mapId)
loadaData(data)-1s后调用数据加载地图

2-后续操作
拿到props数据 更新地图
loadData(updateMap)-传递data
updateMap(updateHeatmap-updateMarkers)

updateHeatmap 更新设置map-heatMap

updateMarkers 更新markers
data有数据坐标 开始循环

调用 createMarker 创建 marker
调用 getColorForSku 创建color

监听 marker 点击 click事件
调用 fetchStreetView 获取街景
 */

const createIdleExcute = () => {
  const idleCallbackFn = (task: () => void) => {
    window.requestIdleCallback(deadline => {
      if (deadline.timeRemaining() > 0) {
        task();
      } else {
        idleCallbackFn(task);
      }
    });
  };
  const frameFn = (task: () => void) => {
    const start = Date.now();
    window.requestAnimationFrame(() => {
      if (Date.now() - start < 16.6) {
        task();
      } else {
        frameFn(task);
      }
    });
  };
  const timeoutFn = (task: () => void) => {
    setTimeout(() => {
      task();
    }, 0);
  };
  // @ts-ignore
  if (window.requestIdleCallback) {
    return idleCallbackFn;
    // @ts-ignore
    // eslint-disable-next-line no-else-return
  } else if (window.requestAnimationFrame) {
    return frameFn;
  } else {
    // @ts-ignore
    return timeoutFn;
  }
};

const idleExcute = createIdleExcute();

const years: string[] = [];
const platforms: string[] = [];
const skus: string[] = [];

const selectedYears: string[] = [];
const selectedPlatforms: string[] = [];
let selectedSkus: string[] = [];

let map: google.maps.Map | null = null;
// eslint-disable-next-line prefer-const
let heatmap: google.maps.visualization.HeatmapLayer | null = null;
// eslint-disable-next-line prefer-const
let markers: google.maps.marker.AdvancedMarkerElement[] = [];
const markersVisible = true;
let AdvancedMarkerElement: any;
const imageCache: Record<string, string> = {};

const mapId = 'YOUR_MAP_ID';
const YOUR_API_KEY = 'AIzaSyA4vbd4g988J5ylXA_AsdonSRHvHtSAyPc';
const url = `https://maps.googleapis.com/maps/api/js?key=${YOUR_API_KEY}&libraries=visualization`; // No callback

const mapKey = {
  latitudeKey: 'latitude',
  longtitudeKey: 'longtitude',
};

const colorPalette = [
  '#FF5733',
  '#33FF57',
  '#3357FF',
  '#F333FF',
  '#33FFF5',
  '#FFA733',
  '#571311',
  '#FDF3F7',
  '#A733FF',
  '#33FF9C',
]; // 10 distinct colors for SKUs

export const initData = () => ({
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
  mapKey,
});

/* eslint-disable */
export async function initMap(dataobj: any) {
  // console.log('执行了initMap', window.google);

  const { mapContainer, mapId, queryData, center } = dataobj;

  const { Map } = await google.maps.importLibrary('maps');
  AdvancedMarkerElement = (await google.maps.importLibrary('marker'))
    .AdvancedMarkerElement;

  console.log(mapContainer.current, 'mapContainer.current');
  map = new Map(mapContainer.current, {
    zoom: 6,
    // center: { lat: 38.913611, lng: -77.013222 },
    center: center,
    mapId,
  });

  // 绘制纬线
  for (let lat = -90; lat <= 90; lat += 10) {
    new google.maps.Polyline({
      map: map,
      path: [
        { lat: lat, lng: -180 }, // 左侧边界
        { lat: lat, lng: 0 }, // 中点
        { lat: lat, lng: 180 }, // 右侧边界
      ],
      strokeColor: '#000000',
      strokeOpacity: 0.5,
      strokeWeight: 1,
    });
  }
  idleLoadData(queryData);
}

export function idleLoadData(queryData: any, delay = 1000) {
  setTimeout(() => {
    // 浏览器有空闲时间才进行执行
    selectedSkus = queryData.selectedSkus;
    idleExcute(() => loadData(queryData));
  }, delay);
}

export function loadGoogleMapsScript(
  url: string,
  callback: Function,
  dataObj: any,
) {
  const script = document.createElement('script');

  script.src = url;
  script.type = 'text/javascript';
  script.async = true;
  script.defer = true;
  // script.onload = initMap;
  script.onload = function () {
    callback(dataObj);
  };

  document.head.appendChild(script);
}

function getColorForSku(sku: string): string {
  const skuIndex = selectedSkus.indexOf(sku);
  return colorPalette[skuIndex % colorPalette.length]; // Rotate through the colors
}

function updateHeatmap(data: any[], map: any, heatmap: any) {
  if (!map) return;

  const points = data
    .filter(row => row.latitude && row.longtitude)
    .map(row => new google.maps.LatLng(row.latitude, row.longtitude));


  if (heatmap) heatmap.setMap(null);

  // eslint-disable-next-line no-param-reassign
  heatmap = new google.maps.visualization.HeatmapLayer({
    data: points,
    map,
  });
}

function createMarker(
  row: any,
  color: string,
): google.maps.marker.AdvancedMarkerElement {
  // Create a pin element with custom styles.
  const pin = new google.maps.marker.PinElement({
    scale: 0.8, // Adjust the scale of the pin
    background: color, // Set the pin's background color based on SKU
  });

  // Create the marker with the customized pin element.
  return new AdvancedMarkerElement({
    map: markersVisible ? map : null,
    position: new google.maps.LatLng(row.latitude, row.longtitude),
    content: pin.element, // Apply the customized pin element
  });
}

async function fetchStreetView(
  latitude: number,
  longitude: number,
): Promise<string | null> {
  const cacheKey = `${latitude},${longitude}`;
  if (imageCache[cacheKey]) return imageCache[cacheKey];

  try {
    const response = await fetch(
      `https://kerwin.org.cn/api/street-view?latitude=${latitude}&longitude=${longitude}`,
      { method: 'GET' },
    );

    const blobFetch = await response.blob();
    const data = await blobFetch;

    const imageUrl = URL.createObjectURL(data);
    imageCache[cacheKey] = imageUrl;
    return imageUrl;
  } catch (error) {
    console.error('获取Street View图像时出错:', error);
    return null;
  }
}

function updateMarkers(data: any[], markers: any[]) {
  markers.forEach(marker => marker.setMap(null));
  // eslint-disable-next-line no-param-reassign
  markers = [];

  const infoWindow = new google.maps.InfoWindow();

  data.forEach(row => {
    if (row.latitude && row.longtitude) {
      const color = getColorForSku(row.sku);
      const marker = createMarker(row, color);
      marker.content.addEventListener('click', async () => {
        const streetViewUrl = await fetchStreetView(
          row.latitude,
          row.longtitude,
        );
        if (streetViewUrl) {
          infoWindow.setContent(`
              <div>
                <p>买家名称: ${row.buyer_name}</p>
                <p>国家名称: ${row.country_code}</p>
                <p>城市名称: ${row.city_name}</p>
                <p>平台: ${row.platform}</p>
                <p>SKU: ${row.sku}</p>
                <p>纬度: ${row.latitude}</p>
                <p>经度: ${row.longtitude}</p>
                <img src="${streetViewUrl}" alt="Street View Image" style="width:auto;height:auto;">
              </div>
            `);
          infoWindow.open(map, marker);
        }
      });
      markers.push(marker);
    }
  });
}

export function updateMap(updateMapData: {
  map: any;
  heatmap: any;
  data: any[];
  markers: any[];
}) {
  const { map, heatmap, data, markers } = updateMapData;
  updateHeatmap(map, heatmap, data);
  updateMarkers(data, markers);
}
export async function loadData(query: {
  selectedYears: any[];
  selectedPlatforms: any[];
  selectedSkus: any[];
}) {
  const { selectedYears, selectedPlatforms, selectedSkus } = query;
  const apiUrl = `https://kerwin.org.cn/api/data?years=${selectedYears.join(
    ',',
  )}&platforms=${selectedPlatforms.join(',')}&skus=${selectedSkus.join(',')}`;
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    if (Array.isArray(data)) {
      data.forEach(row => {
        row.latitude = row[mapKey.latitudeKey]
        row.longtitude = row[mapKey.longtitudeKey]
      })
      updateMap({
        map,
        heatmap,
        data,
        markers,
      });
    }
  } catch (error) {
    console.error('获取数据时出错:', error);
  }
}
