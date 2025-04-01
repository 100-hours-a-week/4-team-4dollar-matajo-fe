import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { API_PATHS } from '../src/constants/api';
import axios from 'axios';

const MapBottomSheet = ({ locationInfoId }) => {
  const router = useRouter();
  const [recentTrades, setRecentTrades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentTrades = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `${API_PATHS.TRADES.RECENT_BY_LOCATION}?locationInfoId=${locationInfoId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        setRecentTrades(response.data.data);
      } catch (error) {
        console.error('최근 거래내역 조회 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    if (locationInfoId) {
      fetchRecentTrades();
    }
  }, [locationInfoId]);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">최근 거래내역</h2>
        <Link href="/mypage/rmypage/registration/step1" className="text-blue-500">
          보관소 등록하기
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-4">로딩 중...</div>
      ) : recentTrades.length > 0 ? (
        <div className="space-y-4">
          {recentTrades.map((trade, index) => (
            <div key={index} className="flex items-center space-x-4 p-2 border rounded-lg">
              <img
                src={trade.mainImage}
                alt={trade.productName}
                className="w-16 h-16 object-cover rounded"
              />
              <div className="flex-1">
                <h3 className="font-semibold">{trade.productName}</h3>
                <p className="text-sm text-gray-600">{trade.category}</p>
                <p className="text-sm text-gray-500">{trade.tradeDate}</p>
                <p className="text-sm font-bold">{trade.tradePrice.toLocaleString()}원</p>
                <p className="text-xs text-gray-500">보관기간: {trade.storagePeriod}일</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4 text-gray-500">최근 거래내역이 없습니다.</div>
      )}
    </div>
  );
};

export default MapBottomSheet;
