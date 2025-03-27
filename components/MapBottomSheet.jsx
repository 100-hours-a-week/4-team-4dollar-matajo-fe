import Link from 'next/link';
import { useRouter } from 'next/router';

const MapBottomSheet = () => {
  const router = useRouter();

  return (
    <Link href="/mypage/rmypage/registration/step1">{/* Rest of the component content */}</Link>
  );
};

export default MapBottomSheet;
