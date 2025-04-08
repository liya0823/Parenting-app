'use client';
import { useState, useEffect, useCallback } from 'react';
import { GoogleMap, LoadScript, MarkerF } from '@react-google-maps/api';
import Image from 'next/image';
import styles from './page.module.css';
import { useRouter } from 'next/navigation';

// 定義店家資料類型
interface Store {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address: string;
  phone: string;
  reservation_link: string;
  google_maps_link: string;
  images: string[];  // 添加圖片陣列
  facilities: {    // 新增設施資訊
    washingArea?: boolean;    // 清洗區
    heatingEquipment?: boolean;  // 加熱設備
    restArea?: boolean;     // 休息區
    sterilizationArea?: boolean;  // 消毒區
    powderRoom?: boolean;   // 化妝室
  };
}

// 模擬的店家資料
const stores: Store[] = [
  // 台北信義區
  {
    id: '1',
    name: '台北101育嬰室',
    lat: 25.033976,
    lng: 121.564472,
    address: '台北市信義區信義路五段7號 5F',
    phone: '02-8101-8800',
    reservation_link: 'https://www.taipei-101.com.tw/tw/observatory-info/',
    google_maps_link: 'https://maps.google.com/?q=25.033976,121.564472',
    images: ['20', '21'],
    facilities: {
      washingArea: true,
      heatingEquipment: true,
      restArea: true,
      sterilizationArea: false,
      powderRoom: false
    }
  },
  {
    id: '2',
    name: '微風信義育嬰室',
    lat: 25.036988,
    lng: 121.567021,
    address: '台北市信義區忠孝東路五段68號 B1',
    phone: '02-8789-3388',
    reservation_link: 'https://www.breezecenter.com/xinyi/',
    google_maps_link: 'https://maps.google.com/?q=25.036988,121.567021',
    images: ['22', '23'],
    facilities: {
      washingArea: true,
      heatingEquipment: true,
      restArea: true,
      sterilizationArea: true,
      powderRoom: true
    }
  },
  {
    id: '3',
    name: '誠品信義育嬰室',
    lat: 25.039847,
    lng: 121.565743,
    address: '台北市信義區松高路11號 B2',
    phone: '02-8789-3388',
    reservation_link: 'https://www.eslitecorp.com/eslite/service/store/store.jsp?store_id=K100',
    google_maps_link: 'https://maps.google.com/?q=25.039847,121.565743',
    images: ['24', '25'],
    facilities: {
      washingArea: true,
      heatingEquipment: false,
      restArea: true,
      sterilizationArea: true,
      powderRoom: false
    }
  },
  {
    id: '4',
    name: '新光三越信義育嬰室',
    lat: 25.036565,
    lng: 121.566477,
    address: '台北市信義區松高路19號 7F',
    phone: '02-2722-8369',
    reservation_link: 'https://www.skm.com.tw/store/7',
    google_maps_link: 'https://maps.google.com/?q=25.036565,121.566477',
    images: ['26', '27'],
    facilities: {
      washingArea: true,
      heatingEquipment: true,
      restArea: true,
      sterilizationArea: true,
      powderRoom: true
    }
  },
  {
    id: '5',
    name: '遠東百貨寶慈育嬰室',
    lat: 25.041679,
    lng: 121.564827,
    address: '台北市信義區松高路16號 B1',
    phone: '02-2722-9800',
    reservation_link: 'https://www.feds.com.tw/',
    google_maps_link: 'https://maps.google.com/?q=25.041679,121.564827',
    images: ['28', '29'],
    facilities: {
      washingArea: true,
      heatingEquipment: true,
      restArea: false,
      sterilizationArea: false,
      powderRoom: true
    }
  },
  {
    id: '6',
    name: '統一阪急育嬰室',
    lat: 25.040284,
    lng: 121.563755,
    address: '台北市信義區松高路12號 B1',
    phone: '02-2723-9800',
    reservation_link: 'https://www.hankyu-dept.com.tw/',
    google_maps_link: 'https://maps.google.com/?q=25.040284,121.563755',
    images: ['20', '22'],
    facilities: {
      washingArea: true,
      heatingEquipment: false,
      restArea: true,
      sterilizationArea: true,
      powderRoom: false
    }
  },
  {
    id: '7',
    name: 'ATT 4 FUN育嬰室',
    lat: 25.035645,
    lng: 121.567843,
    address: '台北市信義區松壽路12號 4F',
    phone: '02-7737-8888',
    reservation_link: 'https://www.att4fun.com.tw/',
    google_maps_link: 'https://maps.google.com/?q=25.035645,121.567843',
    images: ['23', '24'],
    facilities: {
      washingArea: true,
      heatingEquipment: true,
      restArea: true,
      sterilizationArea: true,
      powderRoom: true
    }
  },
  {
    id: '8',
    name: '君悅酒店育嬰室',
    lat: 25.038528,
    lng: 121.568678,
    address: '台北市信義區松壽路2號 B1',
    phone: '02-2720-1234',
    reservation_link: 'https://www.taipei.grand.hyatt.com/',
    google_maps_link: 'https://maps.google.com/?q=25.038528,121.568678',
    images: ['25', '26'],
    facilities: {
      washingArea: true,
      heatingEquipment: true,
      restArea: true,
      sterilizationArea: true,
      powderRoom: true
    }
  },

  // 台中
  {
    id: '9',
    name: '台中大遠百育嬰室',
    lat: 24.162102,
    lng: 120.646705,
    address: '台中市西屯區台灣大道三段251號 7F',
    phone: '04-2254-3333',
    reservation_link: 'https://www.feds.com.tw/tw/50',
    google_maps_link: 'https://maps.google.com/?q=24.162102,120.646705',
    images: ['27', '28'],
    facilities: {
      washingArea: true,
      heatingEquipment: false,
      restArea: true,
      sterilizationArea: true,
      powderRoom: true
    }
  },
  {
    id: '10',
    name: '台中市立圖書館',
    lat: 24.144671,
    lng: 120.683427,
    address: '台中市南區五權南路100號',
    phone: '04-2262-3458',
    reservation_link: 'https://www.library.taichung.gov.tw/',
    google_maps_link: 'https://maps.google.com/?q=24.144671,120.683427',
    images: ['29', '20'],
    facilities: {
      washingArea: true,
      heatingEquipment: true,
      restArea: false,
      sterilizationArea: true,
      powderRoom: false
    }
  },

  // 高雄
  {
    id: '11',
    name: '漢神百貨育嬰室',
    lat: 22.619089,
    lng: 120.299061,
    address: '高雄市前金區成功一路266-1號 8F',
    phone: '07-215-7266',
    reservation_link: 'https://www.hanshin.com.tw/',
    google_maps_link: 'https://maps.google.com/?q=22.619089,120.299061',
    images: ['21', '22'],
    facilities: {
      washingArea: true,
      heatingEquipment: true,
      restArea: true,
      sterilizationArea: true,
      powderRoom: true
    }
  },
  {
    id: '12',
    name: '高雄市立圖書館總館',
    lat: 22.613419,
    lng: 120.301889,
    address: '高雄市前鎮區新光路61號',
    phone: '07-536-0238',
    reservation_link: 'https://www.ksml.edu.tw/',
    google_maps_link: 'https://maps.google.com/?q=22.613419,120.301889',
    images: ['23', '24'],
    facilities: {
      washingArea: true,
      heatingEquipment: true,
      restArea: true,
      sterilizationArea: true,
      powderRoom: true
    }
  },

  // 新竹
  {
    id: '13',
    name: '新竹巨城育嬰室',
    lat: 24.806660,
    lng: 120.972008,
    address: '新竹市東區中央路229號 3F',
    phone: '03-534-1166',
    reservation_link: 'https://www.bigcity.com.tw/',
    google_maps_link: 'https://maps.google.com/?q=24.806660,120.972008',
    images: ['25', '26'],
    facilities: {
      washingArea: true,
      heatingEquipment: true,
      restArea: true,
      sterilizationArea: true,
      powderRoom: true
    }
  },
  {
    id: '14',
    name: '新竹市立動物園',
    lat: 24.796781,
    lng: 120.975357,
    address: '新竹市東區食品路66號',
    phone: '03-522-2194',
    reservation_link: 'https://www.hcczoo.gov.tw/',
    google_maps_link: 'https://maps.google.com/?q=24.796781,120.975357',
    images: ['27', '28'],
    facilities: {
      washingArea: true,
      heatingEquipment: true,
      restArea: true,
      sterilizationArea: true,
      powderRoom: true
    }
  },

  // 台南
  {
    id: '15',
    name: '台南新光三越育嬰室',
    lat: 22.993364,
    lng: 120.204130,
    address: '台南市中西區西門路一段658號 6F',
    phone: '06-303-0999',
    reservation_link: 'https://www.skm.com.tw/store/12',
    google_maps_link: 'https://maps.google.com/?q=22.993364,120.204130',
    images: ['29', '20'],
    facilities: {
      washingArea: true,
      heatingEquipment: true,
      restArea: true,
      sterilizationArea: true,
      powderRoom: true
    }
  },
  {
    id: '16',
    name: '奇美博物館',
    lat: 22.935278,
    lng: 120.226551,
    address: '台南市仁德區文華路二段66號',
    phone: '06-266-0808',
    reservation_link: 'https://www.chimeimuseum.org/',
    google_maps_link: 'https://maps.google.com/?q=22.935278,120.226551',
    images: ['21', '22'],
    facilities: {
      washingArea: true,
      heatingEquipment: true,
      restArea: true,
      sterilizationArea: true,
      powderRoom: true
    }
  },
  {
    id: '17',
    name: '林百貨育嬰室',
    lat: 22.989756,
    lng: 120.198756,
    address: '台南市中西區忠義路二段63號',
    phone: '06-221-3000',
    reservation_link: 'https://www.hayashi.com.tw/',
    google_maps_link: 'https://maps.google.com/?q=22.989756,120.198756',
    images: ['23', '24'],
    facilities: {
      washingArea: true,
      heatingEquipment: true,
      restArea: true,
      sterilizationArea: true,
      powderRoom: true
    }
  },
  {
    id: '18',
    name: '蝸牛巷親子餐廳',
    lat: 22.995432,
    lng: 120.201234,
    address: '台南市中西區民族路二段100號',
    phone: '06-222-1234',
    reservation_link: 'https://www.facebook.com/snailalley',
    google_maps_link: 'https://maps.google.com/?q=22.995432,120.201234',
    images: ['25', '26'],
    facilities: {
      washingArea: true,
      heatingEquipment: true,
      restArea: true,
      sterilizationArea: true,
      powderRoom: true
    }
  },
  {
    id: '19',
    name: '台南市立圖書館',
    lat: 22.982345,
    lng: 120.196789,
    address: '台南市中西區公園北路3號',
    phone: '06-251-2222',
    reservation_link: 'https://www.tnml.tn.edu.tw/',
    google_maps_link: 'https://maps.google.com/?q=22.982345,120.196789',
    images: ['27', '28'],
    facilities: {
      washingArea: true,
      heatingEquipment: true,
      restArea: true,
      sterilizationArea: true,
      powderRoom: true
    }
  },
  {
    id: '20',
    name: '藍晒圖文創園區',
    lat: 22.989123,
    lng: 120.197654,
    address: '台南市中西區西門路一段89號',
    phone: '06-221-1777',
    reservation_link: 'https://www.facebook.com/blueprintcultural',
    google_maps_link: 'https://maps.google.com/?q=22.989123,120.197654',
    images: ['29', '20'],
    facilities: {
      washingArea: true,
      heatingEquipment: true,
      restArea: true,
      sterilizationArea: true,
      powderRoom: true
    }
  },
  {
    id: '21',
    name: 'MACK A 親子餐廳',
    lat: 22.991234,
    lng: 120.203456,
    address: '台南市中西區民生路二段200號',
    phone: '06-222-5678',
    reservation_link: 'https://www.facebook.com/macka.tainan',
    google_maps_link: 'https://maps.google.com/?q=22.991234,120.203456',
    images: ['21', '22'],
    facilities: {
      washingArea: true,
      heatingEquipment: true,
      restArea: true,
      sterilizationArea: true,
      powderRoom: true
    }
  },
  {
    id: '22',
    name: '南美館育嬰室',
    lat: 22.987654,
    lng: 120.202345,
    address: '台南市中西區樹林街二段37號',
    phone: '06-221-8881',
    reservation_link: 'https://www.tnam.museum/',
    google_maps_link: 'https://maps.google.com/?q=22.987654,120.202345',
    images: ['23', '24'],
    facilities: {
      washingArea: true,
      heatingEquipment: true,
      restArea: true,
      sterilizationArea: true,
      powderRoom: true
    }
  }
];

