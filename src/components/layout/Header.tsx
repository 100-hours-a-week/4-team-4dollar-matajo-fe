import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';

const HeaderContainer = styled.div`
  width: 480px;
  height: 47px;
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  top: 0;
  background: #f5f5ff;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Title = styled.div`
  color: #464646;
  font-size: 15px;
  font-family: 'Noto Sans KR';
  font-weight: 700;
  letter-spacing: 0.02px;
  word-wrap: break-word;
`;

const BackButton = styled.div`
  width: 24px;
  height: 24px;
  position: absolute;
  left: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;

const BackArrow = styled.div`
  width: 24px;
  height: 24px;
  background: url("data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M15 18L9 12L15 6' stroke='%235E5CFD' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")
    no-repeat center center;
`;

const OptionButton = styled.div`
  position: absolute;
  right: 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  cursor: pointer;
`;

const OptionDot = styled.div`
  width: 3px;
  height: 3px;
  background: #464646;
  border-radius: 9999px;
`;

// 드롭다운 메뉴 스타일
const DropdownContainer = styled.div<{ isVisible: boolean }>`
  width: 190px;
  height: 101px;
  position: absolute;
  top: 50px;
  right: 5px;
  background-color: #f5f5ff;
  border-radius: 5px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
  z-index: 1001;
  display: ${props => (props.isVisible ? 'block' : 'none')};
  padding: 5px 0;
`;

const DropdownItem = styled.div`
  display: flex;
  align-items: center;
  padding: 6px 12px;
  cursor: pointer;
  position: relative;
  color: #5c5757;

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }

  &.delete {
    color: #ff4b4b;
  }
`;

const DropdownIcon = styled.span`
  margin-right: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  color: #5c5757;
`;

const Divider = styled.div<{ top: number }>`
  width: 177px;
  height: 0px;
  left: 7px;
  top: ${props => props.top}px;
  position: absolute;
  outline: 0.3px white solid;
  outline-offset: -0.15px;
`;

// 드롭다운 옵션 타입 정의
export interface HeaderDropdownOption {
  id: string;
  label: string;
  icon: string | JSX.Element;
  color?: string;
  onClick: () => void;
}

// Props 타입 정의
interface HeaderProps {
  title: string;
  showBackButton?: boolean;
  showOptionButton?: boolean;
  onBack?: () => void;
  dropdownOptions?: HeaderDropdownOption[];
}

// 헤더 컴포넌트
const Header: React.FC<HeaderProps> = ({
  title,
  showBackButton = false,
  showOptionButton = false,
  onBack,
  dropdownOptions = [],
}) => {
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleBackClick = () => {
    if (onBack) {
      onBack();
    } else {
      console.log('Back button clicked');
      // 실제 구현에서는 라우터 history를 이용한 뒤로가기 기능 구현
    }
  };

  const toggleDropdown = (event: React.MouseEvent) => {
    event?.stopPropagation();
    setIsDropdownVisible(!isDropdownVisible);
  };

  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as Node;
    const optionBtn = document.querySelector('[data-option-btn="true"]');
    if (optionBtn && optionBtn.contains(target)) {
      return;
    }
    if (dropdownRef.current && !dropdownRef.current.contains(target)) {
      setIsDropdownVisible(false);
    }
  };

  useEffect(() => {
    // 드롭다운이 열려있을 때만 이벤트 리스너 추가
    if (isDropdownVisible) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isDropdownVisible]);

  const handleOptionClick = (optionHandler: () => void) => {
    optionHandler();
    setIsDropdownVisible(false);
  };

  return (
    <HeaderContainer>
      {showBackButton && (
        <BackButton onClick={handleBackClick}>
          <BackArrow />
        </BackButton>
      )}

      <Title>{title}</Title>

      {showOptionButton && (
        <>
          <OptionButton onClick={e => toggleDropdown(e)} data-option-btn="true">
            <OptionDot />
            <OptionDot />
            <OptionDot />
          </OptionButton>

          {/* 드롭다운 메뉴 */}
          <DropdownContainer isVisible={isDropdownVisible} ref={dropdownRef}>
            {dropdownOptions.map((option, index) => (
              <React.Fragment key={option.id}>
                <DropdownItem
                  onClick={() => handleOptionClick(option.onClick)}
                  className={option.color === '#ff4b4b' ? 'delete' : ''}
                >
                  <DropdownIcon style={{ color: option.color }}>{option.icon}</DropdownIcon>
                  {option.label}
                </DropdownItem>
                {index < dropdownOptions.length - 1 && <Divider top={(index + 1) * 38 - 1} />}
              </React.Fragment>
            ))}
          </DropdownContainer>
        </>
      )}
    </HeaderContainer>
  );
};

export default Header;
