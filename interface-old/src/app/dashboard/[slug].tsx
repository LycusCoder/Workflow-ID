import React from 'react';
import { useRouter } from 'next/router';
import Beranda from './beranda';
import Laporan from './laporan';
import Absensi from './absensi';
import Tugas from './tugas';
import Pengaturan from './pengaturan';

const DynamicDashboard = () => {
  const router = useRouter();
  const { slug } = router.query;

  const renderContent = () => {
    switch (slug) {
      case 'laporan':
        return <Laporan />;
      case 'absensi':
        return <Absensi />;
      case 'tugas':
        return <Tugas />;
      case 'pengaturan':
        return <Pengaturan />;
      default:
        return <Beranda />;
    }
  };

  return (
    <div>
      {renderContent()}
    </div>
  );
};

export default DynamicDashboard;