const CustomMarker = ({ position, onClick, name }: { 
  position: google.maps.LatLngLiteral, 
  onClick: () => void,
  name: string 
}) => {
  if (typeof window === 'undefined') return null;
  
  const { AdvancedMarkerElement } = google.maps.marker;
  if (!AdvancedMarkerElement) return null;

  const markerContent = document.createElement('div');
  markerContent.className = styles.markerContainer;
  
  const icon = document.createElement('img');
  icon.src = '/10.png';
  icon.style.width = '89px';
  icon.style.height = '60px';
  
  const label = document.createElement('div');
  label.textContent = name;
  label.style.color = '#7C695B';
  label.style.fontSize = '15px';
  label.style.fontFamily = 'Inter';
  label.className = styles.markerLabel;
  
  markerContent.appendChild(icon);
  markerContent.appendChild(label);

  const marker = new AdvancedMarkerElement({
    position,
    content: markerContent,
  });

  marker.addListener('click', onClick);
  
  return marker;
};

// 計算兩點之間的距離（使用 Haversine 公式）
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // 地球半徑（公里）
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // 返回公里數
};

// 添加类型定义
type Libraries = ('places' | 'geometry' | 'drawing' | 'visualization')[];

export default function FriendlyNursingMap() {
  const router = useRouter();
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [center, setCenter] = useState({ lat: 22.993364, lng: 120.204130 });
  const [activeNav, setActiveNav] = useState<number | null>(7);
  const [searchValue, setSearchValue] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [nearbyStores, setNearbyStores] = useState<Store[]>(stores);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<any[]>([]);

  // 當選擇新的店家時重置圖片索引
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [selectedStore]);

  // 更新獲取位置的 useEffect
  useEffect(() => {
    const getLocation = () => {
      if (navigator.geolocation) {
        const options = {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        };

        navigator.geolocation.getCurrentPosition(
          (position) => {
            const userLat = position.coords.latitude;
            const userLng = position.coords.longitude;
            
            // 檢查用戶是否在台南市範圍內（粗略範圍）
            const tainanBounds = {
              north: 23.1,
              south: 22.9,
              east: 120.3,
              west: 120.1
            };
            
            if (userLat >= tainanBounds.south && 
                userLat <= tainanBounds.north && 
                userLng >= tainanBounds.west && 
                userLng <= tainanBounds.east) {
              setCenter({ lat: userLat, lng: userLng });
            } else {
              // 如果不在台南，使用預設位置（台南新光三越）
              setCenter({ lat: 22.993364, lng: 120.204130 });
            }
            
            // 根據距離排序店家
            const sortedStores = [...stores].sort((a, b) => {
              const distanceA = calculateDistance(22.993364, 120.204130, a.lat, a.lng);
              const distanceB = calculateDistance(22.993364, 120.204130, b.lat, b.lng);
              return distanceA - distanceB;
            });
            
            setNearbyStores(sortedStores);
          },
          (error) => {
            console.error('Error getting location:', error);
            // 如果無法獲取位置，使用預設位置（台南新光三越）
            setCenter({ lat: 22.993364, lng: 120.204130 });
            setNearbyStores(stores);
          },
          options
        );
      } else {
        console.error('Geolocation is not supported by this browser.');
        // 如果瀏覽器不支援地理位置，使用預設位置
        setCenter({ lat: 22.993364, lng: 120.204130 });
        setNearbyStores(stores);
      }
    };

    getLocation();
  }, []);

  useEffect(() => {
    if (selectedStore) {
      console.log('Selected store images:', selectedStore.images);
    }
  }, [selectedStore]);

  const mapContainerStyle = {
    width: '100%',
    height: 'calc(100% - 60px)' // 減去導航欄高度
  };

  const handleNavClick = (num: number) => {
    setActiveNav(num);
    switch (num) {
      case 6:
        router.push('/features/voice-assistant');
        break;
      case 7:
        // 已經在地圖頁面，不需要跳轉
        break;
      case 8:
        router.push('/features/soothing-music');
        break;
      case 9:
        router.push('/features/Tutorial');
        break;
    }
  };

  const onMapLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
    setIsLoaded(true);
  }, []);

  // 當地圖和標記都準備好時，添加標記
  useEffect(() => {
    if (!map || !isLoaded || typeof window === 'undefined' || !window.google) return;

    try {
      // 清除舊的標記
      markers.forEach(marker => {
        if (marker && marker.setMap) {
          marker.setMap(null);
        }
      });
      
      // 添加新的標記
      const newMarkers = nearbyStores.map(store => {
        const marker = new google.maps.Marker({
          position: { lat: store.lat, lng: store.lng },
          map,
          icon: {
            url: '/10.png',
            scaledSize: new google.maps.Size(89, 60),
          },
          label: {
            text: store.name,
            color: '#7C695B',
            fontSize: '15px',
            fontFamily: 'Inter',
            className: styles.markerLabel
          }
        });

        marker.addListener('click', () => setSelectedStore(store));
        return marker;
      });

      // 添加用戶位置標記
      const userMarker = new google.maps.Marker({
        position: center,
        map,
        icon: {
          url: '/11.png',
          scaledSize: new google.maps.Size(50, 50),
          anchor: new google.maps.Point(25, 25),
        }
      });

      setMarkers([...newMarkers, userMarker]);
    } catch (error) {
      console.error('Error creating markers:', error);
    }
  }, [map, isLoaded, nearbyStores, center]);

  const mapOptions = {
    disableDefaultUI: true,  // 隱藏所有預設控制項
    zoomControl: true,      // 隱藏縮放控制
    mapTypeControl: false,   // 隱藏地圖類型切換
    streetViewControl: false, // 隱藏街景
    fullscreenControl: false, // 隱藏全螢幕按鈕
    gestureHandling: 'greedy'
  };

  return (
    <div className={styles.phoneContainer}>
      <div className={styles.container}>
        {/* 搜尋欄和使用者圖標 */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.searchBar}>
              <input
                type="text"
                placeholder="搜尋哺乳友善空間."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
              <button className={styles.searchIcon}>
                <Image
                  src="/Search.png"
                  alt="Search"
                  width={25}
                  height={25}
                />
              </button>
            </div>
            <div className={styles.userIcon}>
              <Image
                src="/User.png"
                alt="User"
                width={45}
                height={45}
                className={styles.userIcon}
                onClick={() => router.push('/features/baby-page')}
              />
            </div>
          </div>
        </div>

        {/* Google Maps */}
        <div className={styles.mapContainer}>
          <LoadScript 
            googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}
            loadingElement={<div>Loading Google Maps...</div>}
            onLoad={() => console.log('Google Maps Script loaded successfully')}
            onError={(error: Error) => console.error('Error loading Google Maps:', error)}
            libraries={['places']}
          >
            <GoogleMap
              mapContainerStyle={{
                width: '100%',
                height: '100%'
              }}
              center={center}
              zoom={15}
              options={{
                disableDefaultUI: true,
                zoomControl: true,
                mapTypeControl: false,
                streetViewControl: false,
                fullscreenControl: false,
                gestureHandling: 'cooperative',
                scrollwheel: true,
                draggable: true,
                keyboardShortcuts: false,
                styles: [
                  {
                    featureType: 'poi',
                    elementType: 'labels',
                    stylers: [{ visibility: 'off' }]
                  }
                ]
              }}
              onLoad={onMapLoad}
            />
          </LoadScript>
        </div>

        {selectedStore && (
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.2)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 1000,
            }}
            onClick={() => setSelectedStore(null)}
          >
            <div 
              style={{
                width: '350px',
                height: '400px',
                padding: '20px',
                paddingTop: '8px',  // 增加頂部內邊距
                borderRadius: '20px',
                boxShadow: '0 2px 4px rgba(200, 169, 154, 0.5)',
                fontFamily: 'Inter, sans-serif',
                position: 'relative',
                background: 'white',
                boxSizing: 'border-box',
              }}
              onClick={e => e.stopPropagation()}
            >
              <div>
                <div className={styles.infoHeader}>
                  <div className={styles.storeInfo}>
                    <Image
                      src="/logo.png"
                      alt="Store Logo"
                      width={55}
                      height={55}
                      className={styles.storeLogo}
                      style={{ marginTop: '-3px' }}
                    />
                    <div className={styles.storeDetails} style={{ marginTop: '-3px' }}>
                      <h3 className={styles.storeName}>{selectedStore.name}</h3>
                      <Image
                        src="/18.png"
                        alt="Rating"
                        width={90}
                        height={18}
                        className={styles.storeRating}
                      />
                    </div>
                  </div>
                  <div className={styles.navigationSection}>
                    <Image
                      src="/12.png"
                      alt="Navigation"
                      width={95}
                      height={44}
                      className={styles.navigationButton}
                      onClick={() => window.open(selectedStore.google_maps_link, '_blank')}
                      style={{ marginTop: '-8px' }}
                    />
                    <p className={styles.distance} style={{ marginTop: '-3px' }}>距離 86 公尺</p>
                  </div>
                </div>

                <div style={{ 
                  width: '350px',
                  height: '200px',
                  position: 'relative',
                  overflow: 'hidden',
                  marginBottom: '15px',
                  marginTop: '-10px',
                  transform: 'translateX(-20px)',
                }}>
                  <div style={{
                    display: 'flex',
                    gap: '0px',
                    transition: isDragging ? 'none' : 'transform 0.3s ease',
                    transform: `translateX(${currentImageIndex * -350}px)`,
                    cursor: 'grab',
                    userSelect: 'none',
                  }}
                    onMouseDown={(e) => {
                      setIsDragging(true);
                      setStartX(e.clientX);
                    }}
                    onMouseMove={(e) => {
                      if (isDragging) {
                        const diff = startX - e.clientX;
                        if (Math.abs(diff) > 50) {
                          if (diff > 0 && currentImageIndex < selectedStore.images.length - 1) {
                            setCurrentImageIndex(prev => prev + 1);
                            setIsDragging(false);
                          } else if (diff < 0 && currentImageIndex > 0) {
                            setCurrentImageIndex(prev => prev - 1);
                            setIsDragging(false);
                          }
                        }
                      }
                    }}
                    onMouseUp={() => setIsDragging(false)}
                    onMouseLeave={() => setIsDragging(false)}
                    onTouchStart={(e) => {
                      setIsDragging(true);
                      setStartX(e.touches[0].clientX);
                    }}
                    onTouchMove={(e) => {
                      if (isDragging) {
                        const diff = startX - e.touches[0].clientX;
                        if (Math.abs(diff) > 50) {
                          if (diff > 0 && currentImageIndex < selectedStore.images.length - 1) {
                            setCurrentImageIndex(prev => prev + 1);
                            setIsDragging(false);
                          } else if (diff < 0 && currentImageIndex > 0) {
                            setCurrentImageIndex(prev => prev - 1);
                            setIsDragging(false);
                          }
                        }
                      }
                    }}
                    onTouchEnd={() => setIsDragging(false)}
                  >
                    {selectedStore.images.map((image, index) => (
                      <Image
                        key={index}
                        src={`/${image}.png`}
                        alt={`Store ${index + 1}`}
                        width={350}
                        height={200}
                        style={{
                          objectFit: 'cover',
                          flexShrink: 0,
                          borderRadius: '0px',
                        }}
                        draggable={false}
                      />
                    ))}
                  </div>
                  
                  <div style={{
                    position: 'absolute',
                    bottom: '10px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    gap: '8px',
                    zIndex: 2,
                  }}>
                    {selectedStore.images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          border: 'none',
                          background: currentImageIndex === index 
                            ? 'rgba(255, 255, 255, 0.9)'
                            : 'rgba(255, 255, 255, 0.5)',
                          cursor: 'pointer',
                          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
                        }}
                      />
                    ))}
                  </div>
                </div>

                <div className={styles.facilities} style={{ padding: '0 0 0 -5px' }}>
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    gap: '12px',
                    width: '100%',
                    marginLeft: '-8px',
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'flex-start',
                      width: '100%',
                      gap: '20px'
                    }}>
                      {selectedStore.facilities.washingArea && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '95px' }}>
                          <Image
                            src="/16.png"
                            alt="清洗區"
                            width={35}
                            height={35}
                            className={styles.facilityIcon}
                          />
                          <span style={{ color: '#C8A99A', fontSize: '14px', whiteSpace: 'nowrap' }}>清洗區</span>
                        </div>
                      )}
                      {selectedStore.facilities.heatingEquipment && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '95px' }}>
                          <Image
                            src="/15.png"
                            alt="加熱設備"
                            width={35}
                            height={35}
                            className={styles.facilityIcon}
                          />
                          <span style={{ color: '#C8A99A', fontSize: '14px', whiteSpace: 'nowrap' }}>加熱設備</span>
                        </div>
                      )}
                      {selectedStore.facilities.restArea && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '95px' }}>
                          <Image
                            src="/17.png"
                            alt="休息區"
                            width={35}
                            height={35}
                            className={styles.facilityIcon}
                          />
                          <span style={{ color: '#C8A99A', fontSize: '14px', whiteSpace: 'nowrap' }}>休息區</span>
                        </div>
                      )}
                    </div>
                    
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'flex-start',
                      width: '100%',
                      gap: '10px'
                    }}>
                      {selectedStore.facilities.sterilizationArea && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '95px' }}>
                          <Image
                            src="/14.png"
                            alt="奶瓶消毒區"
                            width={35}
                            height={35}
                            className={styles.facilityIcon}
                          />
                          <span style={{ color: '#C8A99A', fontSize: '14px', whiteSpace: 'nowrap' }}>消毒區</span>
                        </div>
                      )}
                      {selectedStore.facilities.powderRoom && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '95px' }}>
                          <Image
                            src="/19.png"
                            alt="化妝室"
                            width={35}
                            height={35}
                            className={styles.facilityIcon}
                          />
                          <span style={{ color: '#C8A99A', fontSize: '14px', whiteSpace: 'nowrap' }}>化妝室</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <Image
                  src="/13.png"
                  alt="Reserve"
                  width={95}
                  height={44}
                  className={styles.reserveButton}
                  onClick={() => router.push(`/features/reservation?storeName=${encodeURIComponent(selectedStore.name)}`)}
                  style={{ bottom: '15px' }}
                />
              </div>
            </div>
          </div>
        )}

        <nav className={styles.navbar}>
          <button 
            className={`${styles.navButton} ${activeNav === 6 ? styles.activeNav : ''}`}
            onClick={() => handleNavClick(6)}
          >
            <Image src="/06.png" alt="AI助手" width={40} height={40} />
            <span className={styles.navText}>AI助手</span>
          </button>
          <button 
            className={`${styles.navButton} ${activeNav === 7 ? styles.activeNav : ''}`}
            onClick={() => handleNavClick(7)}
          >
            <Image src="/07.png" alt="友善地圖" width={40} height={40} />
            <span className={styles.navText}>友善地圖</span>
          </button>
          <button 
            className={`${styles.navButton} ${activeNav === 8 ? styles.activeNav : ''}`}
            onClick={() => handleNavClick(8)}
          >
            <Image src="/08.png" alt="舒緩音樂" width={40} height={40} />
            <span className={styles.navText}>舒緩音樂</span>
          </button>
          <button 
            className={`${styles.navButton} ${activeNav === 9 ? styles.activeNav : ''}`}
            onClick={() => handleNavClick(9)}
          >
            <Image src="/09.png" alt="教學" width={40} height={40} />
            <span className={styles.navText}>教學</span>
          </button>
        </nav>
      </div>
    </div>
  );
}