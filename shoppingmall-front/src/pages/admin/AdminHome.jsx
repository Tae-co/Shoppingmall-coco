import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import {
  Card,
  DashCard,
  Dashboard,
  DashCardTitle,
  DashCardValue,
  DashCardTrend
} from '../../styles/admincommon';

const WelcomeBanner = styled.div`
  background: linear-gradient(90deg, #4e54c8, #8f94fb);
  color: white;
  padding: 20px 30px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
`;

const WelcomeTitle = styled.h2`
  font-size: 24px;
  font-weight: bold;
  margin: 0 0 5px 0;
`;

const WelcomeText = styled.p`
  font-size: 16px;
  margin: 0;
`;

const MenuSection = styled(Card)`
  margin-bottom: ${props => props.theme.spacing.large};
`;

const MenuTitle = styled.h3`
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 15px;
`;

const MenuLink = styled(Link)`
  display: inline-block;
  padding: 12px 20px;
  background: #333;
  color: white;
  text-decoration: none;
  border-radius: 5px;
  font-size: 15px;
  margin-right: 10px;
  transition: background 0.2s;

  &:hover {
    background: #555;
  }
`;

const MenuButtonDisabled = styled.button`
  display: inline-block;
  padding: 12px 20px;
  background: #aaa;
  color: white;
  text-decoration: none;
  border-radius: 5px;
  font-size: 15px;
  margin-right: 10px;
  border: none;
  cursor: not-allowed;
`;

const MainGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
`;

const MainCard = styled(Card)` 
  min-height: 300px;
`;

const MainCardTitle = styled.h3`
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 20px;
  margin-top: 0;
`;

const ChartPlaceholder = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 250px;
  background: #f9f9f9;
  color: #aaa;
  border-radius: 4px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
`;

const Th = styled.th`
  padding: 10px;
  border-bottom: 1px solid #eee;
  text-align: left;
  background: #fafafa;
`;

const Td = styled.td`
  padding: 10px;
  border-bottom: 1px solid #eee;
`;
// ---------------------------------

function AdminHome() {
  return (
    <>
      {/* --- 상단 환영 배너 --- */}
      <WelcomeBanner>
        <WelcomeTitle>안녕하세요, 관리자님 👋</WelcomeTitle>
        <WelcomeText>오늘도 Coco와 함께 성공적인 하루를 보내세요!</WelcomeText>
      </WelcomeBanner>

      {/* --- 바로가기 메뉴 --- */}
      <MenuSection>
        <MenuTitle>메뉴 바로가기</MenuTitle>

        <MenuLink to="/admin/products">
          상품 관리
        </MenuLink>

        <MenuLink to="/admin/categories">
          카테고리 관리
        </MenuLink>

        <MenuLink to="/admin/members">
          회원 관리
        </MenuLink>
        <MenuButtonDisabled disabled>
          주문 관리 (준비중)
        </MenuButtonDisabled>
      </MenuSection>

      {/* --- 4개 통계 카드 --- */}
      <Dashboard>
        <DashCard>
          <DashCardTitle>오늘 매출</DashCardTitle>
          <DashCardValue>₩19.5M</DashCardValue>
          <DashCardTrend $up>▲ +12.5%</DashCardTrend>
        </DashCard>
        <DashCard>
          <DashCardTitle>총 주문</DashCardTitle>
          <DashCardValue>389</DashCardValue>
          <DashCardTrend $up>▲ +8.2%</DashCardTrend>
        </DashCard>
        <DashCard>
          <DashCardTitle>신규 고객</DashCardTitle>
          <DashCardValue>52</DashCardValue>
          <DashCardTrend $up>▲ +15.3%</DashCardTrend>
        </DashCard>
        <DashCard>
          <DashCardTitle>전환율</DashCardTitle>
          <DashCardValue>3.2%</DashCardValue>
          <DashCardTrend>▼ -0.1%</DashCardTrend>
        </DashCard>
      </Dashboard>

      {/* --- 차트 및 목록 섹션 --- */}
      <MainGrid>

        {/* 주간 매출 추이 (차트) */}
        <MainCard style={{ gridColumn: 'span 2' }}>
          <MainCardTitle>주간 매출 추이</MainCardTitle>
          <ChartPlaceholder>
            (주간 매출 라인 차트가 표시될 영역입니다)
          </ChartPlaceholder>
        </MainCard>

        {/* 카테고리별 판매 (차트) */}
        <MainCard>
          <MainCardTitle>카테고리별 판매</MainCardTitle>
          <ChartPlaceholder>
            (카테고리별 바 차트가 표시될 영역입니다)
          </ChartPlaceholder>
        </MainCard>

        {/* 최근 주문 (목록) */}
        <MainCard>
          <MainCardTitle>최근 주문</MainCardTitle>
          <Table>
            <thead>
              <tr>
                <Th>주문번호</Th>
                <Th>고객명</Th>
                <Th>금액</Th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <Td>ORD-2024110701</Td>
                <Td>김민지</Td>
                <Td>55,000원</Td>
              </tr>
              <tr>
                <Td>ORD-2024110702</Td>
                <Td>이서현</Td>
                <Td>28,000원</Td>
              </tr>
            </tbody>
          </Table>
        </MainCard>
      </MainGrid>

    </>
  );
}

export default AdminHome;