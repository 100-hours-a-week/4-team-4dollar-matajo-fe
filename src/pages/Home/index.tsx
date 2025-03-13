import React from 'react';

const HomePage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">마타조에 오신 것을 환영합니다</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-lg mb-4">마타조 프로젝트는 4시간 4달러 팀에서 개발한 웹 서비스입니다.</p>
        <p className="text-gray-600">이곳에 프로젝트에 대한 소개와 기능 설명을 추가하세요.</p>
      </div>
    </div>
  );
};

export default HomePage;
